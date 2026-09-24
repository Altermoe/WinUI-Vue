/**
 * FluereCombobox 键位映射纯函数层。
 *
 * 对应 WinUI 3 `ComboBox_Partial.cpp` 的两张键位表：
 *   - `MainKeyDown`：面板关闭、ComboBox 持有焦点
 *   - `PopupKeyDown`：面板展开
 * 这里只把「按键 + 状态」翻译成一个语义动作，DOM 副作用留在组件里，
 * 因此可以直接单测。面板展开时的方向键 / Home / End / Enter 由 reka 底座处理，
 * 本层返回 `none` 让事件继续下传。
 */
import { MIN_SEARCH_QUERY_LENGTH } from './constants'

/** 键位语义动作 */
type FluereComboboxKeyAction =
  /** 展开面板（Alt+↓ / Alt+↑ / Enter / Space / F4，可编辑态的方向键） */
  | 'open'
  /** 收起面板（Escape / F4 / Alt+↑ / Alt+↓；可编辑态 Enter 只收起不提交） */
  | 'close'
  /** 面板关闭时直接改选中项：方向键（WinUI `HandleNavigationKey` + `SelectedIndex =`） */
  | 'select-next'
  | 'select-previous'
  | 'select-first'
  | 'select-last'
  /** 面板展开时提交高亮项（Space 等价于 Enter） */
  | 'commit-highlight'
  /** 可编辑态提交文本（Enter / 失焦前的 Tab，对应 `CommitRevertEditableSearch(false)`） */
  | 'commit-text'
  /** 可编辑态回滚文本（Escape，对应 `CommitRevertEditableSearch(true)`） */
  | 'revert-text'
  /** Ctrl / Cmd+Enter 取消已选中项的选中（WinUI `SelectedIndex = -1`） */
  | 'deselect'
  /** 字符搜索（WinUI `OnCharacterReceived`） */
  | 'search'
  /** 吃掉按键但不做事（面板展开时的 PageUp / PageDown / ←→，阻止页面滚动） */
  | 'swallow'
  /** 不处理，交给底座或浏览器 */
  | 'none'

interface FluereComboboxKeyInput {
  key: string
  altKey?: boolean
  ctrlKey?: boolean
  metaKey?: boolean
}

interface FluereComboboxKeyContext {
  /** 面板是否展开 */
  open: boolean
  /** 是否可编辑（对应 WinUI `IsEditable`） */
  editable: boolean
  /** 是否启用文本搜索（对应 WinUI `IsTextSearchEnabled`） */
  textSearchEnabled: boolean
  /** 当前是否处于一次未超时的搜索中（WinUI 会据此把空格当作搜索字符） */
  searching: boolean
}

/**
 * 解析按键 → 动作。
 *
 * WinUI 口径摘要：
 * - 关闭态：`Enter` / `Space` / `F4` / `Alt+↑↓` 展开；非可编辑态 `↑↓` 直接改选中项、
 *   `Home` / `End` 选首尾；可编辑态 `Enter` 提交文本、`Escape` 回滚文本、空格即输入空格
 * - 展开态：`Escape` / `F4` / `Alt+↑↓` 收起；非可编辑态 `Enter`（reka 提交高亮项）与
 *   `Space` 等价；可编辑态 `Enter` 只收起面板；`Ctrl+Enter` 取消选中；字符键照常做前缀搜索
 */
const resolveComboboxKeyAction = (
  input: FluereComboboxKeyInput,
  context: FluereComboboxKeyContext,
): FluereComboboxKeyAction => {
  const { key } = input
  const altKey = input.altKey === true
  const commandKey = input.ctrlKey === true || input.metaKey === true
  const { open, editable, textSearchEnabled, searching } = context

  if (open) {
    if (key === 'Escape') {
      return 'close'
    }
    if (key === 'F4' && !altKey) {
      return 'close'
    }
    if (altKey && (key === 'ArrowUp' || key === 'ArrowDown')) {
      return 'close'
    }
    if (key === 'Enter') {
      if (altKey) {
        return 'none'
      }
      if (commandKey) {
        return 'deselect'
      }
      // 可编辑态焦点在文本框里：WinUI 只收起面板，不改选中项
      return editable ? 'close' : 'none'
    }
    if (key === ' ' && !editable) {
      return 'commit-highlight'
    }
    // WinUI 吃掉这些键（阻止父级 ScrollViewer 滚动）但不改选中项
    if (key === 'PageUp' || key === 'PageDown' || key === 'ArrowLeft' || key === 'ArrowRight') {
      return 'swallow'
    }
    // 文本搜索在展开态同样生效（WinUI 弹层把 CharacterReceived 冒泡回 ComboBox）
    if (!editable && textSearchEnabled && isSearchCharacter(input)) {
      return 'search'
    }
    return 'none'
  }

  if (key === 'Escape') {
    return editable ? 'revert-text' : 'none'
  }
  if (key === 'F4' && !altKey) {
    return 'open'
  }
  if (key === 'Enter') {
    return editable ? 'commit-text' : 'open'
  }
  if (key === 'Tab') {
    // WinUI：可编辑态 Tab 先提交文本，再把焦点交出去（不吞掉按键）
    return editable ? 'commit-text' : 'none'
  }
  if (key === ' ') {
    if (editable) {
      return 'none'
    }
    // 搜索串未超时时空格参与前缀匹配，否则等价于 Enter（WinUI `ProcessSearch(L' ')`）
    return searching ? 'search' : 'open'
  }
  if (key === 'ArrowDown') {
    return altKey || editable ? 'open' : 'select-next'
  }
  if (key === 'ArrowUp') {
    return altKey || editable ? 'open' : 'select-previous'
  }
  if (!editable) {
    if (key === 'Home') {
      return 'select-first'
    }
    if (key === 'End') {
      return 'select-last'
    }
  }
  if (!editable && textSearchEnabled && isSearchCharacter(input)) {
    return 'search'
  }
  return 'none'
}

/** 该键是否构成一次字符搜索：单字符且不带 Ctrl / Meta / Alt（WinUI `OnCharacterReceived`） */
const isSearchCharacter = (input: FluereComboboxKeyInput): boolean =>
  input.key.length === MIN_SEARCH_QUERY_LENGTH &&
  input.ctrlKey !== true &&
  input.metaKey !== true &&
  input.altKey !== true

export { isSearchCharacter, resolveComboboxKeyAction }
export type { FluereComboboxKeyAction, FluereComboboxKeyContext, FluereComboboxKeyInput }
