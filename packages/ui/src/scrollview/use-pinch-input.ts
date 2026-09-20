/**
 * 双指捏合缩放：以两指中点为中心实时应用缩放。
 *
 * 与单指平移（use-pointer-input）共享 activePointers 追踪表，通过
 * getActivePointers 访问器注入，避免本模块直接持有全局指针状态。
 */
/* oxlint-disable max-statements, no-ternary, no-magic-numbers, id-length --
 * 捏合几何（起始距离 / 中心点）与结构性 0/1/2 字面量（指针数量边界）属
 * 领域计算，且 API 刻意使用 Vector2 风格的 { x, y } 分量名。
 */
import { HALF } from './constants'
import type { ScrollViewCore } from './core'
import type { ScrollBars } from './use-scroll-bars'

/** 捏合层暴露给指针协调模块的对象 */
interface PinchInput {
  /** 捏合是否进行中 */
  isActive: () => boolean
  /** 在两指落点成立时启动捏合（由指针模块先结束平移） */
  beginPinch: (viewport: HTMLElement) => void
  /** 任一指针移动时按当前两指距离重算缩放 */
  onPointerMove: () => void
  /** 指针抬起后，若剩余指针不足两指则结束捏合并复位状态 */
  onPointerUp: (remaining: number) => void
}

interface PinchState {
  startDist: number
  startZoom: number
  cx: number
  cy: number
}

const usePinchInput = (
  core: ScrollViewCore,
  bars: ScrollBars,
  getActivePointers: () => ReadonlyMap<number, { x: number; y: number }>,
): PinchInput => {
  const { offsetX, offsetY, zoomFactor, clampX, clampY, commitView, setState } = core

  let pinch: PinchState | undefined = undefined

  const isActive = (): boolean => pinch !== undefined

  const beginPinch = (viewport: HTMLElement): void => {
    const points = [...getActivePointers().values()]
    const [first, second] = points
    if (!first || !second) {
      return
    }
    const rect = viewport.getBoundingClientRect()
    pinch = {
      startDist: Math.hypot(second.x - first.x, second.y - first.y) || 1,
      startZoom: zoomFactor.value,
      cx: (first.x + second.x) * HALF - rect.left,
      cy: (first.y + second.y) * HALF - rect.top,
    }
    setState('interaction')
    bars.showBars(true)
  }

  /** 以视口坐标 (centerX, centerY) 为中心立即应用缩放 */
  const applyZoomCentered = (nextZoom: number, centerX: number, centerY: number): void => {
    const fromZoom = zoomFactor.value
    const toZoom = Math.min(Math.max(nextZoom, core.props.minZoomFactor), core.props.maxZoomFactor)
    if (toZoom === fromZoom) {
      return
    }
    zoomFactor.value = toZoom
    offsetX.value = clampX(core.scaleAboutCenter(offsetX.value, centerX, toZoom / fromZoom))
    offsetY.value = clampY(core.scaleAboutCenter(offsetY.value, centerY, toZoom / fromZoom))
    commitView()
    bars.showBars(true)
  }

  const onPointerMove = (): void => {
    if (!pinch || getActivePointers().size !== 2) {
      return
    }
    const points = [...getActivePointers().values()]
    const [first, second] = points
    if (!first || !second) {
      return
    }
    const distance = Math.hypot(second.x - first.x, second.y - first.y) || 1
    const ratio = distance / pinch.startDist
    applyZoomCentered(pinch.startZoom * ratio, pinch.cx, pinch.cy)
  }

  const onPointerUp = (remaining: number): void => {
    if (!pinch) {
      return
    }
    if (remaining < 2) {
      pinch = undefined
      setState('idle')
    }
  }

  return { isActive, beginPinch, onPointerMove, onPointerUp }
}

export { usePinchInput, type PinchInput }
