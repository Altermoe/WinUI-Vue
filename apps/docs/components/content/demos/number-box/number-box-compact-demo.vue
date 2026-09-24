<script setup lang="ts">
import { FluereNumberBox } from '@fluere-vue/ui'
import { ref } from 'vue'

/** 演示用的初始值 */
const INITIAL_OPACITY = 80
const INITIAL_COLUMNS = 4

const opacity = ref<number | null>(INITIAL_OPACITY)
const columns = ref<number | null>(INITIAL_COLUMNS)
</script>

<template>
  <div class="flex flex-col gap-fluent-l max-w-sm">
    <FluereNumberBox
      v-model="opacity"
      :min="0"
      :max="100"
      spin-button-placement-mode="compact"
      header="不透明度"
    />
    <FluereNumberBox
      v-model="columns"
      :min="1"
      :max="12"
      spin-button-placement-mode="compact"
      header="栅格列数（聚焦后浮出上 / 下按钮）"
    />
    <p class="text-sm text-colorNeutralForeground3">
      紧凑模式在输入框右侧显示上 / 下指示器，聚焦时于右侧浮出 36×36 的按钮面板（圆角 8 + 阴影深度
      16），失焦即收起。
    </p>
  </div>
</template>
