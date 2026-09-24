/**
 * Slider 的指针 / 键盘交互层：按下态与「键盘聚焦」的判定。
 *
 * 与 WinUI 一致：数值提示在「按下 / 键盘聚焦」时出现，指针抬起即收起；
 * 按下同时驱动 Pressed 配色（Thumb 的 Pressed 状态），故 pressed 一并暴露。
 *
 * 指针交互时 reka 也会 focus() 滑块，所以 focusin 不能直接等同「键盘聚焦」：
 * pointerdown 的**捕获阶段**先记下「本次聚焦由指针发起」，focusin 再据此判定。
 * 必须用捕获阶段 —— reka 的 focus() 发生在冒泡路径上（目标 → 根），
 * 宿主冒泡阶段的 pointerdown 会晚于 focusin。
 *
 * 只依赖 ref / computed，不依赖组件实例，可直接在测试里调用。
 */
import { computed, ref } from 'vue'
import type { ComputedRef, Ref } from 'vue'
import type { FluereSliderProps } from './types'

/** 本层用到的 props 视图（组件已补过默认值，故均为必填） */
export type SliderInteractionProps = Required<Pick<FluereSliderProps, 'disabled' | 'tooltip'>>

/** 交互层对外暴露的状态与宿主事件处理器 */
export interface SliderInteraction {
  /** 指针按下：同时驱动按下配色 */
  pressed: Ref<boolean>
  /** 键盘聚焦：指针发起的聚焦不算 */
  keyboardFocus: Ref<boolean>
  /** 数值提示显隐（情态与开关的合成） */
  tooltipVisible: ComputedRef<boolean>
  /** 捕获阶段：标记「本次聚焦由指针发起」 */
  onPointerDownCapture: () => void
  onPointerDown: () => void
  /** 指针抬起 / pointercancel 共用 */
  onPointerUp: () => void
  onKeyDown: () => void
  onFocusIn: () => void
  onFocusOut: () => void
}

export const useSliderInteraction = (props: SliderInteractionProps): SliderInteraction => {
  const pressed = ref(false)
  const keyboardFocus = ref(false)
  let pointerInitiatedFocus = false

  const tooltipVisible = computed(() => props.tooltip && (pressed.value || keyboardFocus.value))

  const onPointerDownCapture = (): void => {
    pointerInitiatedFocus = true
  }

  const onPointerDown = (): void => {
    if (props.disabled) {
      return
    }
    pressed.value = true
    // 指针按下即视为离开键盘操作：数值提示由 pressed 接管
    keyboardFocus.value = false
  }

  const onPointerUp = (): void => {
    pressed.value = false
    pointerInitiatedFocus = false
  }

  const onKeyDown = (): void => {
    if (!props.disabled) {
      keyboardFocus.value = true
    }
  }

  const onFocusIn = (): void => {
    keyboardFocus.value = !pointerInitiatedFocus
  }

  const onFocusOut = (): void => {
    keyboardFocus.value = false
    pointerInitiatedFocus = false
  }

  return {
    pressed,
    keyboardFocus,
    tooltipVisible,
    onPointerDownCapture,
    onPointerDown,
    onPointerUp,
    onKeyDown,
    onFocusIn,
    onFocusOut,
  }
}
