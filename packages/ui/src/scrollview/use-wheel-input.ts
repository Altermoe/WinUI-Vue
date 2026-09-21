/**
 * 滚轮输入：滚动增量应用、ctrl/⌘ 缩放、以及嵌套 ScrollView 的滚轮归属。
 *
 * 归属模型（对齐 WinUI 3；仅针对鼠标滚轮）：指针所在的、在该滚动方向上确实
 * 可滚动的最近一个 ScrollView 独占本次滚轮 —— 它给事件打上归属标记并
 * preventDefault，祖先 ScrollView 在 onWheel 开头直接跳过。于是无论内层是否
 * 到达滚动极限，外层都不会跟着滚动；只有当指针落在不属于任何子滚动容器的
 * 元素上时，外层才会接管。内层在该方向没有可滚动内容（或方向被禁用）时不
 * 占有事件，冒泡交给外层，避免滚轮「死区」。触控 / 笔由 setPointerCapture
 * 天然独占，不受影响。
 *
 * 本模块同时拥有 scroll chain 的注册表生命周期（根元素 → 处理器）；仅
 * scrollChainMode='always' 时保留旧行为：把剩余增量显式交给外层 ScrollView。
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
import {
  claimWheelEvent,
  findParentScroller,
  isWheelEventClaimed,
  registerScrollChain,
  unregisterScrollChain,
} from './scroll-chain'
import type { ScrollChainHandle } from './scroll-chain'
import type { ScrollingChainMode, ScrollingInputKinds } from './types'
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

  /** 该轴的滚动链式模式：仅 'always' 保留旧的「剩余增量链给外层」行为 */
  const chainMode = (axis: 'horizontal' | 'vertical'): ScrollingChainMode =>
    axis === 'horizontal'
      ? core.props.horizontalScrollChainMode
      : core.props.verticalScrollChainMode

  /** 本视图在该方向是否确实可滚动（可滚动即由本视图独占本次滚轮，含到达极限时） */
  const ownsAxis = (axis: 'horizontal' | 'vertical'): boolean =>
    axis === 'horizontal' ? canScrollHorizontal() : canScrollVertical()

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

  const onWheel = (event: WheelEvent): void => {
    if (isInputIgnored('mouseWheel')) {
      return
    }
    // 后代 ScrollView 已接管本次滚轮：祖先一律不响应（不滚动、不改动事件）。
    // 这是「指针在子滚动容器内时滚轮不扩散到外层」的关键：事件冒泡顺序保证
    // 最近的 ScrollView 先处理并打标，此处只负责跳过。
    if (isWheelEventClaimed(event)) {
      return
    }
    if (applyWheelZoom(event)) {
      claimWheelEvent(event)
      return
    }

    const normalized = normalizeWheelDelta(event)
    const canHorizontal = canScrollHorizontal()
    const canVertical = canScrollVertical()
    let { deltaX } = normalized
    let { deltaY } = normalized
    if (deltaX === 0 && deltaY === 0) {
      return
    }
    // 主轴选择：仅一个方向可滚动时，把增量归一到该方向
    if (canVertical && !canHorizontal && Math.abs(deltaY) >= Math.abs(deltaX)) {
      deltaX = 0
    } else if (canHorizontal && !canVertical && Math.abs(deltaX) > Math.abs(deltaY)) {
      deltaY = 0
    }
    if (deltaX === 0 && deltaY === 0) {
      return
    }

    // 归属判定：只有「该方向确实可滚动」的最近容器才独占本次滚轮。
    // 不可滚动（或该方向被禁用）则不占有，留给外层接管，避免滚轮死区。
    const dominant = Math.abs(deltaY) >= Math.abs(deltaX) ? 'vertical' : 'horizontal'
    if (!ownsAxis(dominant)) {
      return
    }

    // 本视图独占：立即阻止页面等原生祖先滚动，并标记事件让外层 ScrollView 跳过。
    // 无论是否到达极限都保持独占（对齐 WinUI 3），因此到极限时不会「外溢」。
    claimWheelEvent(event)
    event.preventDefault()

    const moved = applyScrollDelta(deltaX, deltaY)
    // 仅 chainMode='always' 的逃生舱路径把剩余增量显式交给外层
    chainRemainingDelta(deltaX - moved.movedX, deltaY - moved.movedY)
  }

  /** 把边界处的剩余增量交给外层 ScrollView（仅 chainMode='always'） */
  const chainRemainingDelta = (remainingX: number, remainingY: number): void => {
    const chainX = remainingX !== 0 && chainMode('horizontal') === 'always'
    const chainY = remainingY !== 0 && chainMode('vertical') === 'always'
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

  /** 外层 ScrollView 调用的链式入口（chainMode='always'），本身仍可继续向上传递 */
  const chainScrollBy = (deltaX: number, deltaY: number): void => {
    const moved = applyScrollDelta(deltaX, deltaY)
    chainRemainingDelta(deltaX - moved.movedX, deltaY - moved.movedY)
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
