/**
 * BringIntoView：把指定元素滚动进视口（对齐 WinUI ScrollView.BringIntoView）。
 *
 * 独立成模块是因为它与 ScrollTo 系列的目标计算完全不同（元素几何 → 目标偏移），
 * 且支持通过 bring-into-view 事件取消或调整目标。
 */
/* oxlint-disable max-statements, no-ternary, no-magic-numbers, id-length --
 * 元素对齐算法（WinUI BringIntoView 语义）的目标回退判定与结构性 0/1/2 字面量
 * （margin 倍数边界）属领域计算，且 API 刻意使用 Vector2 风格的 { x, y } 分量名。
 */
import type { ScrollViewCore } from './core'
import type { ScrollingBringingIntoViewEventArgs } from './types'
import type { AnimationEngine } from './use-animation'

/** BringIntoView 暴露给外部 API 的对象 */
interface BringIntoViewController {
  bringIntoView: (element: HTMLElement, options?: { margin?: number }) => number
}

const useBringIntoView = (
  core: ScrollViewCore,
  animation: AnimationEngine,
): BringIntoViewController => {
  const {
    viewportEl,
    viewportWidth,
    viewportHeight,
    offsetX,
    offsetY,
    zoomFactor,
    clampX,
    clampY,
  } = core

  const computeTarget = (
    element: HTMLElement,
    margin: number,
  ): { targetX: number; targetY: number } => {
    const viewport = viewportEl.value
    const zoom = zoomFactor.value
    if (!viewport) {
      return { targetX: offsetX.value, targetY: offsetY.value }
    }
    const viewportRect = viewport.getBoundingClientRect()
    const elementRect = element.getBoundingClientRect()
    const contentX = (elementRect.left - viewportRect.left - offsetX.value) / zoom
    const contentY = (elementRect.top - viewportRect.top - offsetY.value) / zoom
    const contentWidth = elementRect.width / zoom
    const contentHeight = elementRect.height / zoom

    let targetX = offsetX.value
    let targetY = offsetY.value
    if (contentWidth > viewportWidth.value - margin * 2) {
      targetX = margin - zoom * contentX
    } else if (offsetX.value + zoom * contentX < margin) {
      targetX = margin - zoom * contentX
    } else if (
      offsetX.value + zoom * contentX + zoom * contentWidth >
      viewportWidth.value - margin
    ) {
      targetX = viewportWidth.value - margin - zoom * contentX - zoom * contentWidth
    }
    if (contentHeight > viewportHeight.value - margin * 2) {
      targetY = margin - zoom * contentY
    } else if (offsetY.value + zoom * contentY < margin) {
      targetY = margin - zoom * contentY
    } else if (
      offsetY.value + zoom * contentY + zoom * contentHeight >
      viewportHeight.value - margin
    ) {
      targetY = viewportHeight.value - margin - zoom * contentY - zoom * contentHeight
    }
    return { targetX: clampX(targetX), targetY: clampY(targetY) }
  }

  const bringIntoView = (element: HTMLElement, options?: { margin?: number }): number => {
    const id = core.nextId()
    if (!viewportEl.value) {
      core.emitScrollCompleted(id)
      return id
    }
    const margin = options?.margin ?? 0
    const target = computeTarget(element, margin)

    const args: ScrollingBringingIntoViewEventArgs = {
      targetHorizontalOffset: target.targetX,
      targetVerticalOffset: target.targetY,
      correlationId: id,
      cancel: false,
    }
    core.events.bringIntoView(args)
    if (args.cancel) {
      core.emitScrollCompleted(id)
      return id
    }
    if (target.targetX === offsetX.value && target.targetY === offsetY.value) {
      core.emitScrollCompleted(id)
      return id
    }
    core.events.scrollAnimationStarting({
      startPosition: { x: offsetX.value, y: offsetY.value },
      endPosition: { x: target.targetX, y: target.targetY },
      correlationId: id,
    })
    animation.animateOffsetTo(target.targetX, target.targetY, id)
    return id
  }

  return { bringIntoView }
}

export { useBringIntoView, type BringIntoViewController }
