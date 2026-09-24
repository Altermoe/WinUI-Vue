/* oxlint-disable no-magic-numbers -- 断言里的字面量就是被测输入与期望值，抽成常量反而更难读 */
/**
 * 取值层：受控 / 非受控取值 + WinUI 的 Value ↔ Text 双通道。
 *
 * 该 hook 只依赖 ref / computed / watch，不依赖组件实例 —— 直接调用即可，无需挂载；
 * 组件侧的契约测试只负责验证这些回调真的绑到了模板上。
 */
import { describe, expect, it, vi } from 'vitest'
import { reactive } from 'vue'
import { useNumberBox } from '../use-number-box'
import type { NumberBoxValueEvents, NumberBoxValueProps } from '../use-number-box'

const createHarness = (props: NumberBoxValueProps = {}) => {
  const state = reactive<NumberBoxValueProps>({ ...props })
  const valueChange = vi.fn()
  const valueChanged = vi.fn()
  const events: NumberBoxValueEvents = { valueChange, valueChanged }
  const model = useNumberBox(state, events)
  return { state, model, valueChange, valueChanged }
}

describe('useNumberBox 取值通道', () => {
  it('非受控：defaultValue 生效，draft 是格式化后的文本', () => {
    const { model } = createHarness({ defaultValue: 1234 })
    expect(model.currentValue.value).toBe(1234)
    expect(model.draft.value).toBe('1,234')
  })

  it('无值时 draft 为空串（显示 PlaceholderText）', () => {
    const { model } = createHarness()
    expect(model.currentValue.value).toBeNull()
    expect(model.draft.value).toBe('')
  })

  it('受控：以 modelValue 为事实源，写入只抛事件不本地生效', () => {
    const { model, state, valueChange, valueChanged } = createHarness({ modelValue: 5 })
    model.stepBy(1)

    expect(model.currentValue.value).toBe(5)
    expect(valueChange).toHaveBeenLastCalledWith(6)
    expect(valueChanged).toHaveBeenLastCalledWith({ oldValue: 5, newValue: 6 })
    // 父级回写后同步（WinUI 的 x:Bind TwoWay 就是这条路径）
    state.modelValue = 6
    expect(model.currentValue.value).toBe(6)
    expect(model.draft.value).toBe('6')
  })

  it('值未变化时不抛事件，但仍回写文本（WinUI ValidateInput 的既有行为）', () => {
    const { model, valueChange } = createHarness({ modelValue: 3, acceptsExpression: true })
    model.onDraftUpdate('1 + 2')
    expect(model.commitText()).toBe(3)
    expect(valueChange).not.toHaveBeenCalled()
    expect(model.draft.value).toBe('3')
  })

  it('WinUI 的 NaN 语义：null 表示「无值」，可双向传递', () => {
    const { model, valueChange } = createHarness({ modelValue: 3 })
    model.onDraftUpdate('')
    expect(model.commitText()).toBeNull()
    expect(valueChange).toHaveBeenLastCalledWith(null)
    expect(model.draft.value).toBe('')
  })
})

describe('useNumberBox 文本结算（ValidationMode）', () => {
  it('非法输入 + InvalidInputOverwritten：用当前值的文本覆盖输入，值不变', () => {
    const { model, valueChange } = createHarness({ modelValue: 12 })
    model.onDraftUpdate('abc')
    expect(model.commitText()).toBe('invalid')
    expect(model.draft.value).toBe('12')
    expect(valueChange).not.toHaveBeenCalled()
  })

  it('非法输入 + Disabled：保留用户输入，值不变', () => {
    const { model, valueChange } = createHarness({
      modelValue: 12,
      validationMode: 'disabled',
    })
    model.onDraftUpdate('abc')
    expect(model.commitText()).toBe('invalid')
    expect(model.draft.value).toBe('abc')
    expect(valueChange).not.toHaveBeenCalled()
  })

  it('输入越界：默认钳制到区间端点，Disabled 时保留', () => {
    const clamped = createHarness({ modelValue: 50, min: 0, max: 100 })
    clamped.model.onDraftUpdate('150')
    clamped.model.commitText()
    expect(clamped.valueChange).toHaveBeenLastCalledWith(100)

    const kept = createHarness({ modelValue: 50, min: 0, max: 100, validationMode: 'disabled' })
    kept.model.onDraftUpdate('150')
    kept.model.commitText()
    expect(kept.valueChange).toHaveBeenLastCalledWith(150)
  })

  it('接受表达式：求值后写入（AcceptsExpression=true）', () => {
    const { model, valueChange } = createHarness({ acceptsExpression: true, modelValue: 0 })
    model.onDraftUpdate('2*(3+4)')
    model.commitText()
    expect(valueChange).toHaveBeenLastCalledWith(14)
    expect(model.draft.value).toBe('14')
  })

  it('表达式除以 0：求值成功但结果为 NaN → 值置空（与 WinUI 一致）', () => {
    const { model, valueChange } = createHarness({ acceptsExpression: true, modelValue: 8 })
    model.onDraftUpdate('1/0')
    model.commitText()
    expect(valueChange).toHaveBeenLastCalledWith(null)
  })

  it('revertText：丢弃草稿回到当前值（WinUI Escape）', () => {
    const { model } = createHarness({ modelValue: 7 })
    model.onDraftUpdate('999')
    model.revertText()
    expect(model.draft.value).toBe('7')
    expect(model.currentValue.value).toBe(7)
  })

  it('失焦即结算，聚焦只置位焦点态', () => {
    const { model, valueChange } = createHarness({ modelValue: 1 })
    model.handleFocus()
    expect(model.isFocused.value).toBe(true)
    model.onDraftUpdate('42')
    model.handleBlur()
    expect(model.isFocused.value).toBe(false)
    expect(valueChange).toHaveBeenLastCalledWith(42)
  })
})

describe('useNumberBox 步进', () => {
  it('步进前先结算输入框里的文本（WinUI StepValue → ValidateInput）', () => {
    const { model, valueChange } = createHarness({ modelValue: 5 })
    model.onDraftUpdate('7')
    model.stepBy(1)
    expect(valueChange).toHaveBeenLastCalledWith(8)
  })

  it('非法输入 + Disabled：步进仍基于原值（并覆盖输入文本）', () => {
    const { model, valueChange } = createHarness({
      modelValue: 5,
      validationMode: 'disabled',
    })
    model.onDraftUpdate('abc')
    model.stepBy(1)
    expect(valueChange).toHaveBeenLastCalledWith(6)
    expect(model.draft.value).toBe('6')
  })

  it('无值时步进不产生变化（输入框清空后按方向键无反应）', () => {
    const { model, valueChange } = createHarness()
    model.stepBy(1)
    expect(valueChange).not.toHaveBeenCalled()
    expect(model.currentValue.value).toBeNull()
  })

  it('禁用时步进不产生变化', () => {
    const { model, valueChange } = createHarness({ modelValue: 5, disabled: true })
    model.stepBy(1)
    expect(valueChange).not.toHaveBeenCalled()
  })

  it('小数步长不引入浮点噪声', () => {
    const { model, valueChange } = createHarness({ modelValue: 0.1, min: 0, max: 1 })
    model.stepBy(0.2)
    expect(valueChange).toHaveBeenLastCalledWith(0.3)
    expect(model.draft.value).toBe('0.3')
  })
})

describe('useNumberBox 呈现状态', () => {
  it('locale / formatOptions 影响文本与软键盘类型', () => {
    const german = createHarness({ defaultValue: 1234.5, locale: 'de-DE' })
    expect(german.model.draft.value).toBe('1.234,5')
    expect(german.model.inputMode.value).toBe('decimal')

    const integer = createHarness({
      defaultValue: 25.8,
      formatOptions: { maximumFractionDigits: 0 },
    })
    expect(integer.model.draft.value).toBe('26')
    expect(integer.model.inputMode.value).toBe('numeric')
  })

  it('增减按钮可用性跟随值 / 区间 / 回绕 / 校验模式', () => {
    const atMax = createHarness({ modelValue: 100, min: 0, max: 100 })
    expect(atMax.model.isSpinDisabled('increase')).toBe(true)
    expect(atMax.model.isSpinDisabled('decrease')).toBe(false)

    const wrapped = createHarness({ modelValue: 100, min: 0, max: 100, wrapEnabled: true })
    expect(wrapped.model.isSpinDisabled('increase')).toBe(false)
    expect(wrapped.model.isSpinDisabled('decrease')).toBe(false)

    const empty = createHarness({ min: 0, max: 100 })
    expect(empty.model.isSpinDisabled('increase')).toBe(true)
    expect(empty.model.isSpinDisabled('decrease')).toBe(true)
  })
})
