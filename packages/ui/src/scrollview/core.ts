/**
 * ScrollView 核心视图状态与基础视图操作。
 *
 * 这是整个拆分架构的「单一事实来源」：组件内 createScrollViewCore 创建一次，
 * 其余 composable 通过它共享 offset / zoom / 尺寸 / 钳制 / 提交等基础设施，
 * 避免把同一批 ref 与函数在多个模块间重复传参。
 */
/* oxlint-disable max-statements, no-ternary, no-magic-numbers, id-length --
 * core 属于 FluereScrollView 的视图状态机（对齐 WinUI 3 ScrollView）：
 * 结构性的 0/1 字面量（偏移边界、初始缩放）与 Vector2 风格的 { x, y }
 * 分量名属 API 对齐需要，强行套用结构风格规则会损害可读性。
 */
import { computed, ref, useTemplateRef } from 'vue'
import type { ComputedRef, Ref, ShallowRef } from 'vue'
import { INITIAL_ZOOM_FACTOR, MIN_OFFSET } from './constants'
import type { ScrollViewEvents } from './events'
import type { ResolvedScrollViewProps, ScrollingInteractionState } from './types'

/** ScrollView 拆分层共享的核心对象 */
interface ScrollViewCore {
  /** 已应用默认值的 Props（只读语义） */
  props: ResolvedScrollViewProps
  /** 类型安全的 emits 具名方法 */
  events: ScrollViewEvents

  /* 模板引用 */
  rootEl: Readonly<ShallowRef<HTMLDivElement | null>>
  viewportEl: Readonly<ShallowRef<HTMLDivElement | null>>
  contentEl: Readonly<ShallowRef<HTMLDivElement | null>>
  vBarEl: Readonly<ShallowRef<HTMLDivElement | null>>
  vThumbEl: Readonly<ShallowRef<HTMLDivElement | null>>
  hBarEl: Readonly<ShallowRef<HTMLDivElement | null>>
  hThumbEl: Readonly<ShallowRef<HTMLDivElement | null>>

  /* 视图状态（offset 为内容坐标、随缩放变化；zoom 为缩放系数） */
  offsetX: Ref<number>
  offsetY: Ref<number>
  zoomFactor: Ref<number>
  extentWidth: Ref<number>
  extentHeight: Ref<number>
  viewportWidth: Ref<number>
  viewportHeight: Ref<number>
  interactionState: Ref<ScrollingInteractionState>
  currentAnchor: Ref<HTMLElement | undefined>

  /* 派生状态 */
  maxOffsetX: ComputedRef<number>
  maxOffsetY: ComputedRef<number>
  scrollableWidth: ComputedRef<number>
  scrollableHeight: ComputedRef<number>
  computedHBarVisible: ComputedRef<boolean>
  computedVBarVisible: ComputedRef<boolean>
  contentOrientationClass: ComputedRef<string>
  rootStyle: ComputedRef<{ background: string } | undefined>

  /* 基础操作 */
  clampX: (value: number) => number
  clampY: (value: number) => number
  canScrollHorizontal: () => boolean
  canScrollVertical: () => boolean
  applyView: () => void
  commitView: () => void
  setState: (nextState: ScrollingInteractionState) => void
  emitScrollCompleted: (correlationId: number) => void
  emitZoomCompleted: (correlationId: number) => void

  /* 工具 */
  nextId: () => number
  scaleAboutCenter: (from: number, center: number, ratio: number) => number
}

/** 以中心点不变的方式，把某个轴的偏移随缩放系数变化 */
const scaleAboutCenter = (from: number, center: number, ratio: number): number =>
  (from + center) * ratio - center

/** 创建 ScrollView 核心对象（须在组件 setup 内调用） */
const createScrollViewCore = (
  props: ResolvedScrollViewProps,
  events: ScrollViewEvents,
): ScrollViewCore => {
  const rootEl = useTemplateRef<HTMLDivElement>('rootEl')
  const viewportEl = useTemplateRef<HTMLDivElement>('viewportEl')
  const contentEl = useTemplateRef<HTMLDivElement>('contentEl')
  const vBarEl = useTemplateRef<HTMLDivElement>('vBarEl')
  const vThumbEl = useTemplateRef<HTMLDivElement>('vThumbEl')
  const hBarEl = useTemplateRef<HTMLDivElement>('hBarEl')
  const hThumbEl = useTemplateRef<HTMLDivElement>('hThumbEl')

  const offsetX = ref(MIN_OFFSET)
  const offsetY = ref(MIN_OFFSET)
  const zoomFactor = ref(INITIAL_ZOOM_FACTOR)
  const extentWidth = ref(MIN_OFFSET)
  const extentHeight = ref(MIN_OFFSET)
  const viewportWidth = ref(MIN_OFFSET)
  const viewportHeight = ref(MIN_OFFSET)
  const interactionState = ref<ScrollingInteractionState>('idle')
  const currentAnchor = ref<HTMLElement | undefined>(undefined)

  const maxOffsetX = computed(() =>
    Math.max(MIN_OFFSET, extentWidth.value * zoomFactor.value - viewportWidth.value),
  )
  const maxOffsetY = computed(() =>
    Math.max(MIN_OFFSET, extentHeight.value * zoomFactor.value - viewportHeight.value),
  )
  const scrollableWidth = computed(() => maxOffsetX.value)
  const scrollableHeight = computed(() => maxOffsetY.value)

  const clampX = (value: number): number => Math.min(Math.max(value, MIN_OFFSET), maxOffsetX.value)

  const clampY = (value: number): number => Math.min(Math.max(value, MIN_OFFSET), maxOffsetY.value)

  const canScrollHorizontal = (): boolean =>
    props.horizontalScrollMode !== 'disabled' && scrollableWidth.value > 0

  const canScrollVertical = (): boolean =>
    props.verticalScrollMode !== 'disabled' && scrollableHeight.value > 0

  const computedHBarVisible = computed(() => {
    const visibility = props.horizontalScrollBarVisibility
    if (visibility === 'hidden') {
      return false
    }
    if (visibility === 'visible') {
      return true
    }
    return scrollableWidth.value > 0
  })

  const computedVBarVisible = computed(() => {
    const visibility = props.verticalScrollBarVisibility
    if (visibility === 'hidden') {
      return false
    }
    if (visibility === 'visible') {
      return true
    }
    return scrollableHeight.value > 0
  })

  const contentOrientationClass = computed(
    () => `fui-scrollview__content--${props.contentOrientation}`,
  )
  const rootStyle = computed(() =>
    props.background ? { background: props.background } : undefined,
  )

  /** 应用当前视图到内容元素（拇指位置由 useScrollBars 的 watchEffect 响应式更新）。
   *
   * offsetX/offsetY 采用「内容坐标」约定（对齐 WinUI HorizontalOffset /
   * VerticalOffset）：它们是视口原点在内容空间的坐标，offset 增大表示看到
   * 更靠右 / 更靠下的内容，因此内容元素需沿负方向平移。
   */
  const applyView = (): void => {
    const content = contentEl.value
    if (content) {
      content.style.transform = `translate3d(${-offsetX.value}px, ${-offsetY.value}px, 0) scale(${zoomFactor.value})`
    }
  }

  const commitView = (): void => {
    applyView()
    events.viewChanged()
  }

  const setState = (nextState: ScrollingInteractionState): void => {
    if (interactionState.value === nextState) {
      return
    }
    interactionState.value = nextState
    events.stateChanged(nextState)
  }

  const emitScrollCompleted = (correlationId: number): void => {
    events.scrollCompleted({ correlationId })
  }

  const emitZoomCompleted = (correlationId: number): void => {
    events.zoomCompleted({ correlationId })
  }

  let nextCorrelationId = 1
  const nextId = (): number => {
    const id = nextCorrelationId
    nextCorrelationId += 1
    return id
  }

  return {
    props,
    events,
    rootEl,
    viewportEl,
    contentEl,
    vBarEl,
    vThumbEl,
    hBarEl,
    hThumbEl,
    offsetX,
    offsetY,
    zoomFactor,
    extentWidth,
    extentHeight,
    viewportWidth,
    viewportHeight,
    interactionState,
    currentAnchor,
    maxOffsetX,
    maxOffsetY,
    scrollableWidth,
    scrollableHeight,
    computedHBarVisible,
    computedVBarVisible,
    contentOrientationClass,
    rootStyle,
    clampX,
    clampY,
    canScrollHorizontal,
    canScrollVertical,
    applyView,
    commitView,
    setState,
    emitScrollCompleted,
    emitZoomCompleted,
    nextId,
    scaleAboutCenter,
  }
}

export { createScrollViewCore, type ScrollViewCore }
