/**
 * 滚动条输入：拖拽拇指定位 / 点击轨道翻页。
 *
 * 拇指几何的视觉渲染在 use-scroll-bars 中响应式维护；本模块只负责交互：
 * 拖拽期间把指针位置换算为目标 offset 并提交视图。
 */
/* oxlint-disable max-statements, max-params, no-ternary, no-magic-numbers --
 * 滚动条交互属于 FluereScrollView 的复杂输入流程（对齐 WinUI 3 ScrollView）：
 * 拇指几何 / 翻页回退的结构性 0/1 字面量，以及组合各子引擎的 5 参工厂签名，
 * 强行套用结构风格规则会把单次拖拽流程拆成碎片。
 */
import { PRIMARY_BUTTON, PAGE_SCROLL_MARGIN, MIN_THUMB_TRAVEL } from './constants'
import type { ScrollViewCore } from './core'
import type { AnimationEngine } from './use-animation'
import type { InertiaEngine } from './use-inertia'
import type { ScrollApi } from './use-scroll-api'
import type { ScrollBars } from './use-scroll-bars'

/** 滚动条输入层暴露给模板的对象 */
interface ScrollbarInput {
  onVBarPointerDown: (event: PointerEvent) => void
  onHBarPointerDown: (event: PointerEvent) => void
  onThumbPointerMove: (event: PointerEvent) => void
  onThumbPointerUp: (event: PointerEvent) => void
}

interface ThumbDragState {
  axis: 'vertical' | 'horizontal'
  pointerId: number
  grabOffset: number
}

const useScrollbarInput = (
  core: ScrollViewCore,
  bars: ScrollBars,
  api: ScrollApi,
  animation: AnimationEngine,
  inertia: InertiaEngine,
): ScrollbarInput => {
  const {
    vBarEl,
    vThumbEl,
    hBarEl,
    hThumbEl,
    viewportWidth,
    viewportHeight,
    scrollableWidth,
    scrollableHeight,
    offsetX,
    offsetY,
    clampX,
    clampY,
    commitView,
    setState,
  } = core

  let thumbDrag: ThumbDragState | undefined = undefined

  const onVBarPointerDown = (event: PointerEvent): void => {
    if (event.pointerType === 'mouse' && event.button !== PRIMARY_BUTTON) {
      return
    }
    if (scrollableHeight.value <= 0) {
      return
    }
    const thumb = vThumbEl.value
    if (!thumb) {
      return
    }
    if (event.target === thumb || thumb.contains(event.target as Node)) {
      startThumbDrag(event, 'vertical')
      return
    }
    event.preventDefault()
    const bar = vBarEl.value
    if (!bar) {
      return
    }
    const rect = bar.getBoundingClientRect()
    const thumbRect = thumb.getBoundingClientRect()
    const clickY = event.clientY - rect.top
    const thumbMid = thumbRect.top - rect.top + thumbRect.height / 2
    const page = Math.max(PAGE_SCROLL_MARGIN, viewportHeight.value - PAGE_SCROLL_MARGIN)
    api.scrollBy(0, clickY < thumbMid ? -page : page, { animationMode: 'disabled' })
  }

  const onHBarPointerDown = (event: PointerEvent): void => {
    if (event.pointerType === 'mouse' && event.button !== PRIMARY_BUTTON) {
      return
    }
    if (scrollableWidth.value <= 0) {
      return
    }
    const thumb = hThumbEl.value
    if (!thumb) {
      return
    }
    if (event.target === thumb || thumb.contains(event.target as Node)) {
      startThumbDrag(event, 'horizontal')
      return
    }
    event.preventDefault()
    const bar = hBarEl.value
    if (!bar) {
      return
    }
    const rect = bar.getBoundingClientRect()
    const thumbRect = thumb.getBoundingClientRect()
    const clickX = event.clientX - rect.left
    const thumbMid = thumbRect.left - rect.left + thumbRect.width / 2
    const page = Math.max(PAGE_SCROLL_MARGIN, viewportWidth.value - PAGE_SCROLL_MARGIN)
    api.scrollBy(clickX < thumbMid ? -page : page, 0, { animationMode: 'disabled' })
  }

  const startThumbDrag = (event: PointerEvent, axis: 'vertical' | 'horizontal'): void => {
    const bar = axis === 'vertical' ? vBarEl.value : hBarEl.value
    const thumb = axis === 'vertical' ? vThumbEl.value : hThumbEl.value
    if (!bar || !thumb) {
      return
    }
    event.preventDefault()
    bar.setPointerCapture(event.pointerId)
    animation.cancelActiveAnimation()
    inertia.cancelInertia()
    const rect = bar.getBoundingClientRect()
    const thumbRect = thumb.getBoundingClientRect()
    const pointer = axis === 'vertical' ? event.clientY - rect.top : event.clientX - rect.left
    const thumbStart = axis === 'vertical' ? thumbRect.top - rect.top : thumbRect.left - rect.left
    thumbDrag = { axis, pointerId: event.pointerId, grabOffset: pointer - thumbStart }
    bars.thumbDragging.value = true
    setState('interaction')
    bars.showBars(true)
  }

  const onThumbPointerMove = (event: PointerEvent): void => {
    if (!thumbDrag || event.pointerId !== thumbDrag.pointerId) {
      return
    }
    const { axis } = thumbDrag
    const bar = axis === 'vertical' ? vBarEl.value : hBarEl.value
    const thumb = axis === 'vertical' ? vThumbEl.value : hThumbEl.value
    if (!bar || !thumb) {
      return
    }
    const rect = bar.getBoundingClientRect()
    const trackLength = axis === 'vertical' ? rect.height : rect.width
    const thumbLengthValue = axis === 'vertical' ? thumb.offsetHeight : thumb.offsetWidth
    const maxTravel = Math.max(MIN_THUMB_TRAVEL, trackLength - thumbLengthValue)
    const pointer = axis === 'vertical' ? event.clientY - rect.top : event.clientX - rect.left
    const ratio = Math.min(Math.max(0, (pointer - thumbDrag.grabOffset) / maxTravel), 1)
    const scrollable = axis === 'vertical' ? scrollableHeight.value : scrollableWidth.value
    const target = ratio * scrollable
    if (axis === 'vertical') {
      offsetY.value = clampY(target)
    } else {
      offsetX.value = clampX(target)
    }
    commitView()
  }

  const onThumbPointerUp = (event: PointerEvent): void => {
    if (!thumbDrag || event.pointerId !== thumbDrag.pointerId) {
      return
    }
    const bar = thumbDrag.axis === 'vertical' ? vBarEl.value : hBarEl.value
    if (bar) {
      bar.releasePointerCapture?.(event.pointerId)
    }
    thumbDrag = undefined
    bars.thumbDragging.value = false
    setState('idle')
  }

  return { onVBarPointerDown, onHBarPointerDown, onThumbPointerMove, onThumbPointerUp }
}

export { useScrollbarInput, type ScrollbarInput }
