<script setup lang="ts">
import { FluereScrollView } from '@fluere-vue/ui'
import { ref } from 'vue'

definePageMeta({
  layout: 'components',
})

/* 演示常量（避免 lint no-magic-numbers） */
const VERTICAL_ROW_COUNT = 18
const HORIZONTAL_CARD_COUNT = 10
const BOTH_DIRECTION_ITEM_COUNT = 30
const GRID_CELL_COUNT = 64
const BAR_ROW_COUNT = 12
const NESTED_OUTER_ROW_COUNT = 4
const NESTED_OUTER_TAIL_COUNT = 6
const NESTED_INNER_ROW_COUNT = 10
const SCROLL_STEP = 120
const ZOOM_STEP = 0.25
const EVENT_LOG_MAX = 5
const EVENT_LOG_START = 0
const OFFSET_DECIMALS = 1
const ZOOM_DECIMALS = 2
const WHOLE_DECIMALS = 0
const TOP_OFFSET = 0

/* 程序化 API 演示 */
const sv = ref<InstanceType<typeof FluereScrollView> | undefined>(undefined)
const readout = ref('')

const refreshReadout = (): void => {
  const current = sv.value
  if (!current) {
    return
  }
  readout.value = [
    `offset = (${current.horizontalOffset.toFixed(OFFSET_DECIMALS)}, ${current.verticalOffset.toFixed(OFFSET_DECIMALS)})`,
    `zoom = ${current.zoomFactor.toFixed(ZOOM_DECIMALS)}`,
    `scrollable = (${current.scrollableWidth.toFixed(WHOLE_DECIMALS)}, ${current.scrollableHeight.toFixed(WHOLE_DECIMALS)})`,
    `extent = (${current.extentWidth.toFixed(WHOLE_DECIMALS)}, ${current.extentHeight.toFixed(WHOLE_DECIMALS)})`,
    `viewport = (${current.viewportWidth.toFixed(WHOLE_DECIMALS)}, ${current.viewportHeight.toFixed(WHOLE_DECIMALS)})`,
    `state = ${current.state}`,
  ].join(' ')
}

/* 事件计数 */
const eventLog = ref<string[]>([])
const logEvent = (tag: string): void => {
  eventLog.value = [tag, ...eventLog.value].slice(EVENT_LOG_START, EVENT_LOG_MAX)
}
</script>

<template>
  <div class="space-y-fluent-xxl">
    <h2 class="text-2xl font-semibold text-colorNeutralForeground1">Scroll View 滚动视图</h2>
    <p class="text-colorNeutralForeground2">
      对齐 WinUI 3 <code class="text-colorBrandForeground1">ScrollView</code> 的容器控件：
      内容超出视口时滚动、平移、缩放，滚动条为 WinUI 3 的 overlay 样式（8px
      圆角拇指，悬停/滚动后展开，2s 无交互收起）。
    </p>

    <!-- 基础用法（垂直） -->
    <section
      class="bg-colorNeutralBackground1 p-fluent-xxl rounded-fluent-xl shadow-2 border border-colorNeutralStroke1"
    >
      <h3 class="text-lg font-medium text-colorNeutralForeground1 mb-4">基础用法（垂直）</h3>
      <p class="text-sm text-colorNeutralForeground3 mb-4">
        默认 <code>content-orientation="vertical"</code>，滚轮 / 触控平移 / 拖动滚动条均可滚动。
      </p>
      <div class="h-80">
        <FluereScrollView class="h-full">
          <div class="p-fluent-l space-y-fluent-s">
            <div
              v-for="index in VERTICAL_ROW_COUNT"
              :key="index"
              class="rounded-fluent-lg border border-colorNeutralStroke2 bg-colorNeutralBackground2 px-fluent-l py-fluent-m text-colorNeutralForeground2"
            >
              第 {{ index }} 行内容 · Windows 11 原生滚动体验
            </div>
          </div>
        </FluereScrollView>
      </div>
    </section>

    <!-- 横向滚动 -->
    <section
      class="bg-colorNeutralBackground1 p-fluent-xxl rounded-fluent-xl shadow-2 border border-colorNeutralStroke1"
    >
      <h3 class="text-lg font-medium text-colorNeutralForeground1 mb-4">横向滚动</h3>
      <p class="text-sm text-colorNeutralForeground3 mb-4">
        <code>content-orientation="horizontal"</code>，内容高度约束到视口，宽度自由增长。 Shift +
        滚轮 或触控横向滑动。
      </p>
      <div class="h-40">
        <FluereScrollView
          class="h-full"
          content-orientation="horizontal"
        >
          <div class="flex gap-fluent-m p-fluent-l">
            <div
              v-for="index in HORIZONTAL_CARD_COUNT"
              :key="index"
              class="w-56 h-28 shrink-0 rounded-fluent-lg border border-colorNeutralStroke2 bg-colorNeutralBackground2 flex items-center justify-center text-colorNeutralForeground2"
            >
              卡片 {{ index }}
            </div>
          </div>
        </FluereScrollView>
      </div>
    </section>

    <!-- 双向滚动 -->
    <section
      class="bg-colorNeutralBackground1 p-fluent-xxl rounded-fluent-xl shadow-2 border border-colorNeutralStroke1"
    >
      <h3 class="text-lg font-medium text-colorNeutralForeground1 mb-4">双向滚动</h3>
      <p class="text-sm text-colorNeutralForeground3 mb-4">
        <code>content-orientation="both"</code>，内容在横向与纵向均不受约束。
      </p>
      <div class="h-72">
        <FluereScrollView
          class="h-full"
          content-orientation="both"
        >
          <div class="grid grid-cols-6 gap-fluent-m p-fluent-l">
            <div
              v-for="index in BOTH_DIRECTION_ITEM_COUNT"
              :key="index"
              class="h-28 rounded-fluent-md border border-colorNeutralStroke2 bg-colorNeutralBackground2 flex items-center justify-center text-colorNeutralForeground3"
            >
              {{ index }}
            </div>
          </div>
        </FluereScrollView>
      </div>
    </section>

    <!-- 嵌套滚动（滚轮归属） -->
    <section
      class="bg-colorNeutralBackground1 p-fluent-xxl rounded-fluent-xl shadow-2 border border-colorNeutralStroke1"
    >
      <h3 class="text-lg font-medium text-colorNeutralForeground1 mb-4">嵌套滚动</h3>
      <p class="text-sm text-colorNeutralForeground3 mb-4">
        内层 ScrollView 位于外层内容之中。<strong>鼠标滚轮归属</strong>对齐 WinUI 3：
        指针停在内层上时由内层独占滚轮，即使内层已滚到极限，外层也不会跟着滚动；
        把指针移到内层之外的外层内容上，滚轮才交给外层（触控 / 笔由指针捕获独占）。
      </p>
      <div class="h-96">
        <FluereScrollView class="h-full">
          <div class="space-y-fluent-l p-fluent-l">
            <div
              v-for="index in NESTED_OUTER_ROW_COUNT"
              :key="`nested-outer-${index}`"
              class="rounded-fluent-lg border border-colorNeutralStroke2 bg-colorNeutralBackground2 px-fluent-l py-fluent-m text-colorNeutralForeground2"
            >
              外层内容 {{ index }} · 指针在此处滚轮才会滚动外层
            </div>

            <div class="h-40">
              <FluereScrollView class="h-full">
                <div class="space-y-fluent-s p-fluent-m">
                  <div
                    v-for="index in NESTED_INNER_ROW_COUNT"
                    :key="`nested-inner-a-${index}`"
                    class="h-8 rounded-fluent-md border border-colorNeutralStroke2 bg-colorNeutralBackground2 px-fluent-s flex items-center text-xs text-colorNeutralForeground3"
                  >
                    内层 A · 第 {{ index }} 行（滚到底后外层不动）
                  </div>
                </div>
              </FluereScrollView>
            </div>

            <div class="h-40">
              <FluereScrollView class="h-full">
                <div class="space-y-fluent-s p-fluent-m">
                  <div
                    v-for="index in NESTED_INNER_ROW_COUNT"
                    :key="`nested-inner-b-${index}`"
                    class="h-8 rounded-fluent-md border border-colorNeutralStroke2 bg-colorNeutralBackground2 px-fluent-s flex items-center text-xs text-colorNeutralForeground3"
                  >
                    内层 B · 第 {{ index }} 行（滚到底后外层不动）
                  </div>
                </div>
              </FluereScrollView>
            </div>

            <div
              v-for="index in NESTED_OUTER_TAIL_COUNT"
              :key="`nested-outer-tail-${index}`"
              class="rounded-fluent-lg border border-colorNeutralStroke2 bg-colorNeutralBackground2 px-fluent-l py-fluent-m text-colorNeutralForeground2"
            >
              外层尾部内容 {{ index }}
            </div>
          </div>
        </FluereScrollView>
      </div>
    </section>

    <!-- 缩放 -->
    <section
      class="bg-colorNeutralBackground1 p-fluent-xxl rounded-fluent-xl shadow-2 border border-colorNeutralStroke1"
    >
      <h3 class="text-lg font-medium text-colorNeutralForeground1 mb-4">缩放</h3>
      <p class="text-sm text-colorNeutralForeground3 mb-4">
        <code>zoom-mode="enabled"</code>：Ctrl / Cmd + 滚轮 或双指捏合缩放，缩放心为指针位置。 对齐
        WinUI 的 <code>min-zoom-factor / max-zoom-factor</code> 约束。
      </p>
      <div class="h-80">
        <FluereScrollView
          class="h-full"
          content-orientation="both"
          zoom-mode="enabled"
        >
          <div
            class="w-[800px] h-[600px] rounded-fluent-lg flex items-center justify-center text-4xl font-semibold"
            style="background: light-dark(#f3f3f3, #2b2b2b)"
          >
            Ctrl + 滚轮缩放
          </div>
        </FluereScrollView>
      </div>
    </section>

    <!-- 滚动条可见性 -->
    <section
      class="bg-colorNeutralBackground1 p-fluent-xxl rounded-fluent-xl shadow-2 border border-colorNeutralStroke1"
    >
      <h3 class="text-lg font-medium text-colorNeutralForeground1 mb-4">滚动条可见性</h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-fluent-l">
        <div>
          <p class="text-sm text-colorNeutralForeground3 mb-2">auto（默认，overlay）</p>
          <div class="h-40">
            <FluereScrollView class="h-full">
              <div class="space-y-fluent-s p-fluent-m">
                <div
                  v-for="index in BAR_ROW_COUNT"
                  :key="index"
                  class="h-8 rounded-fluent-md bg-colorNeutralBackground2 border border-colorNeutralStroke2"
                />
              </div>
            </FluereScrollView>
          </div>
        </div>
        <div>
          <p class="text-sm text-colorNeutralForeground3 mb-2">visible（常驻）</p>
          <div class="h-40">
            <FluereScrollView
              class="h-full"
              vertical-scroll-bar-visibility="visible"
            >
              <div class="space-y-fluent-s p-fluent-m">
                <div
                  v-for="index in BAR_ROW_COUNT"
                  :key="index"
                  class="h-8 rounded-fluent-md bg-colorNeutralBackground2 border border-colorNeutralStroke2"
                />
              </div>
            </FluereScrollView>
          </div>
        </div>
        <div>
          <p class="text-sm text-colorNeutralForeground3 mb-2">hidden（仍可滚动）</p>
          <div class="h-40">
            <FluereScrollView
              class="h-full"
              vertical-scroll-bar-visibility="hidden"
            >
              <div class="space-y-fluent-s p-fluent-m">
                <div
                  v-for="index in BAR_ROW_COUNT"
                  :key="index"
                  class="h-8 rounded-fluent-md bg-colorNeutralBackground2 border border-colorNeutralStroke2"
                />
              </div>
            </FluereScrollView>
          </div>
        </div>
      </div>
    </section>

    <!-- 程序化 API -->
    <section
      class="bg-colorNeutralBackground1 p-fluent-xxl rounded-fluent-xl shadow-2 border border-colorNeutralStroke1"
    >
      <h3 class="text-lg font-medium text-colorNeutralForeground1 mb-4">程序化 API</h3>
      <p class="text-sm text-colorNeutralForeground3 mb-4">
        对齐 WinUI 方法：<code>scrollTo / scrollBy / zoomTo / zoomBy</code>（支持动画与 correlation
        ID），以及只读属性
        <code
          >horizontalOffset / verticalOffset / zoomFactor / scrollableWidth / scrollableHeight /
          state</code
        >。
      </p>
      <div class="h-56">
        <FluereScrollView
          ref="sv"
          class="h-full"
          content-orientation="both"
          zoom-mode="enabled"
          @view-changed="refreshReadout"
        >
          <div class="grid grid-cols-8 gap-fluent-s p-fluent-m">
            <div
              v-for="index in GRID_CELL_COUNT"
              :key="index"
              class="h-14 rounded-fluent-md bg-colorNeutralBackground2 border border-colorNeutralStroke2 flex items-center justify-center text-xs text-colorNeutralForeground3"
            >
              {{ index }}
            </div>
          </div>
        </FluereScrollView>
      </div>
      <div class="mt-fluent-m flex flex-wrap gap-fluent-s items-center">
        <button
          class="px-fluent-m py-fluent-s rounded-fluent-md border border-colorNeutralStroke1 bg-colorNeutralBackground1 hover:bg-colorNeutralBackground1Hover text-sm"
          @click="sv?.scrollBy(0, SCROLL_STEP)"
        >
          下滚 120px
        </button>
        <button
          class="px-fluent-m py-fluent-s rounded-fluent-md border border-colorNeutralStroke1 bg-colorNeutralBackground1 hover:bg-colorNeutralBackground1Hover text-sm"
          @click="sv?.scrollBy(0, -SCROLL_STEP)"
        >
          上滚 120px
        </button>
        <button
          class="px-fluent-m py-fluent-s rounded-fluent-md border border-colorNeutralStroke1 bg-colorNeutralBackground1 hover:bg-colorNeutralBackground1Hover text-sm"
          @click="sv?.scrollTo(TOP_OFFSET, TOP_OFFSET)"
        >
          回到顶部
        </button>
        <button
          class="px-fluent-m py-fluent-s rounded-fluent-md border border-colorNeutralStroke1 bg-colorNeutralBackground1 hover:bg-colorNeutralBackground1Hover text-sm"
          @click="sv?.zoomBy(ZOOM_STEP)"
        >
          放大
        </button>
        <button
          class="px-fluent-m py-fluent-s rounded-fluent-md border border-colorNeutralStroke1 bg-colorNeutralBackground1 hover:bg-colorNeutralBackground1Hover text-sm"
          @click="sv?.zoomBy(-ZOOM_STEP)"
        >
          缩小
        </button>
        <code class="text-xs text-colorNeutralForeground3 break-all">{{
          readout || '（交互后显示）'
        }}</code>
      </div>
    </section>

    <!-- 事件 -->
    <section
      class="bg-colorNeutralBackground1 p-fluent-xxl rounded-fluent-xl shadow-2 border border-colorNeutralStroke1"
    >
      <h3 class="text-lg font-medium text-colorNeutralForeground1 mb-4">事件</h3>
      <p class="text-sm text-colorNeutralForeground3 mb-4">
        <code
          >view-changed / extent-changed / state-changed / scroll-completed / zoom-completed</code
        >。
      </p>
      <div class="h-40">
        <FluereScrollView
          class="h-full"
          @view-changed="logEvent('view-changed')"
          @state-changed="logEvent(`state → ${$event}`)"
          @scroll-completed="logEvent(`scroll-completed #${$event.correlationId}`)"
        >
          <div class="space-y-fluent-s p-fluent-m">
            <div
              v-for="index in BAR_ROW_COUNT"
              :key="index"
              class="h-8 rounded-fluent-md bg-colorNeutralBackground2 border border-colorNeutralStroke2"
            />
          </div>
        </FluereScrollView>
      </div>
      <ul class="mt-fluent-m space-y-fluent-xs">
        <li
          v-for="(line, index) in eventLog"
          :key="index"
          class="text-xs font-mono text-colorNeutralForeground3"
        >
          {{ line }}
        </li>
      </ul>
    </section>
  </div>
</template>
