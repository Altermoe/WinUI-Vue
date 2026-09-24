<script setup lang="ts">
import { FluereSlider } from '@fluere-vue/ui'
import { ref } from 'vue'

/** 演示用的初始值（集中命名，避免散落的字面量） */
const INITIAL_VOLUME = 45
const INITIAL_BRIGHTNESS = 80

const volume = ref(INITIAL_VOLUME)
const brightness = ref(INITIAL_BRIGHTNESS)
</script>

<template>
  <div class="flex flex-col gap-fluent-l max-w-sm">
    <FluereSlider
      v-model="volume"
      header="音量"
    />
    <FluereSlider
      v-model="brightness"
      header="亮度"
    />
    <p class="text-sm text-colorNeutralForeground3">音量：{{ volume }} · 亮度：{{ brightness }}</p>
  </div>
</template>
