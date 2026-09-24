/**
 * FluereCombobox 交互决策纯函数层。
 *
 * 把三处「事件 → 是否执行 / 执行什么」的 WinUI 语义从组件里剥出来：
 *   - `resolveHighlightIntent`：展开时高亮变化的两条 WinUI 语义
 *     （可编辑态 `UpdateEditableTextBox` 回填、`SelectionChangedTrigger.Always` 提交）
 *   - `resolveSurfacePointerAction`：控件表面指针按下的三档动作
 *     （禁用无响应；可编辑态只有箭头热区切换面板，文本区留给浏览器放光标）
 *   - `resolveWheelStep`：焦点在控件上、面板收起时滚轮改选中项
 *     （对应 WinUI `OnPointerWheelChanged` 的 `MouseWheelDelta` 口径）
 * 这一层不依赖 Vue，可直接单测。
 */
import { NEXT_ITEM_STEP, NO_DELTA, PREVIOUS_ITEM_STEP } from './constants'
import type { ItemStep } from './constants'
import type { FluereComboboxSelectionChangedTrigger } from './types'

/** 高亮变化的判定输入（payload.value 缺省即 `hasValue: false`） */
interface HighlightIntentInput {
  /** 面板是否展开 */
  open: boolean
  /** 最近一次交互来源（WinUI 只在键盘焦点变化时改 `SelectedIndex` / `Text`） */
  interaction: 'keyboard' | 'pointer'
  /** 高亮事件是否带了值 */
  hasValue: boolean
  /** 是否可编辑（对应 WinUI `IsEditable`） */
  editable: boolean
  /** 选择提交时机（对应 WinUI `SelectionChangedTrigger`） */
  trigger: FluereComboboxSelectionChangedTrigger
}

/** 高亮变化的执行意图（两条语义互相独立，都为 false 即整体忽略） */
interface HighlightIntent {
  /** 高亮项文本回填文本框（可编辑态 `UpdateEditableTextBox`，不改选中项） */
  fillText: boolean
  /** 高亮值提交为选中项（`SelectionChangedTrigger.Always`：高亮走到哪提交到哪） */
  commitValue: boolean
}

/** 表面指针按下的判定输入 */
interface SurfacePointerInput {
  /** 是否禁用（`IsEnabled = false` 时整个控件无响应） */
  disabled: boolean
  /** 是否可编辑 */
  editable: boolean
  /** 按下点是否落在箭头热区（`.fui-combobox__chevron`）内 */
  onChevron: boolean
}

/** 表面指针按下的动作：`ignore` 连指针交互状态都不记（禁用档） */
type SurfacePointerAction = 'ignore' | 'caret' | 'toggle'

/** 滚轮改选中项的判定输入 */
interface WheelStepInput {
  /** 是否禁用 */
  disabled: boolean
  /** 面板是否展开（展开时滚轮归面板） */
  open: boolean
  /** 滚轮纵向增量（`MouseWheelDelta`，0 即无纵向滚动） */
  deltaY: number
  /** 控件的输入框是否持有焦点（WinUI 只在焦点于控件上时改选中项） */
  controlFocused: boolean
}

/**
 * 展开时高亮变化的两条 WinUI 语义：
 * 1. 可编辑态：高亮项即时回填到文本框，但不改选中项；
 * 2. `trigger = 'always'` 时：高亮走到哪就提交到哪。
 * 指针悬停两条都不触发（WinUI 只在键盘焦点变化时改 `SelectedIndex` / `Text`）。
 */
const resolveHighlightIntent = (input: HighlightIntentInput): HighlightIntent => {
  const active = input.open && input.interaction === 'keyboard' && input.hasValue
  return {
    fillText: active && input.editable,
    commitValue: active && input.trigger === 'always',
  }
}

/**
 * 表面指针按下的三档动作：
 * - 禁用 → `ignore`：整个控件无响应，也不记指针交互状态；
 * - 可编辑 + 非箭头热区 → `caret`：记指针交互状态，但不切换面板
 *   （文本区交给浏览器放置光标）；
 * - 其余 → `toggle`：记指针交互状态并切换面板（非可编辑态整块控件都是开关）。
 */
const resolveSurfacePointerAction = (input: SurfacePointerInput): SurfacePointerAction => {
  if (input.disabled) {
    return 'ignore'
  }
  if (input.editable && !input.onChevron) {
    return 'caret'
  }
  return 'toggle'
}

/**
 * 滚轮是否改选中项、往哪个方向改：
 * 禁用 / 面板展开 / 无纵向增量 / 焦点不在控件上 → null（不响应）；
 * 否则 delta > 0 下一项、delta < 0 上一项（WinUI `MouseWheelDelta > 0` 口径）。
 */
const resolveWheelStep = (input: WheelStepInput): ItemStep | null => {
  if (input.disabled || input.open || input.deltaY === NO_DELTA || !input.controlFocused) {
    return null
  }
  return input.deltaY > NO_DELTA ? NEXT_ITEM_STEP : PREVIOUS_ITEM_STEP
}

export { resolveHighlightIntent, resolveSurfacePointerAction, resolveWheelStep }
export type {
  HighlightIntent,
  HighlightIntentInput,
  SurfacePointerAction,
  SurfacePointerInput,
  WheelStepInput,
}
