/**
 * 滚动条展示逻辑：展开 / 收起时机（对齐 WinUI 时长与延迟）与拇指几何。
 *
 * 拇指长度 / 位移是视图状态的纯派生值，这里用 watchEffect 响应式维护，
 * 任何 offset / zoom / 尺寸变化后自动刷新，core.applyView 不再关心拇指。
 */
/* oxlint-disable max-statements, no-ternary, no-magic-numbers --
 * 拇指几何的 0/1 结构字面量（滚动比例回退）属滚动条算法的领域常量，
 * 已由 constants.ts 命名常量覆盖主体，余下为结构边界值；工厂函数按职责
 * 组合计时 / 显示 / 拇指更新多段逻辑，属组件状态机的结构性豁免。
 */
import { onScopeDispose, ref, watchEffect } from 'vue'
import type { Ref } from 'vue'
import { BARS_HIDE_DELAY, MIN_THUMB_TRAVEL, THUMB_MIN_LENGTH } from './constants'
import type { ScrollViewCore } from './core'

/** 滚动条展示层暴露给其他模块 / 模板的对象 */
interface ScrollBars {
  barsVisible: Ref<boolean>
  barsImmediate: Ref<boolean>
  hovering: Ref<boolean>
  /** 触控平移进行中（由指针输入模块写入） */
  panningActive: Ref<boolean>
  /** 拇指拖拽进行中（由滚动条输入模块写入） */
  thumbDragging: Ref<boolean>
  /** 立即显示滚动条（interaction 触发，无展开延迟） */
  showBars: (immediate: boolean) => void
  /** 在 2s 无交互后收起滚动条 */
  scheduleHide: () => void
  onPointerEnterViewport: () => void
  onPointerLeaveViewport: () => void
}

/** 拇指长度：按可滚动比例缩放，保底 THUMB_MIN_LENGTH */
const thumbLength = (track: number, viewport: number, scrollable: number): number => {
  const total = viewport + scrollable
  const ratio = total > 0 ? viewport / total : 1
  return Math.max(THUMB_MIN_LENGTH, track * ratio)
}

const useScrollBars = (core: ScrollViewCore): ScrollBars => {
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
    computedVBarVisible,
    computedHBarVisible,
  } = core

  const barsVisible = ref(false)
  const barsImmediate = ref(false)
  const hovering = ref(false)
  const panningActive = ref(false)
  const thumbDragging = ref(false)
  let hideTimer: ReturnType<typeof setTimeout> | undefined = undefined

  const clearHideTimer = (): void => {
    if (hideTimer !== undefined) {
      globalThis.clearTimeout(hideTimer)
      hideTimer = undefined
    }
  }

  const showBars = (immediate: boolean): void => {
    clearHideTimer()
    barsVisible.value = true
    barsImmediate.value = immediate
  }

  const scheduleHide = (): void => {
    clearHideTimer()
    hideTimer = globalThis.setTimeout(() => {
      if (!hovering.value && !panningActive.value && !thumbDragging.value) {
        barsVisible.value = false
      }
    }, BARS_HIDE_DELAY)
  }

  const onPointerEnterViewport = (): void => {
    hovering.value = true
    // 进入滚动容器立即显示（无展开延迟），淡入由 CSS 过渡完成
    clearHideTimer()
    showBars(true)
  }

  const onPointerLeaveViewport = (): void => {
    hovering.value = false
    scheduleHide()
  }

  /* ---- 拇指几何（响应式派生） ---- */

  const updateVerticalThumb = (): void => {
    const bar = vBarEl.value
    const thumb = vThumbEl.value
    if (!bar || !thumb || !computedVBarVisible.value) {
      return
    }
    const trackLength = bar.clientHeight
    const length = thumbLength(trackLength, viewportHeight.value, scrollableHeight.value)
    const maxTravel = Math.max(MIN_THUMB_TRAVEL, trackLength - length)
    const ratio = scrollableHeight.value > 0 ? offsetY.value / scrollableHeight.value : 0
    thumb.style.height = `${length}px`
    thumb.style.transform = `translateY(${ratio * maxTravel}px)`
  }

  const updateHorizontalThumb = (): void => {
    const bar = hBarEl.value
    const thumb = hThumbEl.value
    if (!bar || !thumb || !computedHBarVisible.value) {
      return
    }
    const trackLength = bar.clientWidth
    const length = thumbLength(trackLength, viewportWidth.value, scrollableWidth.value)
    const maxTravel = Math.max(MIN_THUMB_TRAVEL, trackLength - length)
    const ratio = scrollableWidth.value > 0 ? offsetX.value / scrollableWidth.value : 0
    thumb.style.width = `${length}px`
    thumb.style.transform = `translateX(${ratio * maxTravel}px)`
  }

  watchEffect(
    () => {
      updateVerticalThumb()
      updateHorizontalThumb()
    },
    { flush: 'post' },
  )

  onScopeDispose(() => {
    clearHideTimer()
  })

  return {
    barsVisible,
    barsImmediate,
    hovering,
    panningActive,
    thumbDragging,
    showBars,
    scheduleHide,
    onPointerEnterViewport,
    onPointerLeaveViewport,
  }
}

export { useScrollBars, type ScrollBars }
