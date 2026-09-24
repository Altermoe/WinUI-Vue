<script setup lang="ts">
import { FluereNumberBox } from '@fluere-vue/ui'
import { ref } from 'vue'

/** 演示用的初始值 */
const INITIAL_QUANTITY = 100
const INITIAL_RATIO = 0.4

const quantity = ref<number | null>(INITIAL_QUANTITY)
const ratio = ref<number | null>(INITIAL_RATIO)
</script>

<template>
  <div class="flex flex-col gap-fluent-l max-w-sm">
    <FluereNumberBox
      v-model="quantity"
      :min="0"
      :max="500"
      :step="10"
      :large-step="100"
      header="数量（0–500）"
    />
    <FluereNumberBox
      v-model="ratio"
      :min="0"
      :max="1"
      :step="0.1"
      header="比例（0–1，步进 0.1）"
    />
    <p class="text-sm text-colorNeutralForeground3">
      方向键 / 滚轮按 step 走，PageUp / PageDown 按 largeStep 走；越界被钳制在区间内，与 WinUI
      一致不做步长吸附。
    </p>
  </div>
</template>
