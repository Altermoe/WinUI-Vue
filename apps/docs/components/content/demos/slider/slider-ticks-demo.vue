<script setup lang="ts">
import { FluereSlider } from '@fluere-vue/ui'
import { ref } from 'vue'

/** 演示用的初始值 */
const INITIAL_INLINE = 30
const INITIAL_OUTSIDE = 30
/** 每 10 一格刻度 */
const TICK_FREQUENCY = 10

const inline = ref(INITIAL_INLINE)
const outside = ref(INITIAL_OUTSIDE)
</script>

<template>
  <div class="flex flex-col gap-fluent-xxl max-w-sm">
    <FluereSlider
      v-model="inline"
      tick-placement="inline"
      :tick-frequency="TICK_FREQUENCY"
      header="刻度在轨道内（TickPlacement=Inline）"
    />
    <FluereSlider
      v-model="outside"
      tick-placement="outside"
      :tick-frequency="TICK_FREQUENCY"
      header="刻度在轨道外（TickPlacement=Outside）"
    />
    <p class="text-sm text-colorNeutralForeground3">
      与 WinUI 一致：`tickFrequency` 为 0（默认）时不画刻度线。
    </p>
  </div>
</template>
