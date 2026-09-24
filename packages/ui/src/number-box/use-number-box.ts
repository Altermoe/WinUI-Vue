/**
 * NumberBox 取值层：受控 / 非受控取值 + WinUI 的「Value ↔ Text」双通道。
 *
 * - 受控（传了 modelValue）：值的事实源在父级，本层只把新值向上抛出，等父级回写；
 * - 非受控：本地值（localValue）持有事实源，defaultValue 只作为初值；
 * - `draft` 是输入框里正在编辑的文本。WinUI 的两个方向都要还原：
 *     Value → Text：值变化时用格式化文本回写输入框（`UpdateTextToValue`）
 *     Text  → Value：失焦 / 回车时解析文本再更新值（`ValidateInput`）
 *
 * 只依赖 computed / ref / watch，不依赖组件实例，可直接在测试里调用。
 */
import { computed, ref, watch } from 'vue'
import type { ComputedRef, Ref } from 'vue'
import { DEFAULT_MAXIMUM, DEFAULT_MINIMUM, DEFAULT_VALIDATION_MODE } from './constants'
import { evaluateExpression } from './expression'
import { formatNumberValue, resolveInputMode } from './format'
import type { NumberFormatSettings } from './format'
import { parseNumberText } from './parse'
import { coerceValue, isSpinButtonDisabled, normalizeValue, stepValue } from './step'
import type { NumberBoxSpinDirection, NumberBoxStepOptions } from './step'
import type { FluereNumberBoxValidationMode, FluereNumberBoxValueChangedEventArgs } from './types'

/** 本层用到的 props 视图（全部可选：缺省值在本层兜底，便于脱离组件单测） */
export interface NumberBoxValueProps {
  modelValue?: number | null
  defaultValue?: number | null
  min?: number
  max?: number
  disabled?: boolean
  wrapEnabled?: boolean
  validationMode?: FluereNumberBoxValidationMode
  acceptsExpression?: boolean
  locale?: string
  formatOptions?: Intl.NumberFormatOptions
}

/**
 * 本层向上触发的具名事件。
 * 组件里 defineEmits 生成的 emit 携带重载签名、不便跨模块传递，
 * 这里按 ScrollView / Slider 的 events 层思路改成具名方法，组件侧用一行适配接上。
 */
export interface NumberBoxValueEvents {
  /** 值变化（对应 update:modelValue） */
  valueChange: (value: number | null) => void
  /** 值变化（对应 WinUI ValueChanged，带新旧值） */
  valueChanged: (args: FluereNumberBoxValueChangedEventArgs) => void
}

/** 文本结算结果：`invalid` 表示非法输入（无法解析 / 表达式求值失败） */
export type NumberBoxParseOutcome = number | null | 'invalid'

/** 取值层对外暴露的状态与回调 */
export interface NumberBoxValueModel {
  /** 当前值（null = 无值，对应 WinUI 的 NaN） */
  currentValue: ComputedRef<number | null>
  /** 当前值的格式化文本 */
  displayText: ComputedRef<string>
  /** 输入框里正在编辑的文本 */
  draft: Ref<string>
  /** 输入框是否持有焦点（紧凑模式弹层 / 滚轮步进都依赖它） */
  isFocused: Ref<boolean>
  /** 软键盘类型 */
  inputMode: ComputedRef<'decimal' | 'numeric'>
  /** 用户输入写入 draft */
  onDraftUpdate: (text: string) => void
  /** 获得焦点 */
  handleFocus: () => void
  /** 失焦：结算文本（WinUI `OnNumberBoxLostFocus` → `ValidateInput`） */
  handleBlur: () => void
  /** 结算草稿文本：失焦 / 回车 / 步进前调用 */
  commitText: () => NumberBoxParseOutcome
  /** 丢弃草稿、回到当前值的文本（WinUI Escape → `UpdateTextToValue`） */
  revertText: () => void
  /** 按步长步进一次 */
  stepBy: (change: number) => void
  /** 增减按钮是否禁用 */
  isSpinDisabled: (direction: NumberBoxSpinDirection) => boolean
}

export const useNumberBox = (
  props: NumberBoxValueProps,
  events: NumberBoxValueEvents,
): NumberBoxValueModel => {
  /** 非受控模式下的本地值 */
  const localValue = ref<number | null>(normalizeValue(props.defaultValue))
  const isFocused = ref(false)

  const currentValue = computed<number | null>(() =>
    props.modelValue === undefined ? localValue.value : normalizeValue(props.modelValue),
  )

  const settings = computed<NumberFormatSettings>(() => ({
    locale: props.locale,
    formatOptions: props.formatOptions,
  }))

  const stepOptions = computed<NumberBoxStepOptions>(() => ({
    min: props.min ?? DEFAULT_MINIMUM,
    max: props.max ?? DEFAULT_MAXIMUM,
    wrapEnabled: props.wrapEnabled === true,
    validationMode: props.validationMode ?? DEFAULT_VALIDATION_MODE,
  }))

  const displayText = computed(() => formatNumberValue(currentValue.value, settings.value))
  const inputMode = computed(() => resolveInputMode(settings.value))

  /** 编辑中的文本：初值取当前值的格式化结果，值变化时同步回写 */
  const draft = ref(displayText.value)
  watch(displayText, (text) => {
    draft.value = text
  })

  /** 写入值并回写文本：值未变时也要回写（WinUI ValidateInput 的既有行为） */
  const writeValue = (next: number | null): void => {
    const previous = currentValue.value
    if (previous !== next) {
      localValue.value = next
      events.valueChanged({ oldValue: previous, newValue: next })
      events.valueChange(next)
    }
    draft.value = formatNumberValue(next, settings.value)
  }

  /** 把草稿文本解析成值（对应 WinUI `ValidateInput` 中的解析分支） */
  const parseDraft = (): NumberBoxParseOutcome => {
    const trimmed = draft.value.trim()
    if (trimmed === '') {
      // 输入被清空 → WinUI 把 Value 置为 NaN
      return null
    }

    if (props.acceptsExpression === true) {
      const computedValue = evaluateExpression(trimmed, settings.value)
      if (computedValue === null) {
        return 'invalid'
      }
      // 表达式求值出的 NaN（除以 0）等价于「无值」
      return Number.isNaN(computedValue) ? null : coerceValue(computedValue, stepOptions.value)
    }

    const parsed = parseNumberText(trimmed, settings.value)
    if (parsed.status === 'empty') {
      return null
    }
    if (parsed.status === 'invalid') {
      return 'invalid'
    }
    return coerceValue(parsed.value, stepOptions.value)
  }

  const commitText = (): NumberBoxParseOutcome => {
    const result = parseDraft()
    if (result === 'invalid') {
      // InvalidInputOverwritten：用当前值的格式化文本盖掉非法输入；
      // Disabled 模式：保留用户输入，交由消费方自行校验
      if ((props.validationMode ?? DEFAULT_VALIDATION_MODE) !== 'disabled') {
        draft.value = displayText.value
      }
      return result
    }
    writeValue(result)
    return result
  }

  const revertText = (): void => {
    draft.value = displayText.value
  }

  const stepBy = (change: number): void => {
    if (props.disabled === true) {
      return
    }
    // WinUI StepValue：先 ValidateInput（把未提交的文本结算成值），再基于结算后的值步进
    const committed = commitText()
    const base = committed === 'invalid' ? currentValue.value : committed
    if (base === null) {
      // 无值时 WinUI 的 StepValue 直接返回（输入框为空时按方向键不产生任何变化）
      return
    }
    writeValue(stepValue(base, change, stepOptions.value))
  }

  const isSpinDisabled = (direction: NumberBoxSpinDirection): boolean =>
    isSpinButtonDisabled(direction, currentValue.value, {
      ...stepOptions.value,
      disabled: props.disabled === true,
    })

  return {
    currentValue,
    displayText,
    draft,
    isFocused,
    inputMode,
    onDraftUpdate: (text: string) => {
      draft.value = text
    },
    handleFocus: () => {
      isFocused.value = true
    },
    handleBlur: () => {
      isFocused.value = false
      commitText()
    },
    commitText,
    revertText,
    stepBy,
    isSpinDisabled,
  }
}
