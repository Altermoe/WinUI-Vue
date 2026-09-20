<script setup lang="ts">
/**
 * FluereScrollView 组件：WinUI 3（Windows App SDK）ScrollView 的 Web 对齐实现。
 * 参考：https://github.com/microsoft/microsoft-ui-xaml/tree/main/specs/ScrollingControls
 *
 * 本文件仅做「装配」：创建 core 并组合各职责 composable（测量 / 动画 / 惯性 /
 * 锚点 / 滚轮 / 触控 / 滚动条 / 键盘），业务逻辑按功能拆分到同目录模块：
 *
 *  - core.ts                   视图状态与基础视图操作（单一事实来源）
 *  - use-scroll-bars.ts        滚动条展示时机与拇指几何
 *  - use-measurement.ts        尺寸测量与约束联动
 *  - use-animation.ts          rAF 动画引擎与缓动曲线
 *  - use-inertia.ts            惯性滑行
 *  - use-scroll-api.ts         程序化 API（scrollTo / zoomTo / velocity …）
 *  - use-bring-into-view.ts    元素滚动进视口（BringIntoView）
 *  - use-anchor.ts             锚点逻辑
 *  - use-wheel-input.ts        滚轮与滚动链式传递
 *  - use-pointer-input.ts      触控 / 笔平移（含手势分发）
 *  - use-pinch-input.ts        双指捏合缩放
 *  - use-scrollbar-input.ts    滚动条拖拽与轨道翻页
 *  - use-keyboard-input.ts     键盘方向键滚动
 *
 * Props 类型定义见 ./types.ts（对外由 @fluere-vue/ui 重新导出）。
 */

import { createScrollViewCore } from './core'
import { createScrollViewEvents } from './events'
import type { FluereScrollViewProps, ScrollViewEmits } from './types'
import { useAnchor } from './use-anchor'
import { useAnimation } from './use-animation'
import { useBringIntoView } from './use-bring-into-view'
import { useInertia } from './use-inertia'
import { useKeyboardInput } from './use-keyboard-input'
import { useMeasurement } from './use-measurement'
import { usePointerInput } from './use-pointer-input'
import { useScrollApi } from './use-scroll-api'
import { useScrollBars } from './use-scroll-bars'
import { useScrollbarInput } from './use-scrollbar-input'
import { useWheelInput } from './use-wheel-input'

/* ------------------------------------------------------------------ */
/* Props / Emits                                                       */
/* ------------------------------------------------------------------ */

const props = withDefaults(defineProps<FluereScrollViewProps>(), {
  contentOrientation: 'vertical',
  horizontalScrollMode: 'enabled',
  verticalScrollMode: 'enabled',
  horizontalScrollBarVisibility: 'auto',
  verticalScrollBarVisibility: 'auto',
  horizontalScrollChainMode: 'auto',
  verticalScrollChainMode: 'auto',
  horizontalScrollRailMode: 'enabled',
  verticalScrollRailMode: 'enabled',
  zoomMode: 'disabled',
  zoomChainMode: 'auto',
  ignoredInputKinds: () => [],
  minZoomFactor: 0.1,
  maxZoomFactor: 10,
  horizontalAnchorRatio: Number.NaN,
  verticalAnchorRatio: Number.NaN,
  background: undefined,
  tabIndex: 0,
})

const emit = defineEmits<ScrollViewEmits>()

/* ------------------------------------------------------------------ */
/* 装配：创建核心状态并按职责组合各 composable                          */
/* ------------------------------------------------------------------ */

const core = createScrollViewCore(props, createScrollViewEvents(emit))
const bars = useScrollBars(core)
const animation = useAnimation(core, bars)
const inertia = useInertia(core, animation)
const api = useScrollApi(core, animation, inertia)
const bringIntoViewController = useBringIntoView(core, animation)
const anchor = useAnchor(core)
useMeasurement(core, anchor)
const wheel = useWheelInput(core, bars, api)
const pointer = usePointerInput(core, bars, animation, inertia)
const scrollbar = useScrollbarInput(core, bars, api, animation, inertia)
const keyboard = useKeyboardInput(core, api)

/* 模板用到的绑定（顶层解构，确保模板内 ref 自动解包） */
const {
  rootEl,
  viewportEl,
  contentEl,
  vBarEl,
  vThumbEl,
  hBarEl,
  hThumbEl,
  computedHBarVisible,
  computedVBarVisible,
  contentOrientationClass,
  rootStyle,
} = core
const {
  barsVisible,
  barsImmediate,
  panningActive,
  onPointerEnterViewport,
  onPointerLeaveViewport,
} = bars

/* ------------------------------------------------------------------ */
/* 对外暴露：只读状态 getter + 程序化方法                                */
/* ------------------------------------------------------------------ */

defineExpose({
  get horizontalOffset() {
    return core.offsetX.value
  },
  get verticalOffset() {
    return core.offsetY.value
  },
  get zoomFactor() {
    return core.zoomFactor.value
  },
  get extentWidth() {
    return core.extentWidth.value
  },
  get extentHeight() {
    return core.extentHeight.value
  },
  get viewportWidth() {
    return core.viewportWidth.value
  },
  get viewportHeight() {
    return core.viewportHeight.value
  },
  get scrollableWidth() {
    return core.scrollableWidth.value
  },
  get scrollableHeight() {
    return core.scrollableHeight.value
  },
  get state() {
    return core.interactionState.value
  },
  get currentAnchor() {
    return core.currentAnchor.value
  },
  scrollTo: api.scrollTo,
  scrollBy: api.scrollBy,
  zoomTo: api.zoomTo,
  zoomBy: api.zoomBy,
  addScrollVelocity: api.addScrollVelocity,
  addZoomVelocity: api.addZoomVelocity,
  bringIntoView: bringIntoViewController.bringIntoView,
  registerAnchorCandidate: anchor.registerAnchorCandidate,
  unregisterAnchorCandidate: anchor.unregisterAnchorCandidate,
})
</script>

<template>
  <div
    ref="rootEl"
    class="fui-scrollview"
    :class="{
      'fui-scrollview--bars-visible': barsVisible,
      'fui-scrollview--bars-immediate': barsImmediate,
      'fui-scrollview--panning': panningActive,
    }"
    :style="rootStyle"
    :tabindex="props.tabIndex"
    @wheel="wheel.onWheel"
    @keydown="keyboard.onKeyDown"
    @pointerenter="onPointerEnterViewport"
    @pointerleave="onPointerLeaveViewport"
  >
    <div
      ref="viewportEl"
      class="fui-scrollview__presenter"
      @pointerdown="pointer.onPointerDown"
      @pointermove="pointer.onPointerMove"
      @pointerup="pointer.onPointerUp"
      @pointercancel="pointer.onPointerUp"
    >
      <div
        ref="contentEl"
        class="fui-scrollview__content"
        :class="contentOrientationClass"
      >
        <slot />
      </div>
    </div>

    <div
      v-if="computedHBarVisible"
      ref="hBarEl"
      class="fui-scrollview__scrollbar fui-scrollview__scrollbar--horizontal"
      @pointerdown="scrollbar.onHBarPointerDown"
      @pointermove="scrollbar.onThumbPointerMove"
      @pointerup="scrollbar.onThumbPointerUp"
      @pointercancel="scrollbar.onThumbPointerUp"
    >
      <div
        ref="hThumbEl"
        class="fui-scrollview__thumb fui-scrollview__thumb--horizontal"
      />
    </div>
    <div
      v-if="computedVBarVisible"
      ref="vBarEl"
      class="fui-scrollview__scrollbar fui-scrollview__scrollbar--vertical"
      @pointerdown="scrollbar.onVBarPointerDown"
      @pointermove="scrollbar.onThumbPointerMove"
      @pointerup="scrollbar.onThumbPointerUp"
      @pointercancel="scrollbar.onThumbPointerUp"
    >
      <div
        ref="vThumbEl"
        class="fui-scrollview__thumb fui-scrollview__thumb--vertical"
      />
    </div>
    <div
      v-if="computedHBarVisible && computedVBarVisible"
      class="fui-scrollview__separator"
    />
  </div>
</template>

<style src="./scroll-view.css" scoped />
