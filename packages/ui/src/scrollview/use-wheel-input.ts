/**
 * 滚轮输入：滚动增量应用、ctrl/⌘ 缩放、以及边界处的滚动链式传递。
 *
 * 本模块同时拥有 scroll chain 的注册表生命周期（根元素 → 处理器），
 * 并暴露外层 ScrollView 可调用的 chainScrollBy 入口。
 */
/* oxlint-disable max-statements, max-params, no-ternary, no-magic-numbers, id-length --
 * 滚轮输入属于 FluereScrollView 的复杂交互流程（对齐 WinUI 3 ScrollView）：
 * 归一化 / 主轴选择的结构性 0/1/2 字面量（deltaMode 与主轴判定）与 Vector2
 * 风格的 { x, y } 分量名属 API 对齐需要，强行套用结构风格规则会把单次
 * 滚轮处理拆成碎片。
 */
import { onMounted, onScopeDispose } from 'vue'
import { WHEEL_LINE_HEIGHT, WHEEL_ZOOM_FACTOR_STEP, WHEEL_ZOOM_STEP_DIVISOR } from './constants'
import type { ScrollViewCore } from './core'
import { findParentScroller, registerScrollChain, unregisterScrollChain } from './scroll-chain'
import type { ScrollChainHandle } from './scroll-chain'
import type { ScrollingInputKinds } from './types'
import type { AnimationEngine } from './use-animation'
import type { ScrollApi } from './use-scroll-api'
import type { ScrollBars } from './use-scroll-bars'

/** 滚轮输入层暴露给模板 / 外部链式调用的对象 */
export interface WheelInput {
  onWheel: (event: WheelEvent) => void
  /** 注册到滚动链注册表、供外层 ScrollView 调用的处理器 */
  chainHandle: ScrollChainHandle
}

export const useWheelInput = (
  core: ScrollViewCore,
  bars: ScrollBars,
  api: ScrollApi,
  animation: AnimationEngine,
): WheelInput => {
  const {
    rootEl,
    viewportEl,
    viewportWidth,
    viewportHeight,
    offsetX,
    offsetY,
    clampX,
    clampY,
    commitView,
    canScrollHorizontal,
    canScrollVertical,
  } = core

  const isInputIgnored = (kind: ScrollingInputKinds): boolean => {
    const list = Array.isArray(core.props.ignoredInputKinds)
      ? core.props.ignoredInputKinds
      : [core.props.ignoredInputKinds]
    return list.includes('all') || list.includes(kind)
  }

  const shouldChain = (axis: 'horizontal' | 'vertical'): boolean => {
    const mode =
      axis === 'horizontal'
        ? core.props.horizontalScrollChainMode
        : core.props.verticalScrollChainMode
    return mode !== 'never'
  }

  /** 应用一段滚动增量，返回实际移动量（与传入 delta 同号：正 = 沿增量方向滚动）。
   *
   * 缓动模式下以「目标偏移增量」计量，交由统一滚动驱动动画化执行（retarget
   * 平滑续接，与键盘 / 翻页 / scrollTo 共用同一套缓动逻辑）；prefers-reduced-motion
   * 等禁用动画时直接写 offset（直通）。 */
  const applyScrollDelta = (deltaX: number, deltaY: number): { movedX: number; movedY: number } => {
    let movedX = 0
    let movedY = 0
    if (animation.resolveAnimationMode('auto') === 'disabled') {
      // 直通（reduced-motion）：直接写 offset
      if (canScrollHorizontal() && deltaX !== 0) {
        const before = offsetX.value
        // 内容坐标约定：滚轮向右/下（delta>0）→ 看到更靠右/下的内容 → offset 增大
        offsetX.value = clampX(offsetX.value + deltaX)
        movedX = offsetX.value - before
      }
      if (canScrollVertical() && deltaY !== 0) {
        const before = offsetY.value
        offsetY.value = clampY(offsetY.value + deltaY)
        movedY = offsetY.value - before
      }
      if (movedX !== 0 || movedY !== 0) {
        commitView()
      }
    } else {
      // 缓动：以目标偏移增量驱动统一滚动动画
      const target = animation.getScrollTarget()
      let nextX = target.x
      let nextY = target.y
      if (canScrollHorizontal() && deltaX !== 0) {
        const before = target.x
        nextX = clampX(before + deltaX)
        movedX = nextX - before
      }
      if (canScrollVertical() && deltaY !== 0) {
        const before = target.y
        nextY = clampY(before + deltaY)
        movedY = nextY - before
      }
      if (movedX !== 0 || movedY !== 0) {
        animation.animateScrollTo(nextX, nextY, core.nextId(), true)
      }
    }
    if (movedX !== 0 || movedY !== 0) {
      bars.showBars(true)
    }
    return { movedX, movedY }
  }

  const applyWheelZoom = (event: WheelEvent): boolean => {
    if (core.props.zoomMode !== 'enabled') {
      return false
    }
    if (!event.ctrlKey && !event.metaKey) {
      return false
    }
    event.preventDefault()
    const viewport = viewportEl.value
    if (!viewport) {
      return true
    }
    const rect = viewport.getBoundingClientRect()
    const centerX = event.clientX - rect.left
    const centerY = event.clientY - rect.top
    const factor = WHEEL_ZOOM_FACTOR_STEP ** (-event.deltaY / WHEEL_ZOOM_STEP_DIVISOR)
    // 默认 animationMode 'auto'：带动画的原地缩放（缩放中心为指针），
    // 缩放过程中 scaleAboutCenter + clamp 保证不脱离视口
    api.zoomBy(factor - 1, { x: centerX, y: centerY })
    return true
  }

  const normalizeWheelDelta = (event: WheelEvent): { deltaX: number; deltaY: number } => {
    let { deltaX } = event
    let { deltaY } = event
    if (event.deltaMode === 1) {
      deltaX *= WHEEL_LINE_HEIGHT
      deltaY *= WHEEL_LINE_HEIGHT
    } else if (event.deltaMode === 2) {
      deltaX *= viewportWidth.value
      deltaY *= viewportHeight.value
    }
    if (event.shiftKey && deltaX === 0 && deltaY !== 0) {
      deltaX = deltaY
      deltaY = 0
    }
    return { deltaX, deltaY }
  }

  const wheelOwnsDirection = (dominant: 'horizontal' | 'vertical'): boolean => {
    if (dominant === 'vertical') {
      return canScrollVertical()
    }
    return canScrollHorizontal()
  }

  const onWheel = (event: WheelEvent): void => {
    if (isInputIgnored('mouseWheel')) {
      return
    }
    if (applyWheelZoom(event)) {
      return
    }

    const normalized = normalizeWheelDelta(event)
    const canHorizontal = canScrollHorizontal()
    const canVertical = canScrollVertical()
    let { deltaX } = normalized
    let { deltaY } = normalized
    // 主轴选择：仅一个方向可滚动时，把增量归一到该方向
    if (canVertical && !canHorizontal && Math.abs(deltaY) >= Math.abs(deltaX)) {
      deltaX = 0
    } else if (canHorizontal && !canVertical && Math.abs(deltaX) > Math.abs(deltaY)) {
      deltaY = 0
    }

    const moved = applyScrollDelta(deltaX, deltaY)
    const consumed = moved.movedX !== 0 || moved.movedY !== 0
    if (consumed) {
      event.preventDefault()
      chainRemainingDelta(deltaX - moved.movedX, deltaY - moved.movedY)
      return
    }

    // 未实际滚动：若方向属于我们但到达边界，链式交给外层；否则交给浏览器原生祖先
    const dominant = Math.abs(deltaY) >= Math.abs(deltaX) ? 'vertical' : 'horizontal'
    if (wheelOwnsDirection(dominant) && !shouldChain(dominant)) {
      event.preventDefault()
    }
  }

  /** 把边界处的剩余增量交给外层 ScrollView */
  const chainRemainingDelta = (remainingX: number, remainingY: number): void => {
    const chainX = shouldChain('horizontal') && remainingX !== 0
    const chainY = shouldChain('vertical') && remainingY !== 0
    if (!chainX && !chainY) {
      return
    }
    const root = rootEl.value
    if (!root) {
      return
    }
    const parent = findParentScroller(root)
    if (parent) {
      parent.chainScrollBy(chainX ? remainingX : 0, chainY ? remainingY : 0)
    }
  }

  /** 外层 ScrollView 调用的链式入口 */
  const chainScrollBy = (deltaX: number, deltaY: number): void => {
    applyScrollDelta(deltaX, deltaY)
  }

  const chainHandle: ScrollChainHandle = { chainScrollBy }

  onMounted(() => {
    const root = rootEl.value
    if (root) {
      registerScrollChain(root, chainHandle)
    }
  })

  onScopeDispose(() => {
    const root = rootEl.value
    if (root) {
      unregisterScrollChain(root)
    }
  })

  return { onWheel, chainHandle }
}
