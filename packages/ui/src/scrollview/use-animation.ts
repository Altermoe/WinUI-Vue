/**
 * 动画引擎：rAF 驱动的滚动 / 缩放动画。
 *
 * 滚动统一由「滚动驱动」承担：任意滚动原语（scrollTo / scrollBy / 滚轮 /
 * 键盘 / 轨道翻页 / bringIntoView）都把目标偏移交给 animateScrollTo，由同一
 * 套逐帧缓动逻辑（帧率无关的指数 ease-out，约 99% 在 SCROLL_ANIMATION_DURATION
 * 内收敛）驱动到目标；滚轮等连续输入通过 retarget=true 在运行中的动画上平滑
 * 续接目标，不重启、不产生跳变，也不会在快速滚动时爬行。
 *
 * 缩放保持固定时长的 decelerate 三次贝塞尔（离散目标，见 decelerateEase）。
 * 含 prefers-reduced-motion 响应：resolveAnimationMode 在 auto 模式下据此
 * 决定是否禁用动画，供程序化 API / 输入模块消费。
 */
/* oxlint-disable max-statements, max-params, no-magic-numbers, no-ternary, id-length --
 * 动画状态机属于 FluereScrollView 的复杂交互流程（对齐 WinUI 3 ScrollView）：
 * 结构性的 0/1 字面量（贝塞尔系数、进度边界）与 Vector2 风格 { x, y }
 * 分量名属 API 对齐需要，强行套用结构风格规则会把单帧流程拆成碎片。
 */
import { onScopeDispose, ref } from 'vue'
import {
  DECELERATE_P0_X,
  DECELERATE_P0_Y,
  DECELERATE_P1_X,
  DECELERATE_P1_Y,
  MAX_FRAME_DELTA_TIME,
  MS_PER_SECOND,
  NEWTON_DERIVATIVE_TOLERANCE,
  NEWTON_MAX_ITERATIONS,
  NEWTON_TOLERANCE,
  SCROLL_ANIMATION_DURATION,
  SCROLL_CHASE_DECAY,
  SCROLL_CHASE_EPSILON,
} from './constants'
import type { ScrollViewCore } from './core'
import type { ScrollingAnimationMode } from './types'
import type { ScrollBars } from './use-scroll-bars'

/** 动画引擎暴露给其他模块的对象 */
interface AnimationEngine {
  /** 解析动画模式：enabled/disabled 直通，auto 按 reduced-motion 判定 */
  resolveAnimationMode: (mode: ScrollingAnimationMode | undefined) => ScrollingAnimationMode
  /** 取消进行中的动画（滚动驱动 / 缩放）并补发对应 completed 事件 */
  cancelActiveAnimation: () => void
  /**
   * 统一滚动原语：把目标偏移交给滚动驱动缓动。
   *  - retarget=false（scrollTo / scrollBy / 键盘 / 轨道翻页 / bringIntoView）：
   *    取消旧动画，从当前位置向新目标缓动；
   *  - retarget=true（滚轮连续增量）：在运行中的动画上平滑续接目标；无进行中
   *    动画时启动一段不补发 scroll-completed 的连续动画。
   */
  animateScrollTo: (toX: number, toY: number, correlationId: number, retarget?: boolean) => void
  /** 读取当前滚动目标（无滚动动画时即当前 offset），供滚轮 / 链式计算实际增量 */
  getScrollTarget: () => { x: number; y: number }
  /** 启动一段围绕中心点不变的 zoom 动画（内部取消旧动画） */
  animateZoomTo: (
    nextZoom: number,
    centerPoint: { x: number; y: number },
    correlationId: number,
  ) => void
}

/** 滚动驱动状态：持续追逐目标 offset，支持运行中重定向 */
interface ScrollChase {
  raf: number
  targetX: number
  targetY: number
  correlationId: number
  /** 结束时是否补发 scroll-completed（离散原语为 true，滚轮为 false） */
  emitCompletion: boolean
  lastTime: number
}

/** 缩放动画状态（固定时长 decelerate，离散目标） */
interface ZoomAnimation {
  correlationId: number
  startTime: number
  duration: number
  fromZoom: number
  toZoom: number
  /** 缩放起始时的基准 offset（内容坐标） */
  baseOffsetX: number
  baseOffsetY: number
  centerX: number
  centerY: number
}

/* ---- 缓动曲线（Fluent decelerate cubic-bezier(0.1, 0.9, 0.2, 1)，用于缩放） ---- */

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

  let scrollChase: ScrollChase | undefined = undefined
  let zoomAnimation: ZoomAnimation | undefined = undefined
  let zoomRaf: number | undefined = undefined

  const cancelActiveAnimation = (): void => {
    cancelScrollChase()
    cancelZoomAnimation()
  }

  const cancelScrollChase = (): void => {
    if (!scrollChase) {
      return
    }
    const cancelled = scrollChase
    scrollChase = undefined
    globalThis.cancelAnimationFrame(cancelled.raf)
    if (cancelled.emitCompletion) {
      core.emitScrollCompleted(cancelled.correlationId)
    }
  }

  const cancelZoomAnimation = (): void => {
    if (!zoomAnimation) {
      return
    }
    const cancelled = zoomAnimation
    zoomAnimation = undefined
    if (zoomRaf !== undefined) {
      globalThis.cancelAnimationFrame(zoomRaf)
      zoomRaf = undefined
    }
    core.emitZoomCompleted(cancelled.correlationId)
  }

  /* ---- 滚动驱动（所有滚动原语共用的缓动逻辑） ---- */

  const scrollChaseTick = (now: number): void => {
    const chase = scrollChase
    if (!chase) {
      return
    }
    // 目标随内容边界实时收敛，避免内容尺寸变化后动画无法停止
    chase.targetX = clampX(chase.targetX)
    chase.targetY = clampY(chase.targetY)
    const deltaTime = Math.min(MAX_FRAME_DELTA_TIME, (now - chase.lastTime) / MS_PER_SECOND)
    chase.lastTime = now
    const deltaX = chase.targetX - offsetX.value
    const deltaY = chase.targetY - offsetY.value
    if (Math.abs(deltaX) <= SCROLL_CHASE_EPSILON && Math.abs(deltaY) <= SCROLL_CHASE_EPSILON) {
      offsetX.value = chase.targetX
      offsetY.value = chase.targetY
      finishScrollChase(chase)
      return
    }
    // 帧率无关的指数 ease-out：单帧闭合比例随 dt 自适应，整体约 99% 在
    // SCROLL_ANIMATION_DURATION 内收敛，与固定时长 decelerate 的观感一致
    const step = 1 - Math.exp(-SCROLL_CHASE_DECAY * deltaTime)
    offsetX.value = clampX(offsetX.value + deltaX * step)
    offsetY.value = clampY(offsetY.value + deltaY * step)
    commitView()
    chase.raf = globalThis.requestAnimationFrame(scrollChaseTick)
  }

  const finishScrollChase = (chase: ScrollChase): void => {
    scrollChase = undefined
    setState('idle')
    applyView()
    if (chase.emitCompletion) {
      core.emitScrollCompleted(chase.correlationId)
    }
  }

  const startScrollChase = (
    toX: number,
    toY: number,
    correlationId: number,
    emitCompletion: boolean,
  ): void => {
    cancelActiveAnimation()
    scrollChase = {
      raf: 0,
      targetX: clampX(toX),
      targetY: clampY(toY),
      correlationId,
      emitCompletion,
      lastTime: globalThis.performance.now(),
    }
    setState('animation')
    bars.showBars(true)
    scrollChase.raf = globalThis.requestAnimationFrame(scrollChaseTick)
  }

  const animateScrollTo = (
    toX: number,
    toY: number,
    correlationId: number,
    retarget = false,
  ): void => {
    if (retarget) {
      if (scrollChase) {
        // 滚轮连续增量：平滑续接目标，不重启、不产生跳变
        scrollChase.targetX = clampX(toX)
        scrollChase.targetY = clampY(toY)
        return
      }
      // 滚轮首次触发：启动一段不补发 completed 的连续滚动动画
      startScrollChase(toX, toY, correlationId, false)
      return
    }
    startScrollChase(toX, toY, correlationId, true)
  }

  const getScrollTarget = (): { x: number; y: number } =>
    scrollChase
      ? { x: scrollChase.targetX, y: scrollChase.targetY }
      : { x: offsetX.value, y: offsetY.value }

  /* ---- 缩放动画（固定时长 decelerate，离散目标） ---- */

  const applyZoomAnimationFrame = (current: ZoomAnimation, eased: number): void => {
    const nextZoom = current.fromZoom + (current.toZoom - current.fromZoom) * eased
    zoomFactor.value = nextZoom
    offsetX.value = clampX(
      core.scaleAboutCenter(current.baseOffsetX, current.centerX, nextZoom / current.fromZoom),
    )
    offsetY.value = clampY(
      core.scaleAboutCenter(current.baseOffsetY, current.centerY, nextZoom / current.fromZoom),
    )
  }

  const finishZoomAnimation = (current: ZoomAnimation): void => {
    zoomFactor.value = current.toZoom
    offsetX.value = clampX(
      core.scaleAboutCenter(
        current.baseOffsetX,
        current.centerX,
        current.toZoom / current.fromZoom,
      ),
    )
    offsetY.value = clampY(
      core.scaleAboutCenter(
        current.baseOffsetY,
        current.centerY,
        current.toZoom / current.fromZoom,
      ),
    )
    zoomAnimation = undefined
    zoomRaf = undefined
    setState('idle')
    applyView()
    core.emitZoomCompleted(current.correlationId)
  }

  const zoomAnimationTick = (now: number): void => {
    const current = zoomAnimation
    if (!current) {
      return
    }
    const elapsed = now - current.startTime
    const progress = Math.min(1, elapsed / current.duration)
    const eased = decelerateEase(progress)

    applyZoomAnimationFrame(current, eased)

    if (progress >= 1) {
      finishZoomAnimation(current)
      return
    }
    commitView()
    zoomRaf = globalThis.requestAnimationFrame(zoomAnimationTick)
  }

  const animateZoomTo = (
    nextZoom: number,
    centerPoint: { x: number; y: number },
    correlationId: number,
  ): void => {
    cancelActiveAnimation()
    zoomAnimation = {
      correlationId,
      startTime: globalThis.performance.now(),
      duration: SCROLL_ANIMATION_DURATION,
      fromZoom: zoomFactor.value,
      toZoom: nextZoom,
      baseOffsetX: offsetX.value,
      baseOffsetY: offsetY.value,
      centerX: centerPoint.x,
      centerY: centerPoint.y,
    }
    setState('animation')
    bars.showBars(true)
    zoomRaf = globalThis.requestAnimationFrame(zoomAnimationTick)
  }

  onScopeDispose(() => {
    if (scrollChase) {
      globalThis.cancelAnimationFrame(scrollChase.raf)
    }
    scrollChase = undefined
    if (zoomRaf !== undefined) {
      globalThis.cancelAnimationFrame(zoomRaf)
    }
    zoomAnimation = undefined
    zoomRaf = undefined
    reducedMotionQuery?.removeEventListener('change', reducedMotionHandler)
  })

  return {
    resolveAnimationMode,
    cancelActiveAnimation,
    animateScrollTo,
    getScrollTarget,
    animateZoomTo,
  }
}

export { useAnimation, type AnimationEngine }
