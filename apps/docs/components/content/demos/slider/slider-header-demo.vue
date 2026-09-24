<script setup lang="ts">
import { FluereSlider } from '@fluere-vue/ui'
import { ref } from 'vue'

/** 演示用的初始字号 */
const INITIAL_FONT_SIZE = 14

const fontSize = ref(INITIAL_FONT_SIZE)
</script>

<template>
  <div class="flex flex-col gap-fluent-l max-w-sm">
    <FluereSlider
      v-model="fontSize"
      :min="9"
      :max="72"
      :step="1"
      header="字号"
    >
      <template #header>字号（{{ fontSize }} px）</template>
    </FluereSlider>
    <FluereSlider
      v-model="fontSize"
      label="字号滑块"
    />
    <p class="text-sm text-colorNeutralForeground3">
      按住滑块或在键盘聚焦时，滑块上方会浮出 WinUI 的数值提示（Disambiguation UI）。
    </p>
  </div>
</template>
