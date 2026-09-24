<script setup lang="ts">
import { FluereSlider } from '@fluere-vue/ui'
import { ref } from 'vue'

/** 演示用的初始值 */
const INITIAL_PRICE = 250
const INITIAL_RATIO = 0.4

const price = ref(INITIAL_PRICE)
const ratio = ref(INITIAL_RATIO)
</script>

<template>
  <div class="flex flex-col gap-fluent-l max-w-sm">
    <FluereSlider
      v-model="price"
      :min="0"
      :max="1000"
      :step="50"
      header="价格（0–1000，步进 50）"
    />
    <FluereSlider
      v-model="ratio"
      :min="0"
      :max="1"
      :step="0.1"
      header="缩放（0–1，步进 0.1）"
    />
    <p class="text-sm text-colorNeutralForeground3">
      ¥{{ price }} · {{ ratio.toFixed(1) }}× —— 方向键按 step 走，PageUp / PageDown 或 Shift +
      方向键跳 10 步。
    </p>
  </div>
</template>
