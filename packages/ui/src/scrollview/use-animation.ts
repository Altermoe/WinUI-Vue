/**
 * 动画引擎：rAF 驱动的滚动 / 缩放动画与 Fluent decelerate 缓动曲线。
 *
 * 含 prefers-reduced-motion 响应：resolveAnimationMode 在 auto 模式下据此
 * 决定是否禁用动画，供程序化 API 消费。
 */
/* oxlint-disable max-statements, no-magic-numbers, no-ternary, id-length --
 * 动画状态机属于 FluereScrollView 的复杂交互流程（对齐 WinUI 3 ScrollView）：
 * 结构性的 0/1/2/3 字面量（贝塞尔系数、进度边界）与 Vector2 风格 { x, y }
 * 分量名属 API 对齐需要，强行套用结构风格规则会把单帧流程拆成碎片。
 */
import { onScopeDispose, ref } from 'vue'
import {
  DECELERATE_P0_X,
  DECELERATE_P0_Y,
  DECELERATE_P1_X,
  DECELERATE_P1_Y,
  NEWTON_DERIVATIVE_TOLERANCE,
  NEWTON_MAX_ITERATIONS,
  NEWTON_TOLERANCE,
  SCROLL_ANIMATION_DURATION,
} from './constants'
import type { ScrollViewCore } from './core'
import type { ScrollingAnimationMode } from './types'
import type { ScrollBars } from './use-scroll-bars'

/** 动画引擎暴露给其他模块的对象 */
interface AnimationEngine {
  /** 解析动画模式：enabled/disabled 直通，auto 按 reduced-motion 判定 */
  resolveAnimationMode: (mode: ScrollingAnimationMode | undefined) => ScrollingAnimationMode
  /** 取消进行中的动画并补发对应 completed 事件 */
  cancelActiveAnimation: () => void
  /** 启动一段 offset 动画（内部取消旧动画） */
  animateOffsetTo: (toX: number, toY: number, correlationId: number) => void
  /** 启动一段围绕中心点不变的 zoom 动画（内部取消旧动画） */
  animateZoomTo: (
    nextZoom: number,
    centerPoint: { x: number; y: number },
    correlationId: number,
  ) => void
}

interface ActiveAnimation {
  kind: 'scroll' | 'zoom'
  correlationId: number
  startTime: number
  duration: number
  fromX: number
  fromY: number
  toX: number
  toY: number
  fromZoom: number
  toZoom: number
  centerX: number
  centerY: number
}

/* ---- 缓动曲线（Fluent decelerate cubic-bezier(0.1, 0.9, 0.2, 1)） ---- */

/** 三次贝塞尔采样：给定 x 求 y（用于自定义缓动曲线） */
const cubicBezierSampleX = (
  progress: number,
  coefficients: { cubic: number; quadratic: number; linear: number },
): number =>
  ((coefficients.cubic * progress + coefficients.quadratic) * progress + coefficients.linear) *
  progress

const decelerateEase = (progress: number): number => {
  const coefficientCx = 3 * DECELERATE_P0_X
  const coefficientBx = 3 * (DECELERATE_P1_X - DECELERATE_P0_X) - coefficientCx
  const coefficientAx = 1 - coefficientCx - coefficientBx
  const coefficientCy = 3 * DECELERATE_P0_Y
  const coefficientBy = 3 * (DECELERATE_P1_Y - DECELERATE_P0_Y) - coefficientCy
  const coefficientAy = 1 - coefficientCy - coefficientBy

  // 用牛顿法解 x(t) = 给定进度
  let sample = Math.min(Math.max(progress, 0), 1)
  for (let index = 0; index < NEWTON_MAX_ITERATIONS; index++) {
    const value = cubicBezierSampleX(sample, {
      cubic: coefficientAx,
      quadratic: coefficientBx,
      linear: coefficientCx,
    })
    if (Math.abs(value - progress) < NEWTON_TOLERANCE) {
      break
    }
    const derivative = (3 * coefficientAx * sample + 2 * coefficientBx) * sample + coefficientCx
    if (Math.abs(derivative) < NEWTON_DERIVATIVE_TOLERANCE) {
      break
    }
    sample -= (value - progress) / derivative
    sample = Math.min(Math.max(sample, 0), 1)
  }
  return cubicBezierSampleX(sample, {
    cubic: coefficientAy,
    quadratic: coefficientBy,
    linear: coefficientCy,
  })
}

const useAnimation = (core: ScrollViewCore, bars: ScrollBars): AnimationEngine => {
  const { offsetX, offsetY, zoomFactor, clampX, clampY, applyView, commitView, setState } = core

  /* ---- 动画偏好（reduced motion） ---- */

  const reducedMotion = ref(false)
  let reducedMotionQuery: MediaQueryList | undefined = undefined

  reducedMotionQuery = globalThis.matchMedia('(prefers-reduced-motion: reduce)')
  reducedMotion.value = reducedMotionQuery.matches
  const reducedMotionHandler = (event: MediaQueryListEvent): void => {
    reducedMotion.value = event.matches
  }
  reducedMotionQuery.addEventListener('change', reducedMotionHandler)
  onScopeDispose(() => {
    reducedMotionQuery?.removeEventListener('change', reducedMotionHandler)
  })

  const resolveAnimationMode = (
    mode: ScrollingAnimationMode | undefined,
  ): ScrollingAnimationMode => {
    if (mode === 'enabled') {
      return 'enabled'
    }
    if (mode === 'disabled') {
      return 'disabled'
    }
    return reducedMotion.value ? 'disabled' : 'enabled'
  }

  /* ---- 动画状态机 ---- */

  let animation: ActiveAnimation | undefined = undefined
  let animationRaf: number | undefined = undefined

  const cancelActiveAnimation = (): void => {
    if (!animation) {
      return
    }
    const cancelled = animation
    animation = undefined
    if (animationRaf !== undefined) {
      globalThis.cancelAnimationFrame(animationRaf)
      animationRaf = undefined
    }
    if (cancelled.kind === 'scroll') {
      core.emitScrollCompleted(cancelled.correlationId)
    } else {
      core.emitZoomCompleted(cancelled.correlationId)
    }
  }

  const applyScrollAnimationFrame = (current: ActiveAnimation, eased: number): void => {
    offsetX.value = current.fromX + (current.toX - current.fromX) * eased
    offsetY.value = current.fromY + (current.toY - current.fromY) * eased
  }

  const applyZoomAnimationFrame = (current: ActiveAnimation, eased: number): void => {
    const nextZoom = current.fromZoom + (current.toZoom - current.fromZoom) * eased
    zoomFactor.value = nextZoom
    offsetX.value = clampX(
      core.scaleAboutCenter(current.fromX, current.centerX, nextZoom / current.fromZoom),
    )
    offsetY.value = clampY(
      core.scaleAboutCenter(current.fromY, current.centerY, nextZoom / current.fromZoom),
    )
  }

  const finishAnimation = (current: ActiveAnimation): void => {
    if (current.kind === 'scroll') {
      offsetX.value = current.toX
      offsetY.value = current.toY
    } else {
      zoomFactor.value = current.toZoom
      offsetX.value = clampX(
        core.scaleAboutCenter(current.fromX, current.centerX, current.toZoom / current.fromZoom),
      )
      offsetY.value = clampY(
        core.scaleAboutCenter(current.fromY, current.centerY, current.toZoom / current.fromZoom),
      )
    }
    animation = undefined
    animationRaf = undefined
    setState('idle')
    applyView()
    if (current.kind === 'scroll') {
      core.emitScrollCompleted(current.correlationId)
    } else {
      core.emitZoomCompleted(current.correlationId)
    }
  }

  const animationTick = (now: number): void => {
    const current = animation
    if (!current) {
      return
    }
    const elapsed = now - current.startTime
    const progress = Math.min(1, elapsed / current.duration)
    const eased = decelerateEase(progress)

    if (current.kind === 'scroll') {
      applyScrollAnimationFrame(current, eased)
    } else {
      applyZoomAnimationFrame(current, eased)
    }

    if (progress >= 1) {
      finishAnimation(current)
      return
    }
    commitView()
    animationRaf = globalThis.requestAnimationFrame(animationTick)
  }

  const startAnimation = (nextAnimation: ActiveAnimation): void => {
    cancelActiveAnimation()
    animation = nextAnimation
    setState('animation')
    bars.showBars(true)
    animationRaf = globalThis.requestAnimationFrame(animationTick)
  }

  const animateOffsetTo = (toX: number, toY: number, correlationId: number): void => {
    startAnimation({
      kind: 'scroll',
      correlationId,
      startTime: globalThis.performance.now(),
      duration: SCROLL_ANIMATION_DURATION,
      fromX: offsetX.value,
      fromY: offsetY.value,
      toX,
      toY,
      fromZoom: zoomFactor.value,
      toZoom: zoomFactor.value,
      centerX: 0,
      centerY: 0,
    })
  }

  const animateZoomTo = (
    nextZoom: number,
    centerPoint: { x: number; y: number },
    correlationId: number,
  ): void => {
    startAnimation({
      kind: 'zoom',
      correlationId,
      startTime: globalThis.performance.now(),
      duration: SCROLL_ANIMATION_DURATION,
      fromX: offsetX.value,
      fromY: offsetY.value,
      toX: 0,
      toY: 0,
      fromZoom: zoomFactor.value,
      toZoom: nextZoom,
      centerX: centerPoint.x,
      centerY: centerPoint.y,
    })
  }

  return {
    resolveAnimationMode,
    cancelActiveAnimation,
    animateOffsetTo,
    animateZoomTo,
  }
}

export { useAnimation, type AnimationEngine }
