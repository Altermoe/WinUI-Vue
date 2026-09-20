/**
 * 键盘输入：方向键 / PageUp/Down / Home/End / Space 滚动。
 *
 * 命中可编辑目标（input/textarea/select/contenteditable）时不拦截按键。
 */
/* oxlint-disable max-statements, no-ternary, no-magic-numbers --
 * 键盘步长算法的结构性 0 字面量（步长下限回退）与方向键映射的分支判定，
 * 属交互流程的领域常量，已由 constants.ts 命名常量覆盖主体。
 */
import { KEYBOARD_STEP_MIN, KEYBOARD_STEP_RATIO, PAGE_SCROLL_MARGIN } from './constants'
import type { ScrollViewCore } from './core'
import type { ScrollingInputKinds } from './types'
import type { ScrollApi } from './use-scroll-api'

/** 键盘输入层暴露给模板的对象 */
interface KeyboardInput {
  onKeyDown: (event: KeyboardEvent) => void
}

const NAV_KEYS = [
  'ArrowUp',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'PageUp',
  'PageDown',
  'Home',
  'End',
  'Space',
]

/** 命中可编辑目标时，键盘事件应交还给输入控件 */
const isEditableTarget = (target: HTMLElement | null): boolean => {
  if (!target || !target.closest) {
    return false
  }
  return Boolean(target.closest('input, textarea, select, [contenteditable="true"]'))
}

const useKeyboardInput = (core: ScrollViewCore, api: ScrollApi): KeyboardInput => {
  const { viewportWidth, viewportHeight, scrollableWidth, scrollableHeight } = core

  const isInputIgnored = (kind: ScrollingInputKinds): boolean => {
    const list = Array.isArray(core.props.ignoredInputKinds)
      ? core.props.ignoredInputKinds
      : [core.props.ignoredInputKinds]
    return list.includes('all') || list.includes(kind)
  }

  const keyboardStep = (): { stepX: number; stepY: number; pageX: number; pageY: number } => {
    const stepX = Math.max(KEYBOARD_STEP_MIN, viewportWidth.value * KEYBOARD_STEP_RATIO)
    const stepY = Math.max(KEYBOARD_STEP_MIN, viewportHeight.value * KEYBOARD_STEP_RATIO)
    const pageX = Math.max(stepX, viewportWidth.value - PAGE_SCROLL_MARGIN)
    const pageY = Math.max(stepY, viewportHeight.value - PAGE_SCROLL_MARGIN)
    return { stepX, stepY, pageX, pageY }
  }

  const scrollForNavigationKey = (event: KeyboardEvent, key: string): void => {
    const steps = keyboardStep()
    const instant = { animationMode: 'disabled' } as const
    if (key === 'ArrowUp') {
      api.scrollBy(0, -steps.stepY, instant)
    } else if (key === 'ArrowDown') {
      api.scrollBy(0, steps.stepY, instant)
    } else if (key === 'ArrowLeft') {
      api.scrollBy(-steps.stepX, 0, instant)
    } else if (key === 'ArrowRight') {
      api.scrollBy(steps.stepX, 0, instant)
    } else if (key === 'PageUp') {
      api.scrollBy(0, -steps.pageY, instant)
    } else if (key === 'PageDown') {
      api.scrollBy(0, steps.pageY, instant)
    } else if (key === 'Home') {
      api.scrollTo(0, 0, instant)
    } else if (key === 'End') {
      api.scrollTo(scrollableWidth.value, scrollableHeight.value, instant)
    } else if (key === 'Space') {
      api.scrollBy(0, event.shiftKey ? -steps.pageY : steps.pageY, instant)
    }
  }

  const onKeyDown = (event: KeyboardEvent): void => {
    if (isInputIgnored('keyboard')) {
      return
    }
    if (!NAV_KEYS.includes(event.key)) {
      return
    }
    if (isEditableTarget(event.target as HTMLElement | null)) {
      return
    }
    event.preventDefault()
    scrollForNavigationKey(event, event.key)
  }

  return { onKeyDown }
}

export { useKeyboardInput, type KeyboardInput }
