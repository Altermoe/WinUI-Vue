<script setup lang="ts">
import { FluereNumberBox } from '@fluere-vue/ui'
import { ref } from 'vue'

/** 演示用的初始值 */
const INITIAL_FONT_SIZE = 14
const INITIAL_ZOOM = 1.25

const fontSize = ref<number | null>(INITIAL_FONT_SIZE)
const zoom = ref<number | null>(INITIAL_ZOOM)
</script>

<template>
  <div class="flex flex-col gap-fluent-l max-w-sm">
    <FluereNumberBox
      v-model="fontSize"
      :min="9"
      :max="72"
      spin-button-placement-mode="inline"
      header="字号（按住按钮可连续步进）"
    />
    <FluereNumberBox
      v-model="zoom"
      :min="0.5"
      :max="3"
      :step="0.25"
      spin-button-placement-mode="inline"
      header="缩放"
    />
    <p class="text-sm text-colorNeutralForeground3">
      内联按钮与输入框共用一个 TextBox 边框：按钮 32×24、外边距 4、圆角 4，按下后每 250ms
      重复一次（WinUI RepeatButton 的 Delay / Interval 缺省值）。
    </p>
  </div>
</template>
