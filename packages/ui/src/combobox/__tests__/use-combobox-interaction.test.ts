/* oxlint-disable no-magic-numbers -- 断言里的字面量就是被测输入与期望值 */
/**
 * 指针 / 焦点 / 输入法状态层：焦点矩形、PointerFocused、组字屏蔽、失焦收尾。
 *
 * 该 hook 只依赖 ref / computed，不依赖组件实例 —— 直接调用即可，无需挂载；
 * relatedTarget 用 jsdom 的真实 Node 构造，注入的 isInsideSurface / onEditableBlur 打桩。
 */
import { describe, expect, it, vi } from 'vitest'
import { useComboboxInteraction } from '../use-combobox-interaction'
import type { ComboboxInteractionDeps } from '../use-combobox-interaction'

const createHarness = (over: Partial<ComboboxInteractionDeps> = {}) => {
  const isInsideSurface = vi.fn().mockReturnValue(false)
  const onEditableBlur = vi.fn()
  const deps: ComboboxInteractionDeps = { isInsideSurface, onEditableBlur, ...over }
  const model = useComboboxInteraction(deps)
  // 返回 deps 上最终生效的桩（over 可以整体换掉其中一个）
  return { model, isInsideSurface: deps.isInsideSurface, onEditableBlur: deps.onEditableBlur }
}

const focusOut = (relatedTarget: Node | null): FocusEvent =>
  new FocusEvent('focusout', { bubbles: true, relatedTarget: relatedTarget ?? undefined })

describe('useComboboxInteraction 焦点可见性（Focused / PointerFocused）', () => {
  it('键盘聚焦画焦点矩形；指针聚焦两者都不画', () => {
    const { model } = createHarness()

    model.onFocusIn()
    expect(model.focused.value).toBe(true)
    expect(model.focusVisible.value).toBe(true)

    model.notePointerDown()
    expect(model.focused.value).toBe(true)
    expect(model.pointerFocused.value).toBe(true)
    expect(model.focusVisible.value).toBe(false)
  })

  it('文档级 keydown 归位指针聚焦（含外部 Shift+Tab 进入的键盘聚焦）', () => {
    const { model } = createHarness()
    model.onFocusIn()
    model.notePointerDown()
    expect(model.focusVisible.value).toBe(false)

    model.onDocumentKeydown()
    expect(model.pointerFocused.value).toBe(false)
    expect(model.focusVisible.value).toBe(true)
  })

  it('noteKeyboardInteraction 同时归位 pointerFocused 与 lastInteraction', () => {
    const { model } = createHarness()
    model.notePointerDown()
    model.noteKeyboardInteraction()
    expect(model.pointerFocused.value).toBe(false)
    expect(model.lastInteraction.value).toBe('keyboard')
  })

  it('指针交互只改 lastInteraction，不动焦点矩形判定', () => {
    const { model } = createHarness()
    model.onFocusIn()
    model.onDocumentKeydown()
    model.notePointerMove()
    expect(model.lastInteraction.value).toBe('pointer')
    expect(model.pointerFocused.value).toBe(false)
    expect(model.focusVisible.value).toBe(true)
  })
})

describe('useComboboxInteraction 失焦', () => {
  it('relatedTarget 仍在表面内：不算失焦，也不跑收尾', () => {
    const { model, isInsideSurface, onEditableBlur } = createHarness({
      isInsideSurface: vi.fn().mockReturnValue(true),
    })
    model.onFocusIn()
    model.onFocusOut(focusOut(document.createElement('span')))

    expect(model.focused.value).toBe(true)
    expect(onEditableBlur).not.toHaveBeenCalled()
    expect(isInsideSurface).toHaveBeenCalledTimes(1)
  })

  it('relatedTarget 为 null / 表面外的节点：失焦并跑收尾', () => {
    const { model, onEditableBlur } = createHarness()
    model.onFocusIn()
    model.onFocusOut(focusOut(null))
    expect(model.focused.value).toBe(false)
    expect(onEditableBlur).toHaveBeenCalledTimes(1)

    model.onFocusIn()
    model.onFocusOut(focusOut(document.createElement('div')))
    expect(model.focused.value).toBe(false)
    expect(onEditableBlur).toHaveBeenCalledTimes(2)
  })
})

describe('useComboboxInteraction 输入法组字', () => {
  it('组字开始 / 结束只翻转 composing', () => {
    const { model } = createHarness()
    model.onCompositionStart()
    expect(model.composing.value).toBe(true)
    model.onCompositionEnd()
    expect(model.composing.value).toBe(false)
  })
})
