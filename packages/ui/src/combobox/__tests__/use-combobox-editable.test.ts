/* oxlint-disable no-magic-numbers -- 断言里的字面量就是被测输入与期望值，抽成常量反而更难读 */
/**
 * 可编辑态层：提交 / 回滚 / 行内补全（WinUI CommitRevertEditableSearch 口径）。
 *
 * 该 hook 不依赖组件实例 —— 直接调用即可，无需挂载；DOM 只用到一个裸
 * <input>（jsdom 直接创建），补全的选区断言在 nextTick 之后读取。
 */
import { describe, expect, it, vi } from 'vitest'
import { nextTick, reactive } from 'vue'
import type { FluereComboboxItem } from '../types'
import { useComboboxEditable } from '../use-combobox-editable'
import type { ComboboxEditableEvents, ComboboxEditableProps } from '../use-combobox-editable'
import { useComboboxSelection } from '../use-combobox-selection'
import type { ComboboxSelectionEvents, ComboboxSelectionProps } from '../use-combobox-selection'

const FRUITS: FluereComboboxItem<string>[] = [
  { value: 'a', text: 'Apple' },
  { value: 'b', text: 'Banana' },
  { value: 'c', text: 'Cherry', disabled: true },
  { value: 'd', text: 'Durian' },
]

const createHarness = (props: Partial<ComboboxSelectionProps<string>> = {}) => {
  const state = reactive<ComboboxSelectionProps<string>>({
    editable: true,
    items: FRUITS,
    ...props,
  })
  const valueChange = vi.fn()
  const selectionChanged = vi.fn()
  const textChange = vi.fn()
  const selectionEvents: ComboboxSelectionEvents<string> = {
    valueChange,
    selectionChanged,
    textChange,
  }
  const selection = useComboboxSelection<string>(state, selectionEvents)

  const editableProps = reactive<ComboboxEditableProps>({ editable: true })
  const textSubmit = vi.fn()
  const editableEvents: ComboboxEditableEvents = { textSubmit }
  const editable = useComboboxEditable<string>(editableProps, selection, editableEvents)
  return { state, editableProps, selection, editable, valueChange, textSubmit, textChange }
}

describe('useComboboxEditable commitText（Enter / Tab / 失焦）', () => {
  it('文本匹配已有项 → 选中该项', () => {
    const { selection, editable, valueChange } = createHarness()
    selection.setText('Banana')
    editable.commitText()
    expect(valueChange).toHaveBeenLastCalledWith('b')
  })

  it('文本不匹配任何项 → 抛 textSubmitted + 清空选中、保留文本', () => {
    const { selection, editable, valueChange, textSubmit, textChange } = createHarness({
      defaultValue: 'a',
      defaultText: 'Apple',
    })
    selection.setText('Elderberry')
    editable.commitText()

    expect(textSubmit).toHaveBeenCalledWith({ text: 'Elderberry', handled: false })
    expect(valueChange).toHaveBeenLastCalledWith(null)
    expect(selection.currentText.value).toBe('Elderberry')
    // 提交自定义文本（keepText）不回抛新文本：唯一一次 textChange 来自测试自己的 setText
    expect(textChange).toHaveBeenCalledTimes(1)
    expect(textChange).toHaveBeenCalledWith('Elderberry')
  })

  it('textSubmitted 里把 handled 置 true 则不改动选中项', () => {
    const { selection, editable, valueChange, textSubmit } = createHarness({
      defaultValue: 'a',
      defaultText: 'Apple',
    })
    textSubmit.mockImplementation((args: { handled: boolean }) => {
      args.handled = true
    })
    selection.setText('Elderberry')
    editable.commitText()

    expect(valueChange).not.toHaveBeenCalled()
    expect(selection.currentValue.value).toBe('a')
  })

  it('提交后同文本再失焦不重复抛 textSubmitted（committedText 记账）', () => {
    const { selection, editable, textSubmit } = createHarness()
    selection.setText('Elderberry')
    expect(editable.shouldCommitOnBlur('Elderberry')).toBe(true)
    editable.commitText()
    expect(textSubmit).toHaveBeenCalledTimes(1)

    expect(editable.shouldCommitOnBlur('Elderberry')).toBe(false)
  })

  it('非可编辑态失焦不提交', () => {
    const { editableProps, editable } = createHarness()
    editableProps.editable = false
    expect(editable.shouldCommitOnBlur('whatever')).toBe(false)
  })
})

describe('useComboboxEditable revertText（Escape）', () => {
  it('回滚文本到当前选中项（CommitRevertEditableSearch(restoreValue: true)）', () => {
    const { selection, editable, textChange } = createHarness({
      defaultValue: 'b',
      defaultText: 'Apple',
    })
    selection.setText('zzz')
    editable.revertText()

    expect(selection.currentText.value).toBe('Banana')
    expect(textChange).toHaveBeenLastCalledWith('Banana')
    // 回滚也算一次提交：之后同文本失焦不再抛 textSubmitted
    expect(editable.shouldCommitOnBlur('Banana')).toBe(false)
  })

  it('无选中时回滚为空串', () => {
    const { selection, editable } = createHarness()
    selection.setText('zzz')
    editable.revertText()
    expect(selection.currentText.value).toBe('')
  })
})

/** 裸 input 元素：completeInline 只读 value、写选区，不需要挂进组件 */
const input = (value: string): HTMLInputElement => {
  const element = document.createElement('input')
  element.value = value
  return element
}

describe('useComboboxEditable completeInline（WinUI type-to-complete）', () => {
  it('输入前缀命中项 → 回抛全文（组件侧 :model-value 回写 DOM），并把补全部分选中', async () => {
    const { editable, textChange } = createHarness()
    const target = input('Du')
    textChange.mockImplementation((value: string) => {
      target.value = value // 模拟模板里 :model-value="inputText" 的回写
    })
    editable.completeInline(target)
    await nextTick()

    expect(textChange).toHaveBeenLastCalledWith('Durian')
    expect(target.value).toBe('Durian')
    expect(target.selectionStart).toBe(2) // 保留已输入的 'Du'
    expect(target.selectionEnd).toBe('Durian'.length)
  })

  it('输入已完整 / 太短 / 无命中：什么都不做', () => {
    const { editable, textChange } = createHarness()
    const exact = input('Durian')
    editable.completeInline(exact)
    editable.completeInline(input(''))
    const missed = input('zzz')
    editable.completeInline(missed)

    expect(textChange).not.toHaveBeenCalled()
    expect(missed.value).toBe('zzz')
  })

  it('禁用项不参与补全命中（findTextSearchMatch 跳过 disabled）', () => {
    const { editable, textChange } = createHarness()
    editable.completeInline(input('Ch'))
    expect(textChange).not.toHaveBeenCalled()
  })
})
