import { describe, expect, it } from 'vitest'
import { resolveComboboxKeyAction } from '../keyboard'
import type { FluereComboboxKeyContext } from '../keyboard'

/**
 * 对照来源：WinUI 3（Windows App SDK 2.0）
 *   src/dxaml/xcp/dxaml/lib/ComboBox_Partial.cpp → MainKeyDown（面板关闭）/
 *   PopupKeyDown（面板展开）两张键位表。
 */
const closed = (over: Partial<FluereComboboxKeyContext> = {}): FluereComboboxKeyContext => ({
  open: false,
  editable: false,
  textSearchEnabled: true,
  searching: false,
  ...over,
})

const open = (over: Partial<FluereComboboxKeyContext> = {}): FluereComboboxKeyContext => ({
  open: true,
  editable: false,
  textSearchEnabled: true,
  searching: false,
  ...over,
})

describe('面板关闭 · 非可编辑态（MainKeyDown）', () => {
  it('Enter / Space / F4 / Alt+↓ / Alt+↑ 展开面板', () => {
    expect(resolveComboboxKeyAction({ key: 'Enter' }, closed())).toBe('open')
    expect(resolveComboboxKeyAction({ key: ' ' }, closed())).toBe('open')
    expect(resolveComboboxKeyAction({ key: 'F4' }, closed())).toBe('open')
    expect(resolveComboboxKeyAction({ key: 'ArrowDown', altKey: true }, closed())).toBe('open')
    expect(resolveComboboxKeyAction({ key: 'ArrowUp', altKey: true }, closed())).toBe('open')
  })

  it('方向键直接改选中项（WinUI 关闭态不改高亮而是改 SelectedIndex）', () => {
    expect(resolveComboboxKeyAction({ key: 'ArrowDown' }, closed())).toBe('select-next')
    expect(resolveComboboxKeyAction({ key: 'ArrowUp' }, closed())).toBe('select-previous')
  })

  it('Home / End 选首尾项', () => {
    expect(resolveComboboxKeyAction({ key: 'Home' }, closed())).toBe('select-first')
    expect(resolveComboboxKeyAction({ key: 'End' }, closed())).toBe('select-last')
  })

  it('Escape 不处理（WinUI 直接冒泡给上层）', () => {
    expect(resolveComboboxKeyAction({ key: 'Escape' }, closed())).toBe('none')
  })

  it('字符键做文本搜索；带修饰键或关闭文本搜索时不处理', () => {
    expect(resolveComboboxKeyAction({ key: 'w' }, closed())).toBe('search')
    expect(resolveComboboxKeyAction({ key: 'w' }, closed({ textSearchEnabled: false }))).toBe(
      'none',
    )
    expect(resolveComboboxKeyAction({ key: 'w', ctrlKey: true }, closed())).toBe('none')
    expect(resolveComboboxKeyAction({ key: 'ArrowDown' }, closed())).toBe('select-next')
  })

  it("搜索未超时时空格是搜索字符（WinUI ProcessSearch(L' ')）", () => {
    expect(resolveComboboxKeyAction({ key: ' ' }, closed({ searching: true }))).toBe('search')
  })

  it('Tab 不处理，焦点照常离开', () => {
    expect(resolveComboboxKeyAction({ key: 'Tab' }, closed())).toBe('none')
  })
})

describe('面板关闭 · 可编辑态', () => {
  it('Enter / Tab 提交文本，Escape 回滚文本', () => {
    expect(resolveComboboxKeyAction({ key: 'Enter' }, closed({ editable: true }))).toBe(
      'commit-text',
    )
    expect(resolveComboboxKeyAction({ key: 'Tab' }, closed({ editable: true }))).toBe('commit-text')
    expect(resolveComboboxKeyAction({ key: 'Escape' }, closed({ editable: true }))).toBe(
      'revert-text',
    )
  })

  it('空格是普通输入，方向键展开面板', () => {
    expect(resolveComboboxKeyAction({ key: ' ' }, closed({ editable: true }))).toBe('none')
    expect(resolveComboboxKeyAction({ key: 'ArrowDown' }, closed({ editable: true }))).toBe('open')
    expect(resolveComboboxKeyAction({ key: 'ArrowUp' }, closed({ editable: true }))).toBe('open')
  })

  it('Home / End 交给文本框（本层返回 none，光标移动由浏览器处理）', () => {
    expect(resolveComboboxKeyAction({ key: 'Home' }, closed({ editable: true }))).toBe('none')
    expect(resolveComboboxKeyAction({ key: 'End' }, closed({ editable: true }))).toBe('none')
  })
})

describe('面板展开（PopupKeyDown）', () => {
  it('Escape / F4 / Alt+↑↓ 收起面板', () => {
    expect(resolveComboboxKeyAction({ key: 'Escape' }, open())).toBe('close')
    expect(resolveComboboxKeyAction({ key: 'F4' }, open())).toBe('close')
    expect(resolveComboboxKeyAction({ key: 'ArrowDown', altKey: true }, open())).toBe('close')
    expect(resolveComboboxKeyAction({ key: 'ArrowUp', altKey: true }, open())).toBe('close')
  })

  it('方向键 / Home / End / Tab 交给底座与浏览器', () => {
    expect(resolveComboboxKeyAction({ key: 'ArrowDown' }, open())).toBe('none')
    expect(resolveComboboxKeyAction({ key: 'ArrowUp' }, open())).toBe('none')
    expect(resolveComboboxKeyAction({ key: 'Home' }, open())).toBe('none')
    expect(resolveComboboxKeyAction({ key: 'End' }, open())).toBe('none')
    expect(resolveComboboxKeyAction({ key: 'Tab' }, open())).toBe('none')
  })

  it('非可编辑态 Enter 交给 reka 提交高亮项；Space 由本层提交', () => {
    expect(resolveComboboxKeyAction({ key: 'Enter' }, open())).toBe('none')
    expect(resolveComboboxKeyAction({ key: ' ' }, open())).toBe('commit-highlight')
  })

  it('可编辑态 Enter 只收起面板（光标在文本框里）', () => {
    expect(resolveComboboxKeyAction({ key: 'Enter' }, open({ editable: true }))).toBe('close')
  })

  it('Ctrl / Cmd+Enter 取消已选中项', () => {
    expect(resolveComboboxKeyAction({ key: 'Enter', ctrlKey: true }, open())).toBe('deselect')
    expect(resolveComboboxKeyAction({ key: 'Enter', metaKey: true }, open())).toBe('deselect')
  })

  it('PageUp / PageDown / ←→ 吃掉按键，阻止父级滚动但不改选中项', () => {
    for (const key of ['PageUp', 'PageDown', 'ArrowLeft', 'ArrowRight']) {
      expect(resolveComboboxKeyAction({ key }, open())).toBe('swallow')
    }
  })

  it('字符键在展开态同样做前缀搜索（WinUI 弹层把字符冒泡回 ComboBox）', () => {
    expect(resolveComboboxKeyAction({ key: 'w' }, open())).toBe('search')
    expect(resolveComboboxKeyAction({ key: 'w' }, open({ textSearchEnabled: false }))).toBe('none')
    expect(resolveComboboxKeyAction({ key: 'w' }, open({ editable: true }))).toBe('none')
  })
})
