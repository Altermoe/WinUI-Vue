/**
 * Combobox 取值层：受控 / 非受控取值 + WinUI 的「SelectedValue ↔ Text」双通道。
 *
 * - 受控（传了 modelValue）：值的事实源在父级，本层只把新值向上抛出，等父级回写；
 * - 非受控：本地值（localValue）持有事实源，defaultValue 只作为初值；
 * - 可编辑态的文本同理（text / localText），并还原 WinUI 的双向同步：
 *     值 → 文本：选中变化 / 父级改写 modelValue 时用项文本回填 Text；
 *     文本例外：提交自定义文本（keepText）时保留用户输入，不用新值覆盖。
 * - 唯一写入选中项的入口是 `setValue`，提交时机（committed / always）由调用方决定。
 *
 * 只依赖 computed / ref / watch，不依赖组件实例，可直接在测试里调用。
 */
import { computed, ref, watch } from 'vue'
import type { ComputedRef } from 'vue'
import { INDEX_NOT_FOUND } from './constants'
import type { ItemStep } from './constants'
import {
  findBoundaryIndex,
  findEnabledIndex,
  findItemIndex,
  isSameValue,
  textOfValue,
} from './items'
import type { ItemComparator } from './items'
import type { FluereComboboxItem, FluereComboboxSelectionChangedEventArgs } from './types'

/** 本层用到的 props 视图（全部可选：undefined = 非受控，便于脱离组件单测） */
export interface ComboboxSelectionProps<T> {
  modelValue?: T | null
  defaultValue?: T | null
  items?: readonly FluereComboboxItem<T>[]
  by?: ItemComparator<T>
  /** 是否可编辑（决定 setValue 后是否回填文本） */
  editable?: boolean
  /** 可编辑态文本（受控 → 父级；undefined = 非受控） */
  text?: string
  defaultText?: string
}

/**
 * 本层向上触发的具名事件。
 *
 * 组件里 defineEmits 生成的 emit 携带重载签名、不便跨模块传递，按
 * NumberBox / Slider 的 events 层思路改成具名方法，组件侧一行适配接上。
 */
export interface ComboboxSelectionEvents<T> {
  /** 选中值变化（对应 update:modelValue） */
  valueChange: (value: T | null) => void
  /** 选中变化（对应 WinUI `SelectionChanged`） */
  selectionChanged: (args: FluereComboboxSelectionChangedEventArgs<T>) => void
  /** 可编辑态文本变化（对应 update:text） */
  textChange: (value: string) => void
}

/** `setValue` 的附加选项 */
export interface ComboboxSetValueOptions {
  /** 保留用户已输入文本（可编辑态提交自定义文本），不用新值覆盖 */
  keepText?: boolean
}

/** 取值层对外暴露的状态与回调 */
export interface ComboboxSelectionModel<T> {
  /** 下拉项（`items ?? []`） */
  entries: ComputedRef<readonly FluereComboboxItem<T>[]>
  /** 当前值：受控取 props.modelValue，非受控取本地值 */
  currentValue: ComputedRef<T | null>
  /** 当前值在项集合中的下标；无选中 -1（WinUI `SelectedIndex = -1`） */
  selectedIndex: ComputedRef<number>
  /** 可编辑态当前文本：受控取 props.text，非受控取本地文本 */
  currentText: ComputedRef<string>
  /** 非可编辑态输入框显示的选中项文本（ContentPresenter 的 SelectionBoxItem） */
  displayText: ComputedRef<string>
  /** 输入框的受控文本：可编辑态是用户文本，否则是选中项文本 */
  inputText: ComputedRef<string>
  /** 表单提交值（对应 WinUI `SelectedValue`） */
  formValue: ComputedRef<string>
  /** 传给 reka 的受控值（null → undefined 的类型放宽，运行时值不变） */
  rootModelValue: ComputedRef<T | undefined>
  /** 传给 reka 的非受控初始值 */
  rootDefaultValue: ComputedRef<T | undefined>
  /** 某个值的显示文本：显式 text → 命中项 text → String(value) */
  textOfValue: (value: T | null) => string
  /** 写入可编辑态文本 */
  setText: (value: string) => void
  /** 改写选中项（唯一入口；提交时机由调用方把关） */
  setValue: (next: T | null, options?: ComboboxSetValueOptions) => void
  /** 按下标选中（项不存在时忽略） */
  selectByIndex: (index: number) => void
  /** 方向键改选中项（WinUI `Selector.SelectNext / SelectPrev`） */
  selectRelative: (step: ItemStep) => void
  /** `Home` / `End`：首 / 尾可选项 */
  selectBoundary: (edge: 'first' | 'last') => void
  /** 挂载时用选中项文本填充文本框（WinUI `Text ← SelectedItem`；消费方未显式给文本时） */
  initEditableText: () => void
}

export const useComboboxSelection = <T>(
  props: ComboboxSelectionProps<T>,
  events: ComboboxSelectionEvents<T>,
): ComboboxSelectionModel<T> => {
  const entries = computed<readonly FluereComboboxItem<T>[]>(() => props.items ?? [])

  /* 值：受控 → 父级；非受控 → localValue（defaultValue 只作初值） */
  const localValue = ref<T | null>(props.defaultValue ?? null)
  const currentValue = computed<T | null>(() =>
    props.modelValue === undefined ? localValue.value : (props.modelValue ?? null),
  )
  const selectedIndex = computed(() => findItemIndex(entries.value, currentValue.value, props.by))

  /* 可编辑态文本：受控 → 父级；非受控 → localText */
  const localText = ref(props.defaultText ?? '')
  const currentText = computed(() => (props.text === undefined ? localText.value : props.text))

  const valueTextOf = (value: T | null): string => textOfValue(entries.value, value, props.by)

  const displayText = computed(() => valueTextOf(currentValue.value))
  const inputText = computed(() => (props.editable ? currentText.value : displayText.value))
  const formValue = computed(() => (currentValue.value === null ? '' : String(currentValue.value)))

  /**
   * 传给 reka 的受控值 / 初始值。
   *
   * reka 把 `modelValue` 声明为 `T | T[] | undefined`，类型上不含 `null`；但它的
   * `AcceptableValue` 本身包含 `null`，项比较（`compare` / `by`）也是 null 安全的，
   * 而「无选中」在 WinUI 里正是 `SelectedItem = null`。这里只做类型放宽，运行时值不变。
   */
  const rootModelValue = computed(() => currentValue.value as unknown as T | undefined)
  const rootDefaultValue = computed(
    () => (props.defaultValue ?? undefined) as unknown as T | undefined,
  )

  const setText = (value: string): void => {
    if (value === currentText.value) {
      return
    }
    if (props.text === undefined) {
      localText.value = value
    }
    events.textChange(value)
  }

  /** 受控模式下父级改写值时同步文本；keepText 用于「提交自定义文本」后保留用户输入 */
  let keepTextOnNextPropChange = false

  const syncTextFromProp = (value: T | null | undefined): void => {
    if (!props.editable) {
      return
    }
    if (keepTextOnNextPropChange) {
      keepTextOnNextPropChange = false
      return
    }
    setText(valueTextOf(value ?? null))
  }

  watch(() => props.modelValue, syncTextFromProp)

  const setValue = (next: T | null, options?: ComboboxSetValueOptions): void => {
    const previous = currentValue.value
    if (!isSameValue(previous, next, props.by)) {
      if (props.modelValue === undefined) {
        localValue.value = next
      }
      keepTextOnNextPropChange = options?.keepText === true
      events.valueChange(next)
      events.selectionChanged({
        addedItem: next,
        removedItem: previous,
        addedIndex: findItemIndex(entries.value, next, props.by),
        removedIndex: findItemIndex(entries.value, previous, props.by),
      })
    }
    if (props.editable && options?.keepText !== true) {
      setText(valueTextOf(next))
    }
  }

  const selectByIndex = (index: number): void => {
    const item = entries.value[index]
    if (item !== undefined) {
      setValue(item.value)
    }
  }

  const selectRelative = (step: ItemStep): void => {
    const index = findEnabledIndex(entries.value, selectedIndex.value, step)
    if (index !== INDEX_NOT_FOUND) {
      selectByIndex(index)
    }
  }

  const selectBoundary = (edge: 'first' | 'last'): void => {
    const index = findBoundaryIndex(entries.value, edge)
    if (index !== INDEX_NOT_FOUND) {
      selectByIndex(index)
    }
  }

  const initEditableText = (): void => {
    if (props.editable && props.text === undefined && localText.value === '') {
      localText.value = valueTextOf(currentValue.value)
    }
  }

  return {
    entries,
    currentValue,
    selectedIndex,
    currentText,
    displayText,
    inputText,
    formValue,
    rootModelValue,
    rootDefaultValue,
    textOfValue: valueTextOf,
    setText,
    setValue,
    selectByIndex,
    selectRelative,
    selectBoundary,
    initEditableText,
  }
}
