/**
 * Combobox 键位分发层：捕获阶段的 keydown 处理器。
 *
 * 键位表本身是纯函数（keyboard.ts 的 `resolveComboboxKeyAction`）；本层负责
 * 「事件 → 动作」之外的部分，全部按 WinUI `ComboBox_Partial.cpp` 口径：
 *   - 捕获阶段先于 reka 的输入框监听，解析出动作后 `preventDefault` + `stopPropagation`
 *     （Tab 例外：要把焦点交出去，只执行动作不吞按键）
 *   - 组字中 / 禁用时不接管，但仍先归位「最近一次交互是键盘」
 *   - 可编辑态收起时 Home / End 归文本框管（光标行首 / 行尾）：
 *     只挡住 reka 的列表导航，不 preventDefault 以免光标不动
 *   - 动作语义（open / select-next / commit-text / search …）分发到注入的 actions
 *
 * 事件参数收窄成 `ComboboxKeydownEvent`（KeyboardEvent 结构兼容），
 * 不依赖组件实例，可直接用普通对象在测试里调用。
 */
import { resolveComboboxKeyAction } from './keyboard'
import type { FluereComboboxKeyAction } from './keyboard'

/** 动作 → 分发表的映射（无 DOM、可单测的纯分发） */
const dispatchKeyAction = (
  action: FluereComboboxKeyAction,
  key: string,
  actions: ComboboxKeyboardActions,
): void => {
  switch (action) {
    case 'open': {
      actions.open()
      break
    }
    case 'close': {
      actions.close()
      break
    }
    case 'select-next': {
      actions.selectNext()
      break
    }
    case 'select-previous': {
      actions.selectPrevious()
      break
    }
    case 'select-first': {
      actions.selectFirst()
      break
    }
    case 'select-last': {
      actions.selectLast()
      break
    }
    case 'commit-highlight': {
      actions.commitHighlight()
      break
    }
    case 'commit-text': {
      actions.commitText()
      break
    }
    case 'revert-text': {
      actions.revertText()
      break
    }
    case 'deselect': {
      actions.deselect()
      break
    }
    case 'search': {
      actions.search(key)
      break
    }
    default: {
      // Swallow / none：已在上方吃掉按键（或本就不处理），不做事
      break
    }
  }
}

/** 键位分发层用到的 props 视图（组件已补过默认值，故均为必填） */
export interface ComboboxKeyboardProps {
  disabled: boolean
  editable: boolean
  textSearchEnabled: boolean
}

/** 动作分发表：每个语义动作由组件接上对应实现 */
export interface ComboboxKeyboardActions {
  open: () => void
  close: () => void
  selectNext: () => void
  selectPrevious: () => void
  selectFirst: () => void
  selectLast: () => void
  /** 展开时提交高亮项（Space 等价于 Enter） */
  commitHighlight: () => void
  commitText: () => void
  revertText: () => void
  /** Ctrl / Cmd+Enter 取消已选中项的选中（WinUI `SelectedIndex = -1`） */
  deselect: () => void
  search: (char: string) => void
}

/** 本层依赖的状态读取器（组件用 computed / hook 接上） */
export interface ComboboxKeyboardDeps {
  props: ComboboxKeyboardProps
  /** 面板是否展开 */
  isOpen: () => boolean
  /** 输入法是否在组字 */
  isComposing: () => boolean
  /** 当前是否处于一次未超时的搜索中（决定空格是否是搜索字符） */
  isSearching: () => boolean
  /** 键位处理开头的交互归位（组件接 interaction 层） */
  noteKeyboardInteraction: () => void
  actions: ComboboxKeyboardActions
}

/** 结构上被 KeyboardEvent 满足的按键事件视图 */
export interface ComboboxKeydownEvent {
  key: string
  altKey: boolean
  ctrlKey: boolean
  metaKey: boolean
  preventDefault: () => void
  stopPropagation: () => void
}

export const useComboboxKeyboard = (
  deps: ComboboxKeyboardDeps,
): {
  onKeydownCapture: (event: ComboboxKeydownEvent) => void
} => {
  const onKeydownCapture = (event: ComboboxKeydownEvent): void => {
    deps.noteKeyboardInteraction()
    const { disabled, editable, textSearchEnabled } = deps.props
    const open = deps.isOpen()
    if (disabled || deps.isComposing()) {
      return
    }
    // 可编辑态收起时 Home / End 归文本框管（光标到行首 / 行尾）：
    // 只挡住 reka 的列表导航，不 preventDefault 以免光标不动
    if (editable && !open && (event.key === 'Home' || event.key === 'End')) {
      event.stopPropagation()
      return
    }
    const action = resolveComboboxKeyAction(
      {
        key: event.key,
        altKey: event.altKey,
        ctrlKey: event.ctrlKey,
        metaKey: event.metaKey,
      },
      { open, editable, textSearchEnabled, searching: deps.isSearching() },
    )
    if (action === 'none') {
      return
    }
    // Tab 要把焦点交出去：可编辑态先提交文本，但不吞掉按键
    if (event.key !== 'Tab') {
      event.preventDefault()
      event.stopPropagation()
    }
    dispatchKeyAction(action, event.key, deps.actions)
  }

  return { onKeydownCapture }
}
