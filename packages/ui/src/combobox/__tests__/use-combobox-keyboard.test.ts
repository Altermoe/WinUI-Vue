/* oxlint-disable no-magic-numbers -- 断言里的字面量就是被测输入与期望值 */
/**
 * 键位分发层：捕获阶段的 keydown → 动作分发（WinUI MainKeyDown / PopupKeyDown 口径）。
 *
 * 键位表本身在 keyboard.ts 单测；这里守的是「事件级」的另一半语义：
 * preventDefault / stopPropagation 的边界（Tab 不吞）、禁用 / 组字屏蔽、
 * 交互归位的时机（disabled 之前也要归位）、以及动作到分发表的路由。
 *
 * 事件用普通对象构造（ComboboxKeydownEvent 是 KeyboardEvent 的结构子集），无需 DOM。
 */
import { describe, expect, it, vi } from 'vitest'
import { useComboboxKeyboard } from '../use-combobox-keyboard'
import type {
  ComboboxKeydownEvent,
  ComboboxKeyboardActions,
  ComboboxKeyboardProps,
} from '../use-combobox-keyboard'

const createActions = (): ComboboxKeyboardActions => ({
  open: vi.fn(),
  close: vi.fn(),
  selectNext: vi.fn(),
  selectPrevious: vi.fn(),
  selectFirst: vi.fn(),
  selectLast: vi.fn(),
  commitHighlight: vi.fn(),
  commitText: vi.fn(),
  revertText: vi.fn(),
  deselect: vi.fn(),
  search: vi.fn(),
})

const createHarness = (
  over: {
    props?: Partial<ComboboxKeyboardProps>
    open?: boolean
    composing?: boolean
    searching?: boolean
  } = {},
) => {
  const noteKeyboardInteraction = vi.fn()
  const actions = createActions()
  const { onKeydownCapture } = useComboboxKeyboard({
    props: {
      disabled: false,
      editable: false,
      textSearchEnabled: true,
      ...over.props,
    },
    isOpen: () => over.open === true,
    isComposing: () => over.composing === true,
    isSearching: () => over.searching === true,
    noteKeyboardInteraction,
    actions,
  })
  return { onKeydownCapture, actions, noteKeyboardInteraction }
}

const keyEvent = (key: string, over: Partial<ComboboxKeydownEvent> = {}): ComboboxKeydownEvent => ({
  key,
  altKey: false,
  ctrlKey: false,
  metaKey: false,
  preventDefault: vi.fn(),
  stopPropagation: vi.fn(),
  ...over,
})

/** 造一个带真实 preventDefault / stopPropagation 记录的事件 */
const press = (
  harness: ReturnType<typeof createHarness>,
  key: string,
  over: Partial<ComboboxKeydownEvent> = {},
): ComboboxKeydownEvent => {
  const event = keyEvent(key, over)
  harness.onKeydownCapture(event)
  return event
}

describe('useComboboxKeyboard 分发与按键边界', () => {
  it('关闭态方向键 → selectNext，吞掉按键（preventDefault + stopPropagation）', () => {
    const harness = createHarness()
    const event = press(harness, 'ArrowDown')

    expect(harness.actions.selectNext).toHaveBeenCalledTimes(1)
    expect(event.preventDefault).toHaveBeenCalledTimes(1)
    expect(event.stopPropagation).toHaveBeenCalledTimes(1)
    expect(harness.noteKeyboardInteraction).toHaveBeenCalledTimes(1)
  })

  it('Escape 展开态 → close；Home / End 关闭态 → 首尾项', () => {
    const open = createHarness({ open: true })
    press(open, 'Escape')
    expect(open.actions.close).toHaveBeenCalledTimes(1)

    const closed = createHarness()
    press(closed, 'Home')
    press(closed, 'End')
    expect(closed.actions.selectFirst).toHaveBeenCalledTimes(1)
    expect(closed.actions.selectLast).toHaveBeenCalledTimes(1)
  })

  it('字符键 → search 并带上原键；textSearchEnabled=false 时不处理', () => {
    const harness = createHarness()
    press(harness, 'd')
    expect(harness.actions.search).toHaveBeenCalledWith('d')

    const off = createHarness({ props: { textSearchEnabled: false } })
    const event = press(off, 'd')
    expect(off.actions.search).not.toHaveBeenCalled()
    expect(event.preventDefault).not.toHaveBeenCalled()
  })

  it('搜索进行中空格 → search；否则 → open（WinUI ProcessSearch 口径）', () => {
    const searching = createHarness({ searching: true })
    press(searching, ' ')
    expect(searching.actions.search).toHaveBeenCalledWith(' ')

    const idle = createHarness()
    press(idle, ' ')
    expect(idle.actions.open).toHaveBeenCalledTimes(1)
  })

  it('展开态 PageDown → 吃掉按键但不路由动作（swallow）', () => {
    const harness = createHarness({ open: true })
    const event = press(harness, 'PageDown')

    expect(event.preventDefault).toHaveBeenCalledTimes(1)
    expect(event.stopPropagation).toHaveBeenCalledTimes(1)
    for (const action of Object.values(harness.actions)) {
      expect(action).not.toHaveBeenCalled()
    }
  })

  it('展开态非可编辑 Enter → 交给 reka（none：不吞按键、不路由动作）', () => {
    const harness = createHarness({ open: true })
    const event = press(harness, 'Enter')

    expect(event.preventDefault).not.toHaveBeenCalled()
    expect(event.stopPropagation).not.toHaveBeenCalled()
    expect(harness.actions.commitHighlight).not.toHaveBeenCalled()
    expect(harness.actions.close).not.toHaveBeenCalled()
  })

  it('Tab → commit-text 但不吞按键（焦点要交出去）', () => {
    const harness = createHarness({ props: { editable: true } })
    const event = press(harness, 'Tab')

    expect(harness.actions.commitText).toHaveBeenCalledTimes(1)
    expect(event.preventDefault).not.toHaveBeenCalled()
    expect(event.stopPropagation).not.toHaveBeenCalled()
  })

  it('Ctrl+Enter 展开态 → deselect', () => {
    const harness = createHarness({ open: true })
    press(harness, 'Enter', { ctrlKey: true })
    expect(harness.actions.deselect).toHaveBeenCalledTimes(1)
  })

  it('修饰键组合不构成搜索字符（isSearchCharacter 口径）', () => {
    const harness = createHarness()
    press(harness, 'd', { ctrlKey: true })
    expect(harness.actions.search).not.toHaveBeenCalled()
  })
})

describe('useComboboxKeyboard 屏蔽与交互归位', () => {
  it('禁用：不路由任何动作，但仍先归位交互状态', () => {
    const harness = createHarness({ props: { disabled: true } })
    const event = press(harness, 'ArrowDown')

    expect(harness.noteKeyboardInteraction).toHaveBeenCalledTimes(1)
    expect(harness.actions.selectNext).not.toHaveBeenCalled()
    expect(event.preventDefault).not.toHaveBeenCalled()
  })

  it('组字中：不接管按键', () => {
    const harness = createHarness({ composing: true })
    const event = press(harness, 'ArrowDown')

    expect(harness.noteKeyboardInteraction).toHaveBeenCalledTimes(1)
    expect(harness.actions.selectNext).not.toHaveBeenCalled()
    expect(event.preventDefault).not.toHaveBeenCalled()
  })

  it('可编辑态收起时 Home / End 只挡列表导航，不动光标（不 preventDefault）', () => {
    const harness = createHarness({ props: { editable: true } })
    const event = press(harness, 'Home')

    expect(event.preventDefault).not.toHaveBeenCalled()
    expect(event.stopPropagation).toHaveBeenCalledTimes(1)
    expect(harness.actions.selectFirst).not.toHaveBeenCalled()
  })

  it('可编辑态展开时 Home / End 交给键位表（展开态表里没有 Home → none）', () => {
    const harness = createHarness({ props: { editable: true }, open: true })
    const event = press(harness, 'Home')

    expect(event.preventDefault).not.toHaveBeenCalled()
    expect(event.stopPropagation).not.toHaveBeenCalled()
    expect(harness.actions.selectFirst).not.toHaveBeenCalled()
  })
})
