<script setup lang="ts">
import type { FluereComboboxItem } from '@fluere-vue/ui'
import { FluereCombobox } from '@fluere-vue/ui'
import { ref } from 'vue'

/** 设置项风格的列表：标题 + 说明 + 可访问名 */
const FONT_SIZES: FluereComboboxItem<number>[] = [
  { value: 12, text: '12 px' },
  { value: 14, text: '14 px' },
  { value: 16, text: '16 px' },
  { value: 20, text: '20 px' },
]

/** 缺省字号（px） */
const DEFAULT_FONT_SIZE = 14

const fontSize = ref<number | null>(DEFAULT_FONT_SIZE)
</script>

<template>
  <div class="flex flex-col gap-fluent-l max-w-xs">
    <FluereCombobox
      v-model="fontSize"
      :items="FONT_SIZES"
      header="正文字号"
      description="Header 同时作为缺省的可访问名；description 会挂到 aria-describedby"
      label="正文字号选择器"
    />
    <p class="text-sm text-colorNeutralForeground3">字号：{{ fontSize ?? '—' }}</p>
  </div>
</template>
