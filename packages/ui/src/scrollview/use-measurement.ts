/**
 * 测量层：视口 / 内容尺寸监听与偏移钳制。
 *
 * 通过 ResizeObserver / MutationObserver 感知尺寸与内容变化，触发 measure()
 * 并联动锚点（reAnchor / selectAnchor）；同时响应 contentOrientation 与
 * min/maxZoomFactor 约束变化。
 */
/* oxlint-disable import/prefer-default-export, max-statements, no-ternary, prefer-ternary --
 * measure 需在一次调用内完成「读尺寸 → 钳制 → 联动锚点 → 提交」的完整链路，
 * 拆成多个函数反而让测量时序难以保证；方向约束用 if/else 表达比三元更直观，
 * 故同时豁免 prefer-default-export（本模块仅一个副作用初始化函数，与其余
 * composable 统一采用具名导出）。
 */
import { onMounted, onScopeDispose, watch } from 'vue'
import type { ScrollViewCore } from './core'
import type { AnchorController } from './use-anchor'

/** 初始化测量层（内部自管理生命周期，无需返回值） */
export const useMeasurement = (core: ScrollViewCore, anchor: AnchorController): void => {
  const {
    viewportEl,
    contentEl,
    viewportWidth,
    viewportHeight,
    extentWidth,
    extentHeight,
    offsetX,
    offsetY,
    clampX,
    clampY,
    applyView,
    events,
  } = core

  let viewportObserver: ResizeObserver | undefined = undefined
  let contentObserver: ResizeObserver | undefined = undefined
  let contentMutationObserver: MutationObserver | undefined = undefined

  const readMetrics = (): void => {
    const viewport = viewportEl.value
    const content = contentEl.value
    if (!viewport || !content) {
      return
    }
    viewportWidth.value = viewport.clientWidth
    viewportHeight.value = viewport.clientHeight
    const orientation = core.props.contentOrientation
    // Vertical：内容宽度约束到视口宽度；Horizontal：高度约束；Both：双向自由；None：双向约束
    if (orientation === 'vertical' || orientation === 'none') {
      extentWidth.value = viewportWidth.value
    } else {
      extentWidth.value = content.scrollWidth
    }
    if (orientation === 'horizontal' || orientation === 'none') {
      extentHeight.value = viewportHeight.value
    } else {
      extentHeight.value = content.scrollHeight
    }
  }

  const measure = (): void => {
    const prevViewportWidth = viewportWidth.value
    const prevViewportHeight = viewportHeight.value
    const prevExtentWidth = extentWidth.value
    const prevExtentHeight = extentHeight.value

    readMetrics()

    const viewportChanged =
      prevViewportWidth !== viewportWidth.value || prevViewportHeight !== viewportHeight.value
    const extentChanged =
      prevExtentWidth !== extentWidth.value || prevExtentHeight !== extentHeight.value

    offsetX.value = clampX(offsetX.value)
    offsetY.value = clampY(offsetY.value)

    if (extentChanged) {
      events.extentChanged()
      if (anchor.anchorEnabled()) {
        anchor.reAnchor()
      }
    }
    if (viewportChanged || extentChanged) {
      applyView()
    }
  }

  onMounted(() => {
    const viewport = viewportEl.value
    const content = contentEl.value
    if (!viewport || !content) {
      return
    }

    viewportObserver = new ResizeObserver(() => measure())
    viewportObserver.observe(viewport)
    contentObserver = new ResizeObserver(() => measure())
    contentObserver.observe(content)

    contentMutationObserver = new MutationObserver(() => {
      measure()
      if (anchor.anchorEnabled()) {
        anchor.selectAnchor()
      }
    })
    contentMutationObserver.observe(content, { childList: true, subtree: true })

    measure()
    anchor.selectAnchor()
  })

  onScopeDispose(() => {
    viewportObserver?.disconnect()
    contentObserver?.disconnect()
    contentMutationObserver?.disconnect()
    viewportObserver = undefined
    contentObserver = undefined
    contentMutationObserver = undefined
  })

  watch(
    () => core.props.contentOrientation,
    () => {
      measure()
    },
    { flush: 'post' },
  )

  watch(
    () => [core.props.minZoomFactor, core.props.maxZoomFactor],
    () => {
      core.zoomFactor.value = Math.min(
        Math.max(core.zoomFactor.value, core.props.minZoomFactor),
        core.props.maxZoomFactor,
      )
      offsetX.value = clampX(offsetX.value)
      offsetY.value = clampY(offsetY.value)
      applyView()
    },
  )
}
