<script setup lang="ts">
import {
  FluentIconAdd20Filled,
  FluentIconCheckmarkCircle24Filled,
  FluentIconDelete24Regular,
  FluentIconSearch20Regular,
  FluentIconSettings24Regular,
} from '@fluentui-vue/icons'
import type { FluentIconStyle } from '@fluentui-vue/icons'
// oxlint-disable-next-line import/no-namespace -- 按 exportName 动态查组件，命名导入无法枚举 1.9w+ 图标
import * as icons from '@fluentui-vue/icons'
import iconsData from '@fluentui-vue/icons/data'
import { FluentButton } from '@fluentui-vue/ui'
import { computed, ref } from 'vue'
import type { Component } from 'vue'

definePageMeta({
  layout: 'components',
})

const PAGE_SIZE = 600
const COPY_RESET_MS = 1200
const FILTER_STYLES: FluentIconStyle[] = ['regular', 'filled']
const ACTIVE_FILTER_CLS =
  'border-colorCompoundBrandStroke bg-colorBrandBackground text-colorNeutralForegroundOnBrand'
const IDLE_FILTER_CLS =
  'border-colorNeutralStroke2 bg-colorNeutralBackground1 text-colorNeutralForeground1 hover:bg-colorNeutralBackground1Hover'

interface IconCombo {
  name: string
  size: number
  style: FluentIconStyle
  exportName: string
}

const registry = iconsData.icons
const allSizes = iconsData.sizes

const keyword = ref('')
const sizeFilter = ref<number | 'all'>('all')
const styleFilter = ref<FluentIconStyle | 'all'>('all')
const visibleCount = ref(PAGE_SIZE)
const copiedName = ref<string | undefined>(undefined)

const pascalCase = (name: string): string =>
  name
    .split('_')
    .map((part) => part.replace(/^./, (char) => char.toUpperCase()))
    .join('')

const toExportName = (name: string, size: number, style: FluentIconStyle): string => {
  const styleSuffix = style.replace(/^./, (char) => char.toUpperCase())
  return `FluentIcon${pascalCase(name)}${size}${styleSuffix}`
}

const appendCombos = (list: IconCombo[], entry: (typeof registry)[number]): void => {
  for (const [sizeKey, styles] of Object.entries(entry.sizes)) {
    const size = Number(sizeKey)
    const sizeMatches = sizeFilter.value === 'all' || sizeFilter.value === size
    if (sizeMatches) {
      for (const style of styles as FluentIconStyle[]) {
        const styleMatches = styleFilter.value === 'all' || styleFilter.value === style
        if (styleMatches) {
          list.push({
            name: entry.name,
            size,
            style,
            exportName: toExportName(entry.name, size, style),
          })
        }
      }
    }
  }
}

const combos = computed<IconCombo[]>(() => {
  const query = keyword.value.trim().toLowerCase()
  const list: IconCombo[] = []
  for (const entry of registry) {
    if (!query || entry.name.includes(query)) {
      appendCombos(list, entry)
    }
  }
  return list
})

const visibleCombos = computed<IconCombo[]>(() =>
  combos.value.filter((_combo, index) => index < visibleCount.value),
)

const iconComponents = icons as unknown as Record<string, Component | undefined>

const getIconComponent = (exportName: string): Component | undefined => iconComponents[exportName]

const toggleSizeFilter = (size: number): void => {
  if (sizeFilter.value === size) {
    sizeFilter.value = 'all'
    return
  }
  sizeFilter.value = size
}

const toggleStyleFilter = (style: FluentIconStyle): void => {
  if (styleFilter.value === style) {
    styleFilter.value = 'all'
    return
  }
  styleFilter.value = style
}

const copyName = async (exportName: string): Promise<void> => {
  try {
    await navigator.clipboard.writeText(exportName)
  } catch {
    return
  }
  copiedName.value = exportName
  globalThis.setTimeout(() => {
    if (copiedName.value === exportName) {
      copiedName.value = undefined
    }
  }, COPY_RESET_MS)
}
</script>

<template>
  <div class="space-y-fluent-xxl">
    <h2 class="text-2xl font-semibold text-colorNeutralForeground1">Icons 图标库</h2>
    <p class="text-colorNeutralForeground2">
      WinUI 3 / Fluent System Icons 的 Vue3 图标组件，生成自官方开源包 @fluentui/svg-icons（MIT，即
      Segoe Fluent Icons 字体的矢量源）。共 {{ iconsData.totalNames }} 个图标名 ×
      {{ allSizes.join(' / ') }} 尺寸 × regular / filled 风格。
    </p>

    <!-- 用法示例 -->
    <section
      class="bg-colorNeutralBackground1 p-fluent-xxl rounded-fluent-xl shadow-2 border border-colorNeutralStroke1"
    >
      <h3 class="text-lg font-medium text-colorNeutralForeground1 mb-4">用法</h3>
      <pre
        class="bg-colorNeutralBackground2 border border-colorNeutralStroke2 rounded-fluent-md p-fluent-l text-sm text-colorNeutralForeground1 overflow-x-auto mb-fluent-l"
      ><code>{{
        `import { FluentIconAdd20Filled } from '@fluentui-vue/icons'

<FluentIconAdd20Filled />
<FluentIconAdd20Filled size="24" title="添加" />`
      }}</code></pre>
      <div class="flex gap-fluent-l items-center flex-wrap text-colorNeutralForeground1">
        <FluentIconAdd20Filled />
        <FluentIconSearch20Regular />
        <FluentIconSettings24Regular />
        <FluentIconDelete24Regular />
        <FluentIconCheckmarkCircle24Filled />
        <FluentButton
          appearance="primary"
          :icon="FluentIconAdd20Filled"
        >
          Add
        </FluentButton>
      </div>
    </section>

    <!-- 图标浏览器 -->
    <section
      class="bg-colorNeutralBackground1 p-fluent-xxl rounded-fluent-xl shadow-2 border border-colorNeutralStroke1"
    >
      <h3 class="text-lg font-medium text-colorNeutralForeground1 mb-4">图标浏览器</h3>

      <div class="flex gap-fluent-m items-center flex-wrap mb-fluent-l">
        <input
          v-model="keyword"
          type="search"
          placeholder="搜索图标名，如 access_time"
          class="px-fluent-m py-fluent-s rounded-fluent-md border border-colorNeutralStroke2 bg-colorNeutralBackground1 text-colorNeutralForeground1 placeholder-colorNeutralForeground4 outline-none focus:border-colorCompoundBrandStroke"
        />
        <div class="flex gap-fluent-xs flex-wrap items-center">
          <button
            v-for="size in allSizes"
            :key="size"
            type="button"
            class="px-fluent-m py-fluent-xs rounded-fluent-md border text-sm transition-colors"
            :class="{
              [ACTIVE_FILTER_CLS]: sizeFilter === size,
              [IDLE_FILTER_CLS]: sizeFilter !== size,
            }"
            @click="toggleSizeFilter(size)"
          >
            {{ size }}
          </button>
          <button
            type="button"
            class="px-fluent-m py-fluent-xs rounded-fluent-md border text-sm transition-colors"
            :class="{
              [ACTIVE_FILTER_CLS]: sizeFilter === 'all',
              [IDLE_FILTER_CLS]: sizeFilter !== 'all',
            }"
            @click="sizeFilter = 'all'"
          >
            全部尺寸
          </button>
        </div>
        <div class="flex gap-fluent-xs flex-wrap items-center">
          <button
            v-for="style in FILTER_STYLES"
            :key="style"
            type="button"
            class="px-fluent-m py-fluent-xs rounded-fluent-md border text-sm transition-colors"
            :class="{
              [ACTIVE_FILTER_CLS]: styleFilter === style,
              [IDLE_FILTER_CLS]: styleFilter !== style,
            }"
            @click="toggleStyleFilter(style)"
          >
            {{ style }}
          </button>
          <button
            type="button"
            class="px-fluent-m py-fluent-xs rounded-fluent-md border text-sm transition-colors"
            :class="{
              [ACTIVE_FILTER_CLS]: styleFilter === 'all',
              [IDLE_FILTER_CLS]: styleFilter !== 'all',
            }"
            @click="styleFilter = 'all'"
          >
            全部风格
          </button>
        </div>
      </div>

      <p class="text-colorNeutralForeground2 text-sm mb-fluent-l">
        共 {{ combos.length }} 个图标，点击任意图标复制组件名（当前渲染
        {{ visibleCombos.length }} 个）。
      </p>

      <div class="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-fluent-s">
        <button
          v-for="combo in visibleCombos"
          :key="combo.exportName"
          type="button"
          class="flex flex-col items-center gap-fluent-xs p-fluent-m rounded-fluent-md border border-colorNeutralStroke2 bg-colorNeutralBackground1 hover:bg-colorNeutralBackground1Hover transition-colors"
          :title="combo.exportName"
          @click="copyName(combo.exportName)"
        >
          <component
            :is="getIconComponent(combo.exportName)"
            class="text-colorNeutralForeground1"
          />
          <span class="w-full text-center text-xs text-colorNeutralForeground2 truncate">{{
            combo.exportName
          }}</span>
        </button>
      </div>

      <div class="mt-fluent-l flex items-center gap-fluent-m">
        <button
          v-if="visibleCombos.length < combos.length"
          type="button"
          class="px-fluent-l py-fluent-s rounded-fluent-md border border-colorNeutralStroke2 text-colorNeutralForeground1 hover:bg-colorNeutralBackground1Hover transition-colors"
          @click="visibleCount += PAGE_SIZE"
        >
          加载更多
        </button>
        <span
          v-if="copiedName"
          class="text-sm text-colorBrandForeground1"
        >
          已复制：{{ copiedName }}
        </span>
      </div>
    </section>
  </div>
</template>
