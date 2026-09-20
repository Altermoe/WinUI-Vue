/**
 * 触控 / 笔输入协调：单指平移（含速度采样与惯性衔接）与双指捏合。
 *
 * 负责 activePointers 指针追踪与手势分发；捏合缩放委托给 use-pinch-input，
 * 平移开始前取消进行中的动画 / 惯性，松手后按速度阈值决定是否进入惯性滑行。
 */
/* oxlint-disable max-statements, max-params, no-ternary, no-magic-numbers, id-length --
 * 指针输入属于 FluereScrollView 的复杂交互流程（对齐 WinUI 3 ScrollView）：
 * 平移状态机的结构性 0/1/2 字面量、Vector2 风格的 { x, y } 分量名、以及组合
 * 各子引擎的 4 参工厂签名均属 API 对齐需要，强行套用结构风格规则会把单次
 * 手势拆成碎片。
 */
import {
  DEFAULT_INERTIA_DECAY,
  INERTIA_SPEED_THRESHOLD,
  MIN_POINTER_DELTA_TIME,
  MS_PER_SECOND,
  PRIMARY_BUTTON,
  RAIL_THRESHOLD,
  VELOCITY_SMOOTHING_ALPHA,
  VELOCITY_SMOOTHING_BETA,
} from './constants'
import type { ScrollViewCore } from './core'
import type { ScrollingInputKinds } from './types'
import type { AnimationEngine } from './use-animation'
import type { InertiaEngine } from './use-inertia'
import { usePinchInput } from './use-pinch-input'
import type { ScrollBars } from './use-scroll-bars'

/** 指针输入层暴露给模板的对象 */
interface PointerInput {
  onPointerDown: (event: PointerEvent) => void
  onPointerMove: (event: PointerEvent) => void
  onPointerUp: (event: PointerEvent) => void
}

interface PanState {
  pointerId: number
  startX: number
  startY: number
  lastX: number
  lastY: number
  vx: number
  vy: number
  lastT: number
  axis: 'both' | 'vertical' | 'horizontal' | undefined
}

/** 指针类型 → 忽略输入判定用的输入种类 */
const pointerKind = (event: PointerEvent): 'touch' | 'pen' | 'mouse' => {
  if (event.pointerType === 'touch') {
    return 'touch'
  }
  if (event.pointerType === 'pen') {
    return 'pen'
  }
  return 'mouse'
}

/** 指数平滑更新滑行速度 */
const updatePanVelocity = (
  current: PanState,
  delta: { x: number; y: number; time: number },
): void => {
  current.vx =
    VELOCITY_SMOOTHING_ALPHA * current.vx + VELOCITY_SMOOTHING_BETA * (delta.x / delta.time)
  current.vy =
    VELOCITY_SMOOTHING_ALPHA * current.vy + VELOCITY_SMOOTHING_BETA * (delta.y / delta.time)
}

const usePointerInput = (
  core: ScrollViewCore,
  bars: ScrollBars,
  animation: AnimationEngine,
  inertia: InertiaEngine,
): PointerInput => {
  const {
    viewportEl,
    offsetX,
    offsetY,
    clampX,
    clampY,
    commitView,
    setState,
    canScrollHorizontal,
    canScrollVertical,
  } = core

  let panning: PanState | undefined = undefined
  const activePointers = new Map<number, { x: number; y: number }>()
  const pinch = usePinchInput(core, bars, () => activePointers)

  const isInputIgnored = (kind: ScrollingInputKinds): boolean => {
    const list = Array.isArray(core.props.ignoredInputKinds)
      ? core.props.ignoredInputKinds
      : [core.props.ignoredInputKinds]
    return list.includes('all') || list.includes(kind)
  }

  const shouldRail = (): boolean => {
    if (!canScrollHorizontal() || !canScrollVertical()) {
      return true
    }
    return (
      core.props.horizontalScrollRailMode === 'enabled' &&
      core.props.verticalScrollRailMode === 'enabled'
    )
  }

  const dominantPanAxis = (totalX: number, totalY: number): 'both' | 'vertical' | 'horizontal' => {
    if (!shouldRail()) {
      return 'both'
    }
    return Math.abs(totalX) > Math.abs(totalY) ? 'horizontal' : 'vertical'
  }

  const beginPan = (event: PointerEvent, viewport: HTMLElement): void => {
    animation.cancelActiveAnimation()
    inertia.cancelInertia()
    viewport.setPointerCapture(event.pointerId)
    panning = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      lastX: event.clientX,
      lastY: event.clientY,
      vx: 0,
      vy: 0,
      lastT: globalThis.performance.now(),
      axis: undefined,
    }
    bars.panningActive.value = true
    setState('interaction')
    bars.showBars(true)
  }

  const onPointerDown = (event: PointerEvent): void => {
    if (event.pointerType === 'mouse' && event.button !== PRIMARY_BUTTON) {
      return
    }
    const kind = pointerKind(event)
    if (kind === 'mouse') {
      return
    }
    if (isInputIgnored(kind)) {
      return
    }
    const target = event.target as HTMLElement | null
    if (target && target.closest && target.closest('.fui-scrollview__scrollbar')) {
      return
    }

    const viewport = viewportEl.value
    if (!viewport) {
      return
    }
    activePointers.set(event.pointerId, { x: event.clientX, y: event.clientY })

    if (core.props.zoomMode === 'enabled' && activePointers.size === 2) {
      endPanningGesture(false)
      pinch.beginPinch(viewport)
      return
    }
    if (activePointers.size === 1) {
      beginPan(event, viewport)
    }
  }

  const applyPanDelta = (deltaX: number, deltaY: number): void => {
    const movedX = canScrollHorizontal() ? deltaX : 0
    const movedY = canScrollVertical() ? deltaY : 0
    if (movedX === 0 && movedY === 0) {
      return
    }
    offsetX.value = clampX(offsetX.value + movedX)
    offsetY.value = clampY(offsetY.value + movedY)
    commitView()
  }

  const panPointerMove = (event: PointerEvent): void => {
    if (!panning || event.pointerId !== panning.pointerId) {
      return
    }
    const now = globalThis.performance.now()
    const deltaTime = Math.max(MIN_POINTER_DELTA_TIME, now - panning.lastT)
    const deltaX = event.clientX - panning.lastX
    const deltaY = event.clientY - panning.lastY
    updatePanVelocity(panning, { x: deltaX, y: deltaY, time: deltaTime })
    panning.lastX = event.clientX
    panning.lastY = event.clientY
    panning.lastT = now

    if (panning.axis === undefined) {
      const totalX = event.clientX - panning.startX
      const totalY = event.clientY - panning.startY
      if (Math.hypot(totalX, totalY) > RAIL_THRESHOLD) {
        panning.axis = dominantPanAxis(totalX, totalY)
      }
    }
    let panX = deltaX
    let panY = deltaY
    if (panning.axis === 'vertical') {
      panX = 0
    }
    if (panning.axis === 'horizontal') {
      panY = 0
    }
    applyPanDelta(panX, panY)
  }

  const onPointerMove = (event: PointerEvent): void => {
    const point = activePointers.get(event.pointerId)
    if (point) {
      point.x = event.clientX
      point.y = event.clientY
    }
    if (pinch.isActive()) {
      pinch.onPointerMove()
      return
    }
    panPointerMove(event)
  }

  const endPanningGesture = (applyInertia: boolean): void => {
    if (!panning) {
      return
    }
    const current = panning
    panning = undefined
    bars.panningActive.value = false
    if (!applyInertia) {
      return
    }
    const velocityX = canScrollHorizontal() ? current.vx * MS_PER_SECOND : 0
    const velocityY = canScrollVertical() ? current.vy * MS_PER_SECOND : 0
    if (Math.hypot(velocityX, velocityY) > INERTIA_SPEED_THRESHOLD) {
      inertia.startInertia({
        velocityX,
        velocityY,
        decayX: DEFAULT_INERTIA_DECAY,
        decayY: DEFAULT_INERTIA_DECAY,
        emitCompletion: false,
      })
      return
    }
    offsetX.value = clampX(offsetX.value)
    offsetY.value = clampY(offsetY.value)
    setState('idle')
    core.applyView()
  }

  const onPointerUp = (event: PointerEvent): void => {
    const existed = activePointers.delete(event.pointerId)
    if (!existed) {
      return
    }
    if (pinch.isActive()) {
      pinch.onPointerUp(activePointers.size)
      return
    }
    if (!panning || event.pointerId !== panning.pointerId) {
      return
    }
    const viewport = viewportEl.value
    if (viewport) {
      viewport.releasePointerCapture?.(event.pointerId)
    }
    endPanningGesture(true)
  }

  return { onPointerDown, onPointerMove, onPointerUp }
}

export { usePointerInput, type PointerInput }
