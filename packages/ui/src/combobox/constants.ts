/**
 * FluereCombobox 命名常量。
 *
 * 集中收拢有领域含义的字面量（对齐 oxlint no-magic-numbers），
 * 让纯逻辑模块（items / text-search / keyboard）与组件共享同一份数值契约。
 *
 * 数值来自 WinUI 3 / Windows App SDK 2.0：
 *   src/controls/dev/ComboBox/ComboBox_themeresources.xaml
 *   src/dxaml/xcp/dxaml/lib/ComboBox_Partial.cpp
 */

/**
 * 缺省下拉面板最大高度（px）。
 * WinUI `DefaultComboBoxStyle` 的 `MaxDropDownHeight` = 504，恰好约 15 项。
 */
const DEFAULT_MAX_DROPDOWN_HEIGHT = 504

/**
 * 文本搜索的字符合并窗口（毫秒）。
 * WinUI `HasSearchStringTimedOut()` 里的 `timeOutInMilliseconds = 1000`：
 * 两次按键间隔超过它即视为新一次搜索。
 */
const TEXT_SEARCH_TIMEOUT_MS = 1000

/** 未命中下标（WinUI `SelectedIndex` 的 -1 语义） */
const INDEX_NOT_FOUND = -1

/** 前缀搜索串的最小长度（一个字符即构成一次新搜索） */
const MIN_SEARCH_QUERY_LENGTH = 1

/** 列表首项下标 */
const FIRST_INDEX = 0

/** 空集合长度：`items.length === EMPTY_LENGTH` 即没有可选项 */
const EMPTY_LENGTH = 0

/** 项步进：下一项（WinUI `Selector.SelectNext`）；也用作「末项之后」的越界哨兵 */
const NEXT_ITEM_STEP = 1

/** 项步进：上一项（WinUI `Selector.SelectPrev`）；也用作「首项之前」的越界哨兵 */
const PREVIOUS_ITEM_STEP = -1

/** 滚轮 / 指针增量的零值：大于它向下、小于它向上（WinUI `MouseWheelDelta > 0` 口径） */
const NO_DELTA = 0

/** 项步进类型：只允许 ±1，避免把「按页跳」之类的步长误传进来 */
type ItemStep = typeof NEXT_ITEM_STEP | typeof PREVIOUS_ITEM_STEP

export {
  DEFAULT_MAX_DROPDOWN_HEIGHT,
  EMPTY_LENGTH,
  FIRST_INDEX,
  INDEX_NOT_FOUND,
  MIN_SEARCH_QUERY_LENGTH,
  NEXT_ITEM_STEP,
  NO_DELTA,
  PREVIOUS_ITEM_STEP,
  TEXT_SEARCH_TIMEOUT_MS,
}
export type { ItemStep }
