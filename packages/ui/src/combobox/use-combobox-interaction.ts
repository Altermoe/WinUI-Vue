/**
 * Combobox 指针 / 焦点 / 输入法状态层。
 *
 * 维护四份跨事件的小状态，供键位分发与高亮决策读取：
 *   - `focused` / `pointerFocused`：焦点矩形与指示条（WinUI `PointerFocused`
 *     不画焦点矩形、不显示指示条）
 *   - `lastInteraction`：最近一次交互来源（高亮只在键盘焦点变化时改选中 / 文本）
 *   - `composing`：输入法组字中（组字期间不接管按键）
 *
 * 键盘聚焦判定（对应 WinUI 的口述口径）：文档级 keydown 即视为「最近一次是键盘」
 * （含从外部 Shift+Tab 进入），故 `onDocumentKeydown` 只归位 pointerFocused、
 * 不改 lastInteraction；两者都由组件挂到 document 的捕获阶段监听上。
 *
 * 只依赖 ref / computed，不依赖组件实例，可直接在测试里调用。
 */
import { computed, ref } from 'vue'
import type { ComputedRef, Ref } from 'vue'

/** 本层依赖的 DOM / 收尾回调（组件用 template ref 接上） */
export interface ComboboxInteractionDeps {
  /** 焦点移出目标（relatedTarget）是否仍在控件表面内（内部聚焦不视为失焦） */
  isInsideSurface: (node: Node) => boolean
  /** 失焦后的收尾：可编辑态提交文本（WinUI：焦点离开即 CommitRevertEditableSearch） */
  onEditableBlur: () => void
}

/** 指针 / 焦点层对外暴露的状态与事件处理器 */
export interface ComboboxInteractionModel {
  /** 控件是否持有焦点 */
  focused: Ref<boolean>
  /** 最近一次聚焦是否来自指针 */
  pointerFocused: Ref<boolean>
  /** 键盘聚焦可见性（focused 且非 pointerFocused） */
  focusVisible: ComputedRef<boolean>
  /** 输入法是否在组字 */
  composing: Ref<boolean>
  /** 最近一次交互来源 */
  lastInteraction: Ref<'keyboard' | 'pointer'>
  /** 输入法组字开始 / 结束（捕获阶段绑在输入框上） */
  onCompositionStart: () => void
  onCompositionEnd: () => void
  /** 焦点进入控件 */
  onFocusIn: () => void
  /** 焦点离开控件（relatedTarget 仍在表面内则忽略） */
  onFocusOut: (event: FocusEvent) => void
  /** 键位捕获处理的开头：归位指针交互状态 */
  noteKeyboardInteraction: () => void
  /** 表面指针按下：记「指针聚焦 + 指针交互」 */
  notePointerDown: () => void
  /** 弹层指针移动：只记「指针交互」（不重置焦点矩形判定） */
  notePointerMove: () => void
  /** 文档级 keydown：归位 pointerFocused（判定键盘聚焦） */
  onDocumentKeydown: () => void
}

export const useComboboxInteraction = (deps: ComboboxInteractionDeps): ComboboxInteractionModel => {
  const focused = ref(false)
  const pointerFocused = ref(false)
  const focusVisible = computed(() => focused.value && !pointerFocused.value)
  const composing = ref(false)
  const lastInteraction = ref<'keyboard' | 'pointer'>('keyboard')

  const onCompositionStart = (): void => {
    composing.value = true
  }

  const onCompositionEnd = (): void => {
    composing.value = false
  }

  const onFocusIn = (): void => {
    focused.value = true
  }

  const onFocusOut = (event: FocusEvent): void => {
    const next = event.relatedTarget
    if (next !== null && next instanceof Node && deps.isInsideSurface(next)) {
      return
    }
    focused.value = false
    deps.onEditableBlur()
  }

  const noteKeyboardInteraction = (): void => {
    pointerFocused.value = false
    lastInteraction.value = 'keyboard'
  }

  const notePointerDown = (): void => {
    pointerFocused.value = true
    lastInteraction.value = 'pointer'
  }

  const notePointerMove = (): void => {
    lastInteraction.value = 'pointer'
  }

  const onDocumentKeydown = (): void => {
    pointerFocused.value = false
  }

  return {
    focused,
    pointerFocused,
    focusVisible,
    composing,
    lastInteraction,
    onCompositionStart,
    onCompositionEnd,
    onFocusIn,
    onFocusOut,
    noteKeyboardInteraction,
    notePointerDown,
    notePointerMove,
    onDocumentKeydown,
  }
}
