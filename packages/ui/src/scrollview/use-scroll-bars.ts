/**
 * 滚动条展示逻辑：展开 / 收起时机（对齐 WinUI 时长与延迟）与拇指几何。
 *
 * 两个相互独立的可见性层级：
 *  - barsVisible：指针位于滚动容器内 / 发生滚动交互 → 显示「细滑块」，轨道保持透明；
 *  - trackExpanded：指针进入滚动条命中区（或正在拖拽滑块）→ 轨道连同两端步进
 *    按钮展开显示，离开后收起。两者都由 CSS 过渡驱动，JS 只切换状态标志。
 *
 * 拇指长度 / 位移是视图状态的纯派生值，这里用 watchEffect 响应式维护，
 * 任何 offset / zoom / 尺寸变化后自动刷新，core.applyView 不再关心拇指。
 */
/* oxlint-disable max-statements, no-ternary, no-magic-numbers --
 * 拇指几何的 0/1 结构字面量（滚动比例回退）属滚动条算法的领域常量，
 * 已由 constants.ts 命名常量覆盖主体，余下为结构边界值；工厂函数按职责
 * 组合计时 / 显示 / 拇指更新多段逻辑，属组件状态机的结构性豁免。
 */
import { computed, onScopeDispose, ref, watchEffect } from 'vue'
import type { ComputedRef, Ref } from 'vue'
import { BARS_HIDE_DELAY, MIN_OFFSET, MIN_THUMB_TRAVEL, THUMB_MIN_LENGTH } from './constants'
import type { ScrollViewCore } from './core'

/** 滚动条轴向 */
type ScrollBarAxis = 'vertical' | 'horizontal'

/**
 * 滑块行程两端需要让开的步进按钮 band（px）。
 *
 * 数值由 CSS 通过 thumb 的 top / left 内缩给出（--fui-scrollview-thumb-travel-inset）。
 * 几何派生（useScrollBars）与拖拽换算（useScrollbarInput）共用这一读取入口，
 * 保证「可用轨道长度」在两处一致——否则拖拽会与滑块位置对不上而跳变。
 */
const thumbTravelInset = (thumb: HTMLElement, axis: ScrollBarAxis): number =>
  axis === 'vertical' ? thumb.offsetTop : thumb.offsetLeft

/**
 * 指针命中最内层 ScrollView 的根元素：
 * - element 属于某个 ScrollView（含自身），返回该根元素；
 * - 否则返回 undefined。
 * 用「最内层 ScrollView」作为 hover 的唯一权威，祖先 / 同级据此让位，
 * 从而在嵌套 ScrollView 下只有指针真正所在的视图进入 hover 态。
 */
const innermostScrollView = (target: EventTarget | null): Element | undefined =>
  target instanceof Element ? (target.closest('.fui-scrollview') ?? undefined) : undefined

/** 滚动条展示层暴露给其他模块 / 模板的对象 */
interface ScrollBars {
  barsVisible: Ref<boolean>
  barsImmediate: Ref<boolean>
  hovering: Ref<boolean>
  /** 触控平移进行中（由指针输入模块写入） */
  panningActive: Ref<boolean>
  /** 拇指拖拽进行中（由滚动条输入模块写入） */
  thumbDragging: Ref<boolean>
  /** 轨道展开态：指针位于滚动条命中区，或正在拖拽滑块 */
  trackExpanded: ComputedRef<boolean>
  /** 立即显示滚动条（interaction 触发，无展开延迟） */
  showBars: (immediate: boolean) => void
  /** 在 2s 无交互后收起滚动条 */
  scheduleHide: () => void
  /**
   * 指针划过本视图（由冒泡的 pointerover 驱动）。内部按「指针命中的最内层
   * ScrollView」判定：只有最内层进入 hover，祖先 / 同级自动让位，实现嵌套隔离。
   */
  onPointerOverViewport: (event: PointerEvent) => void
  onPointerOutViewport: (event: PointerEvent) => void
  /** 指针进入 / 离开滚动条命中区（决定轨道展开） */
  onBarPointerEnter: () => void
  onBarPointerLeave: () => void
}

/** 拇指长度：按可滚动比例缩放，保底 THUMB_MIN_LENGTH */
const thumbLength = (track: number, viewport: number, scrollable: number): number => {
  const total = viewport + scrollable
  const ratio = total > 0 ? viewport / total : 1
  return Math.max(THUMB_MIN_LENGTH, track * ratio)
}

const useScrollBars = (core: ScrollViewCore): ScrollBars => {
  const {
    rootEl,
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
  /** 指针是否位于滚动条命中区（轨道展开的悬停条件） */
  const barHovered = ref(false)
  let hideTimer: ReturnType<typeof setTimeout> | undefined = undefined

  /** 拖拽滑块期间保持轨道展开，避免指针移出命中区时轨道闪烁 */
  const trackExpanded = computed(() => barHovered.value || thumbDragging.value)

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
        barsImmediate.value = false
        barHovered.value = false
      }
    }, BARS_HIDE_DELAY)
  }

  /**
   * 指针位于本视图自身区域（含自身滚动条）→ 立即显示滚动条
   */
  const hoverViewport = (): void => {
    hovering.value = true
    clearHideTimer()
    showBars(true)
  }

  /**
   * 指针离开本视图的自身区域：
   * - immediate = true：指针已被更深层嵌套 ScrollView 接管 → 立即让位隐藏，
   *   避免父级滚动条悬在子级之上；
   * - immediate = false：指针真正离开本视图 → 走收起延时（对齐 WinUI）。
   */
  const releaseHoverViewport = (immediate: boolean): void => {
    hovering.value = false
    barHovered.value = false
    if (immediate) {
      clearHideTimer()
      barsVisible.value = false
      barsImmediate.value = false
    } else {
      scheduleHide()
    }
  }

  const onPointerOverViewport = (event: PointerEvent): void => {
    // 事件冒泡：target 是本视图子树内任意元素，最近的自带 fui-scrollview
    // 类的祖先即「指针命中的最内层 ScrollView」。
    if (innermostScrollView(event.target) === rootEl.value) {
      hoverViewport()
    } else {
      // 指针落在更深的嵌套 ScrollView 上 → 本视图让位
      releaseHoverViewport(true)
    }
  }

  const onPointerOutViewport = (event: PointerEvent): void => {
    const target = rootEl.value
    const inner = innermostScrollView(event.relatedTarget)
    if (inner === target) {
      // 指针仍在自身区域内（含自身滚动条）→ 保持悬停
      return
    }
    if (inner instanceof Element && target?.contains(inner)) {
      // 指针移入自身的嵌套子级 ScrollView → 立即让位
      releaseHoverViewport(true)
      return
    }
    // 指针真正离开本视图 → 走收起延时
    releaseHoverViewport(false)
  }

  const onBarPointerEnter = (): void => {
    barHovered.value = true
  }

  const onBarPointerLeave = (): void => {
    barHovered.value = false
  }

  /* ---- 拇指几何（响应式派生） ----
   * 可用轨道长度 = 轨道两端各让开一个步进按钮 band，滑块因此不会与按钮重叠。 */

  const updateVerticalThumb = (): void => {
    const bar = vBarEl.value
    const thumb = vThumbEl.value
    if (!bar || !thumb || !computedVBarVisible.value) {
      return
    }
    const trackLength = Math.max(
      MIN_OFFSET,
      bar.clientHeight - thumbTravelInset(thumb, 'vertical') * 2,
    )
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
    const trackLength = Math.max(
      MIN_OFFSET,
      bar.clientWidth - thumbTravelInset(thumb, 'horizontal') * 2,
    )
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
    trackExpanded,
    showBars,
    scheduleHide,
    onPointerOverViewport,
    onPointerOutViewport,
    onBarPointerEnter,
    onBarPointerLeave,
  }
}

export { thumbTravelInset, useScrollBars, type ScrollBarAxis, type ScrollBars }
