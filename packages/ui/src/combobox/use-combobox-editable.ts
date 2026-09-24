/**
 * Combobox 可编辑态层：文本的提交 / 回滚 / 行内补全。
 *
 * 对应 WinUI `ComboBox_Partial.cpp` 的可编辑分支：
 *   - `CommitRevertEditableSearch(restoreValue: false)`：提交文本 —— 匹配已有项则选中，
 *     否则抛 `TextSubmitted` 并把选中项清空（文本保留；`e.Handled = true` 可阻止清空）
 *   - `CommitRevertEditableSearch(restoreValue: true)`：回滚文本到当前选中项（Escape）
 *   - `SearchItemSourceIndex` → `UpdateEditableTextBox(selectText: true, selectAll: false)`：
 *     行内补全为命中项文本，并把补全部分选中，继续输入即替换
 *   - 失焦即提交（焦点离开即 `CommitRevertEditableSearch`），`committedText` 记账避免
 *     「Enter 提交 + 失焦再提交」重复触发 `TextSubmitted`
 *
 * 依赖取值层（ComboboxSelectionModel）提供项集合 / 值 / 写入选中与文本的回调；
 * 不依赖组件实例，可直接在测试里调用。
 */
import { nextTick } from 'vue'
import { FIRST_INDEX, INDEX_NOT_FOUND, MIN_SEARCH_QUERY_LENGTH } from './constants'
import { findItemIndexByText, itemText } from './items'
import { findTextSearchMatch } from './text-search'
import type { FluereComboboxTextSubmittedEventArgs } from './types'
import type { ComboboxSelectionModel } from './use-combobox-selection'

/** 本层用到的 props 视图（组件已补过默认值） */
export interface ComboboxEditableProps {
  /** 是否可编辑（对应 WinUI `IsEditable`） */
  editable: boolean
}

/** 本层向上触发的具名事件 */
export interface ComboboxEditableEvents {
  /** 可编辑态提交了不匹配任何项的自定义文本（对应 WinUI `TextSubmitted`） */
  textSubmit: (args: FluereComboboxTextSubmittedEventArgs) => void
}

/** 可编辑态层对外暴露的状态与回调 */
export interface ComboboxEditableModel {
  /** 提交文本（Enter / Tab / 失焦）：命中项 → 选中；否则抛 textSubmitted 并清空选中 */
  commitText: () => void
  /** 回滚文本到当前选中项（Escape，`CommitRevertEditableSearch(restoreValue: true)`） */
  revertText: () => void
  /** 行内补全：输入前缀命中项 → 回填全文并把补全部分选中 */
  completeInline: (target: HTMLInputElement) => void
  /** 失焦时是否需要提交（可编辑且文本未提交过） */
  shouldCommitOnBlur: (text: string) => boolean
}

export const useComboboxEditable = <T>(
  props: ComboboxEditableProps,
  selection: ComboboxSelectionModel<T>,
  events: ComboboxEditableEvents,
): ComboboxEditableModel => {
  /** 上一次提交的文本，避免「Enter 提交 + 失焦再提交」重复触发 TextSubmitted */
  let committedText: string | null = null

  const commitText = (): void => {
    const text = selection.currentText.value
    committedText = text
    const match = findItemIndexByText(selection.entries.value, text)
    if (match !== INDEX_NOT_FOUND) {
      selection.selectByIndex(match)
      return
    }
    const args: FluereComboboxTextSubmittedEventArgs = { text, handled: false }
    events.textSubmit(args)
    if (args.handled) {
      return
    }
    selection.setValue(null, { keepText: true })
  }

  const revertText = (): void => {
    committedText = selection.textOfValue(selection.currentValue.value)
    selection.setText(committedText)
  }

  const completeInline = (target: HTMLInputElement): void => {
    const typed = target.value
    if (typed.length < MIN_SEARCH_QUERY_LENGTH) {
      return
    }
    const match = findTextSearchMatch(selection.entries.value, typed, FIRST_INDEX)
    if (match === INDEX_NOT_FOUND) {
      return
    }
    const item = selection.entries.value[match]
    if (item === undefined) {
      return
    }
    const completed = itemText(item)
    if (completed === typed) {
      return
    }
    selection.setText(completed)
    void nextTick().then(() => target.setSelectionRange(typed.length, completed.length))
  }

  const shouldCommitOnBlur = (text: string): boolean => props.editable && text !== committedText

  return { commitText, revertText, completeInline, shouldCommitOnBlur }
}
