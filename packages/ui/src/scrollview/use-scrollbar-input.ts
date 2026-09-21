/**
 * 滚动条输入：拖拽拇指定位 / 点击轨道翻页 / 两端步进按钮（可长按连续滚动）。
 *
 * 拇指几何的视觉渲染在 use-scroll-bars 中响应式维护；本模块只负责交互：
 * 按下时按「几何位置」判定命中对象（滑块 → 拖拽，端点按钮 → 步进，其余 →
 * 翻页），不依赖 event.target 的绘制层级判定，避免滑块伪元素 / 相邻按钮导致的
 * 误判；拖拽期间把指针位置换算为目标 offset 并提交视图。步进按钮沿所在轴按
 * SCROLLBAR_STEP 逐步滚动，长按超过 SCROLLBAR_REPEAT_DELAY 后进入连续步进。
 */
/* oxlint-disable max-statements, max-params, no-ternary, no-magic-numbers --
 * 滚动条交互属于 FluereScrollView 的复杂输入流程（对齐 WinUI 3 ScrollView）：
 * 拇指几何 / 翻页回退的结构性 0/1 字面量，以及组合各子引擎的 5 参工厂签名，
 * 强行套用结构风格规则会把单次拖拽流程拆成碎片。
 */
import { onScopeDispose } from 'vue'
import {
  MIN_THUMB_TRAVEL,
  PAGE_SCROLL_MARGIN,
  PRIMARY_BUTTON,
  SCROLLBAR_REPEAT_DELAY,
  SCROLLBAR_REPEAT_INTERVAL,
  SCROLLBAR_STEP,
} from './constants'
import type { ScrollViewCore } from './core'
import type { AnimationEngine } from './use-animation'
import type { InertiaEngine } from './use-inertia'
import type { ScrollApi } from './use-scroll-api'
import { thumbTravelInset } from './use-scroll-bars'
import type { ScrollBarAxis, ScrollBars } from './use-scroll-bars'

/** 步进方向：-1 减小偏移（向上 / 向左），+1 增大偏移（向下 / 向右） */
type StepDirection = -1 | 1

/** 滚动条输入层暴露给模板的对象 */
interface ScrollbarInput {
  onVBarPointerDown: (event: PointerEvent) => void
  onHBarPointerDown: (event: PointerEvent) => void
  onThumbPointerMove: (event: PointerEvent) => void
  /** 滚动条命中区抬起 / 取消 / 失去捕获：结束拇指拖拽与步进按钮长按 */
  onBarPointerUp: (event: PointerEvent) => void
  /** 轨道两端步进按钮按下：先步进一次，再启动长按连续滚动 */
  onStepPointerDown: (axis: ScrollBarAxis, direction: StepDirection, event: PointerEvent) => void
}

interface ThumbDragState {
  axis: ScrollBarAxis
  pointerId: number
  grabOffset: number
}

/** 步进按钮长按状态（首次延迟计时器 + 连续步进计时器） */
interface StepRepeatState {
  pointerId: number
  delayTimer: ReturnType<typeof setTimeout> | undefined
  repeatTimer: ReturnType<typeof setInterval> | undefined
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
    nextId,
    setState,
  } = core

  let thumbDrag: ThumbDragState | undefined = undefined
  let stepRepeat: StepRepeatState | undefined = undefined

  const onVBarPointerDown = (event: PointerEvent): void => {
    if (event.pointerType === 'mouse' && event.button !== PRIMARY_BUTTON) {
      return
    }
    if (scrollableHeight.value <= 0) {
      return
    }
    const bar = vBarEl.value
    const thumb = vThumbEl.value
    if (!bar || !thumb) {
      return
    }
    const rect = bar.getBoundingClientRect()
    const thumbRect = thumb.getBoundingClientRect()
    const clickY = event.clientY - rect.top
    const thumbStart = thumbRect.top - rect.top
    // 按几何命中判定滑块，而不是 event.target：滑块本体含伪元素、两端按钮与它相邻，
    // 依赖绘制层级的命中测试容易把「按住滑块」误判成轨道翻页。滑块命中区取整个
    // 滚动条宽度（只比较纵向位置），与 WinUI 的拇指热区一致。
    if (clickY >= thumbStart && clickY <= thumbStart + thumbRect.height) {
      startThumbDrag(event, 'vertical')
      return
    }
    event.preventDefault()
    const thumbMid = thumbStart + thumbRect.height / 2
    const page = Math.max(PAGE_SCROLL_MARGIN, viewportHeight.value - PAGE_SCROLL_MARGIN)
    // 默认 animationMode 'auto'：轨道翻页带动画（decelerate 缓动）
    api.scrollBy(0, clickY < thumbMid ? -page : page)
  }

  const onHBarPointerDown = (event: PointerEvent): void => {
    if (event.pointerType === 'mouse' && event.button !== PRIMARY_BUTTON) {
      return
    }
    if (scrollableWidth.value <= 0) {
      return
    }
    const bar = hBarEl.value
    const thumb = hThumbEl.value
    if (!bar || !thumb) {
      return
    }
    const rect = bar.getBoundingClientRect()
    const thumbRect = thumb.getBoundingClientRect()
    const clickX = event.clientX - rect.left
    const thumbStart = thumbRect.left - rect.left
    if (clickX >= thumbStart && clickX <= thumbStart + thumbRect.width) {
      startThumbDrag(event, 'horizontal')
      return
    }
    event.preventDefault()
    const thumbMid = thumbStart + thumbRect.width / 2
    const page = Math.max(PAGE_SCROLL_MARGIN, viewportWidth.value - PAGE_SCROLL_MARGIN)
    // 默认 animationMode 'auto'：轨道翻页带动画（decelerate 缓动）
    api.scrollBy(clickX < thumbMid ? -page : page, 0)
  }

  const startThumbDrag = (event: PointerEvent, axis: ScrollBarAxis): void => {
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
    const inset = thumbTravelInset(thumb, axis)
    const trackLength = (axis === 'vertical' ? rect.height : rect.width) - inset * 2
    const thumbLengthValue = axis === 'vertical' ? thumb.offsetHeight : thumb.offsetWidth
    const maxTravel = Math.max(MIN_THUMB_TRAVEL, trackLength - thumbLengthValue)
    const pointer = axis === 'vertical' ? event.clientY - rect.top : event.clientX - rect.left
    // 抓取点相对滑块起点，而滑块起点本身含两端按钮 band 的内缩，
    // 因此换算行程比例前要先减掉内缩，否则按住滑块时会发生跳变。
    const ratio = Math.min(Math.max(0, (pointer - thumbDrag.grabOffset - inset) / maxTravel), 1)
    const scrollable = axis === 'vertical' ? scrollableHeight.value : scrollableWidth.value
    const target = ratio * scrollable
    if (axis === 'vertical') {
      offsetY.value = clampY(target)
    } else {
      offsetX.value = clampX(target)
    }
    commitView()
  }

  const onBarPointerUp = (event: PointerEvent): void => {
    // 步进按钮长按与拇指拖拽共用滚动条命中区的指针捕获，先收束长按
    if (stepRepeat && stepRepeat.pointerId === event.pointerId) {
      stopStepRepeat()
    }
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

  /* ---- 轨道两端步进按钮 ---- */

  /** 单次步进：仅沿按钮所在轴移动 SCROLLBAR_STEP，带边界钳制与 reduced-motion 直通 */
  const stepScroll = (axis: ScrollBarAxis, direction: StepDirection): void => {
    const delta = direction * SCROLLBAR_STEP
    const scrollable = axis === 'vertical' ? scrollableHeight.value : scrollableWidth.value
    if (scrollable <= 0) {
      return
    }
    if (animation.resolveAnimationMode('auto') === 'disabled') {
      const before = axis === 'vertical' ? offsetY.value : offsetX.value
      const next = axis === 'vertical' ? clampY(before + delta) : clampX(before + delta)
      if (next === before) {
        return
      }
      if (axis === 'vertical') {
        offsetY.value = next
      } else {
        offsetX.value = next
      }
      commitView()
    } else {
      // 连续步进以「当前动画目标」为基准并 retarget，长按时平滑续接、不产生跳变
      const target = animation.getScrollTarget()
      const nextX = axis === 'horizontal' ? clampX(target.x + delta) : target.x
      const nextY = axis === 'vertical' ? clampY(target.y + delta) : target.y
      if (nextX === target.x && nextY === target.y) {
        return
      }
      animation.animateScrollTo(nextX, nextY, nextId(), true)
    }
    bars.showBars(true)
  }

  const stopStepRepeat = (): void => {
    const state = stepRepeat
    if (!state) {
      return
    }
    stepRepeat = undefined
    if (state.delayTimer !== undefined) {
      globalThis.clearTimeout(state.delayTimer)
    }
    if (state.repeatTimer !== undefined) {
      globalThis.clearInterval(state.repeatTimer)
    }
  }

  const onStepPointerDown = (
    axis: ScrollBarAxis,
    direction: StepDirection,
    event: PointerEvent,
  ): void => {
    if (event.pointerType === 'mouse' && event.button !== PRIMARY_BUTTON) {
      return
    }
    // 阻断冒泡到轨道：否则会同时触发轨道翻页 / 拇指拖拽
    event.preventDefault()
    event.stopPropagation()
    stopStepRepeat()
    inertia.cancelInertia()
    // 在滚动条命中区上捕获指针：移出按钮后仍能收到抬起事件，及时结束长按
    const bar = axis === 'vertical' ? vBarEl.value : hBarEl.value
    bar?.setPointerCapture?.(event.pointerId)
    // 不做 cancelActiveAnimation：连续单击 / 长按都通过 retarget 在当前目标上累加
    stepScroll(axis, direction)
    const state: StepRepeatState = {
      pointerId: event.pointerId,
      delayTimer: undefined,
      repeatTimer: undefined,
    }
    stepRepeat = state
    state.delayTimer = globalThis.setTimeout(() => {
      if (stepRepeat !== state) {
        return
      }
      state.repeatTimer = globalThis.setInterval(
        () => stepScroll(axis, direction),
        SCROLLBAR_REPEAT_INTERVAL,
      )
    }, SCROLLBAR_REPEAT_DELAY)
  }

  onScopeDispose(stopStepRepeat)

  return {
    onVBarPointerDown,
    onHBarPointerDown,
    onThumbPointerMove,
    onBarPointerUp,
    onStepPointerDown,
  }
}

export { useScrollbarInput, type ScrollbarInput, type StepDirection }
