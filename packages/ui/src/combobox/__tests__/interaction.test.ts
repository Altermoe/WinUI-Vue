import { describe, expect, it } from 'vitest'
import { NEXT_ITEM_STEP, PREVIOUS_ITEM_STEP } from '../constants'
import {
  resolveHighlightIntent,
  resolveSurfacePointerAction,
  resolveWheelStep,
} from '../interaction'
import type { HighlightIntentInput, SurfacePointerInput, WheelStepInput } from '../interaction'

/**
 * 对照来源：WinUI 3（Windows App SDK 2.0）`ComboBox_Partial.cpp`：
 * 高亮只在键盘焦点变化时改 SelectedIndex / Text；指针按下按 IsEditable 分流；
 * 滚轮在焦点于控件上、面板收起时才改选中项。
 */
const highlight = (over: Partial<HighlightIntentInput> = {}): HighlightIntentInput => ({
  open: true,
  interaction: 'keyboard',
  hasValue: true,
  editable: false,
  trigger: 'committed',
  ...over,
})

const pointer = (over: Partial<SurfacePointerInput> = {}): SurfacePointerInput => ({
  disabled: false,
  editable: false,
  onChevron: false,
  ...over,
})

const wheel = (over: Partial<WheelStepInput> = {}): WheelStepInput => ({
  disabled: false,
  open: false,
  deltaY: 120,
  controlFocused: true,
  ...over,
})

describe('resolveHighlightIntent（高亮变化的两条 WinUI 语义）', () => {
  it('缺省 committed：只在键盘 + 展开时回填可编辑文本，不提交选中', () => {
    expect(resolveHighlightIntent(highlight({ editable: true }))).toEqual({
      fillText: true,
      commitValue: false,
    })
    expect(resolveHighlightIntent(highlight())).toEqual({ fillText: false, commitValue: false })
  })

  it("trigger='always'：键盘高亮即提交选中", () => {
    expect(resolveHighlightIntent(highlight({ trigger: 'always' }))).toEqual({
      fillText: false,
      commitValue: true,
    })
    expect(resolveHighlightIntent(highlight({ editable: true, trigger: 'always' }))).toEqual({
      fillText: true,
      commitValue: true,
    })
  })

  it('面板收起 / 指针悬停 / 无高亮值：两条语义都不触发', () => {
    expect(resolveHighlightIntent(highlight({ open: false, editable: true }))).toEqual({
      fillText: false,
      commitValue: false,
    })
    expect(
      resolveHighlightIntent(highlight({ interaction: 'pointer', trigger: 'always' })),
    ).toEqual({ fillText: false, commitValue: false })
    expect(resolveHighlightIntent(highlight({ hasValue: false, editable: true }))).toEqual({
      fillText: false,
      commitValue: false,
    })
  })
})

describe('resolveSurfacePointerAction（表面指针按下）', () => {
  it('禁用：整个控件无响应（连指针交互状态都不记）', () => {
    expect(resolveSurfacePointerAction(pointer({ disabled: true }))).toBe('ignore')
    expect(resolveSurfacePointerAction(pointer({ disabled: true, onChevron: true }))).toBe('ignore')
  })

  it('非可编辑态：整块控件都是开关', () => {
    expect(resolveSurfacePointerAction(pointer())).toBe('toggle')
    expect(resolveSurfacePointerAction(pointer({ onChevron: true }))).toBe('toggle')
  })

  it('可编辑态：只有箭头热区开关，文本区只放光标', () => {
    expect(resolveSurfacePointerAction(pointer({ editable: true }))).toBe('caret')
    expect(resolveSurfacePointerAction(pointer({ editable: true, onChevron: true }))).toBe('toggle')
  })
})

describe('resolveWheelStep（滚轮改选中项）', () => {
  it('焦点在控件上、面板收起：delta > 0 下一项、delta < 0 上一项', () => {
    expect(resolveWheelStep(wheel())).toBe(NEXT_ITEM_STEP)
    expect(resolveWheelStep(wheel({ deltaY: -120 }))).toBe(PREVIOUS_ITEM_STEP)
  })

  it('禁用 / 面板展开 / 无纵向增量 / 焦点不在控件上：不响应', () => {
    expect(resolveWheelStep(wheel({ disabled: true }))).toBeNull()
    expect(resolveWheelStep(wheel({ open: true }))).toBeNull()
    expect(resolveWheelStep(wheel({ deltaY: 0 }))).toBeNull()
    expect(resolveWheelStep(wheel({ controlFocused: false }))).toBeNull()
  })
})
