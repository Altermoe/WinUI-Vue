/**
 * 交互层：按下态与「键盘聚焦」的判定（数值提示显隐）。
 *
 * 该 hook 只依赖 ref / computed，不依赖组件实例 —— 直接调用即可，无需挂载；
 * 组件侧的契约测试只负责验证这些处理器真的绑到了宿主上。
 */

import { describe, expect, it } from 'vitest'
import { reactive } from 'vue'
import { useSliderInteraction } from '../use-slider-interaction'

const createProps = (overrides: Partial<{ disabled: boolean; tooltip: boolean }> = {}) =>
  reactive({ disabled: false, tooltip: true, ...overrides })

describe('useSliderInteraction 初始状态', () => {
  it('未按下、未聚焦：不显示数值提示', () => {
    const interaction = useSliderInteraction(createProps())

    expect(interaction.pressed.value).toBe(false)
    expect(interaction.keyboardFocus.value).toBe(false)
    expect(interaction.tooltipVisible.value).toBe(false)
  })
})

describe('useSliderInteraction 指针按下（同时驱动按下配色）', () => {
  it('按下置位并显示数值提示，抬起收起', () => {
    const interaction = useSliderInteraction(createProps())

    interaction.onPointerDown()
    expect(interaction.pressed.value).toBe(true)
    expect(interaction.tooltipVisible.value).toBe(true)

    interaction.onPointerUp()
    expect(interaction.pressed.value).toBe(false)
    expect(interaction.tooltipVisible.value).toBe(false)
  })

  it('指针发起的聚焦不算键盘聚焦（reka 会在 pointerdown 里 focus 滑块）', () => {
    const interaction = useSliderInteraction(createProps())

    // 捕获阶段先标记，随后 focusin 由 reka 的 focus() 触发
    interaction.onPointerDownCapture()
    interaction.onFocusIn()
    expect(interaction.keyboardFocus.value).toBe(false)

    // 提示仍显示，但来源是 pressed 而不是键盘聚焦
    interaction.onPointerDown()
    expect(interaction.pressed.value).toBe(true)
    expect(interaction.tooltipVisible.value).toBe(true)
  })

  it('抬起后指针标记复位：之后的 focusin 重新算键盘聚焦', () => {
    const interaction = useSliderInteraction(createProps())

    interaction.onPointerDownCapture()
    interaction.onPointerDown()
    interaction.onPointerUp()
    interaction.onFocusIn()
    expect(interaction.keyboardFocus.value).toBe(true)
  })
})

describe('useSliderInteraction 键盘聚焦', () => {
  it('focusin 视为键盘聚焦并显示数值提示，focusout 复位', () => {
    const interaction = useSliderInteraction(createProps())

    interaction.onFocusIn()
    expect(interaction.keyboardFocus.value).toBe(true)
    expect(interaction.tooltipVisible.value).toBe(true)

    interaction.onFocusOut()
    expect(interaction.keyboardFocus.value).toBe(false)
    expect(interaction.tooltipVisible.value).toBe(false)
  })

  it('按下会清掉键盘聚焦（两套来源不叠加），抬起不恢复', () => {
    const interaction = useSliderInteraction(createProps())

    interaction.onFocusIn()
    interaction.onKeyDown()
    interaction.onPointerDown()
    expect(interaction.keyboardFocus.value).toBe(false)
    expect(interaction.pressed.value).toBe(true)

    interaction.onPointerUp()
    expect(interaction.keyboardFocus.value).toBe(false)
    expect(interaction.tooltipVisible.value).toBe(false)
  })

  it('keydown 单独即可进入键盘聚焦（无需先 focusin）', () => {
    const interaction = useSliderInteraction(createProps())

    interaction.onKeyDown()
    expect(interaction.keyboardFocus.value).toBe(true)
  })
})

describe('useSliderInteraction disabled / tooltip 开关', () => {
  it('disabled：按下与键盘操作都不置位', () => {
    const interaction = useSliderInteraction(createProps({ disabled: true }))

    interaction.onPointerDown()
    interaction.onKeyDown()
    expect(interaction.pressed.value).toBe(false)
    expect(interaction.keyboardFocus.value).toBe(false)
    expect(interaction.tooltipVisible.value).toBe(false)
  })

  it('tooltip=false：按下态照常（配色需要），但不显示数值提示', () => {
    const interaction = useSliderInteraction(createProps({ tooltip: false }))

    interaction.onPointerDown()
    expect(interaction.pressed.value).toBe(true)
    expect(interaction.tooltipVisible.value).toBe(false)

    interaction.onKeyDown()
    expect(interaction.tooltipVisible.value).toBe(false)
  })
})
