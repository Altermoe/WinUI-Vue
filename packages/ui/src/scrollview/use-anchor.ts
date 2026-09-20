/**
 * 锚点（Anchor）逻辑：对齐 ScrollView 的 anchor 相关 API。
 *
 * 内容变化后维持锚点元素在视口内的位置不变；候选来自显式注册
 * （registerAnchorCandidate）与 [data-can-scroll-anchor] 标记两种来源。
 */
/* oxlint-disable max-statements, no-ternary, no-magic-numbers, id-length --
 * 锚点逻辑属于 FluereScrollView 的复杂交互流程（对齐 WinUI 3 ScrollView）：
 * 结构性的 0 字面量（空候选判断）与 Vector2 风格的 { x, y } 分量名属
 * API 对齐需要，强行套用结构风格规则会把选择流程拆成碎片。
 */
import { HALF } from './constants'
import type { ScrollViewCore } from './core'
import type { ScrollingAnchorRequestedEventArgs } from './types'

/** 锚点层暴露给其他模块 / 外部 API 的对象 */
interface AnchorController {
  /** 是否启用了任意轴向锚定 */
  anchorEnabled: () => boolean
  registerAnchorCandidate: (element: HTMLElement) => void
  unregisterAnchorCandidate: (element: HTMLElement) => void
  /** 基于当前锚点比例选择锚点元素 */
  selectAnchor: () => void
  /** 内容变化后维持锚点元素位置不变 */
  reAnchor: () => void
}

interface AnchorRef {
  el: HTMLElement
  screenX?: number
  screenY?: number
}

const useAnchor = (core: ScrollViewCore): AnchorController => {
  const { contentEl, viewportEl, offsetX, offsetY, zoomFactor, clampX, clampY, events } = core

  const anchorCandidatesSet = new Set<HTMLElement>()
  let anchorRef: AnchorRef | undefined = undefined

  const anchorEnabled = (): boolean =>
    !Number.isNaN(core.props.horizontalAnchorRatio) || !Number.isNaN(core.props.verticalAnchorRatio)

  const registerAnchorCandidate = (element: HTMLElement): void => {
    anchorCandidatesSet.add(element)
  }

  const unregisterAnchorCandidate = (element: HTMLElement): void => {
    anchorCandidatesSet.delete(element)
    if (anchorRef && anchorRef.el === element) {
      anchorRef = undefined
    }
  }

  const collectCandidates = (): HTMLElement[] => {
    const candidates = new Set<HTMLElement>(anchorCandidatesSet)
    const content = contentEl.value
    if (content) {
      content.querySelectorAll<HTMLElement>('[data-can-scroll-anchor]').forEach((element) => {
        const marker = element.dataset.canScrollAnchor
        if (marker === 'true' || marker === '') {
          candidates.add(element)
        }
      })
    }
    return [...candidates]
  }

  const pickAnchorFromCandidates = (candidates: HTMLElement[]): HTMLElement | undefined => {
    const viewport = viewportEl.value
    if (!viewport || candidates.length === 0) {
      return undefined
    }
    const viewportRect = viewport.getBoundingClientRect()
    const anchorX = core.props.horizontalAnchorRatio
    const anchorY = core.props.verticalAnchorRatio
    let best: HTMLElement | undefined = undefined
    let bestDistance = Number.POSITIVE_INFINITY
    for (const candidate of candidates) {
      const rect = candidate.getBoundingClientRect()
      let distance = 0
      if (!Number.isNaN(anchorX)) {
        distance += Math.abs(
          rect.left + rect.width * HALF - (viewportRect.left + anchorX * viewportRect.width),
        )
      }
      if (!Number.isNaN(anchorY)) {
        distance += Math.abs(
          rect.top + rect.height * HALF - (viewportRect.top + anchorY * viewportRect.height),
        )
      }
      if (distance < bestDistance) {
        bestDistance = distance
        best = candidate
      }
    }
    return best
  }

  const selectAnchor = (): void => {
    if (!anchorEnabled() || !viewportEl.value) {
      core.currentAnchor.value = undefined
      anchorRef = undefined
      return
    }
    const args: ScrollingAnchorRequestedEventArgs = {
      anchorCandidates: collectCandidates(),
      anchorElement: undefined,
    }
    events.anchorRequested(args)
    const explicit = args.anchorElement
    const anchor = explicit ?? pickAnchorFromCandidates(args.anchorCandidates)
    core.currentAnchor.value = anchor
    if (!anchor) {
      anchorRef = undefined
      return
    }
    const viewportRect = viewportEl.value!.getBoundingClientRect()
    const elementRect = anchor.getBoundingClientRect()
    anchorRef = {
      el: anchor,
      screenX: Number.isNaN(core.props.horizontalAnchorRatio)
        ? undefined
        : elementRect.left - viewportRect.left,
      screenY: Number.isNaN(core.props.verticalAnchorRatio)
        ? undefined
        : elementRect.top - viewportRect.top,
    }
  }

  /** 内容变化后，维持锚点元素在视口内的位置不变 */
  const reAnchor = (): void => {
    if (!anchorRef) {
      selectAnchor()
      return
    }
    const viewport = viewportEl.value
    const anchorElement = anchorRef.el
    if (!viewport || !anchorElement.isConnected) {
      anchorRef = undefined
      selectAnchor()
      return
    }
    const viewportRect = viewport.getBoundingClientRect()
    const elementRect = anchorElement.getBoundingClientRect()
    let changed = false
    if (anchorRef.screenY !== undefined && !Number.isNaN(core.props.verticalAnchorRatio)) {
      const contentY = (elementRect.top - viewportRect.top - offsetY.value) / zoomFactor.value
      const target = clampY(anchorRef.screenY - zoomFactor.value * contentY)
      if (target !== offsetY.value) {
        offsetY.value = target
        changed = true
      }
    }
    if (anchorRef.screenX !== undefined && !Number.isNaN(core.props.horizontalAnchorRatio)) {
      const contentX = (elementRect.left - viewportRect.left - offsetX.value) / zoomFactor.value
      const target = clampX(anchorRef.screenX - zoomFactor.value * contentX)
      if (target !== offsetX.value) {
        offsetX.value = target
        changed = true
      }
    }
    if (changed) {
      core.applyView()
      events.viewChanged()
    }
  }

  return {
    anchorEnabled,
    registerAnchorCandidate,
    unregisterAnchorCandidate,
    selectAnchor,
    reAnchor,
  }
}

export { useAnchor, type AnchorController }
