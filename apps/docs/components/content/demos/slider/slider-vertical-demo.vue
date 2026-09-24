<script setup lang="ts">
import { FluereSlider } from '@fluere-vue/ui'
import { ref } from 'vue'

/** 演示用的初始值 */
const INITIAL_BASS = 60
const INITIAL_TREBLE = 35
/** 纵向滑块长度（px） */
const SLIDER_LENGTH = 160

const bass = ref(INITIAL_BASS)
const treble = ref(INITIAL_TREBLE)
</script>

<template>
  <div class="flex items-start gap-fluent-xxl">
    <div class="flex flex-col items-center gap-fluent-m">
      <FluereSlider
        v-model="bass"
        orientation="vertical"
        :vertical-length="SLIDER_LENGTH"
        label="低音"
      />
      <span class="text-sm text-colorNeutralForeground3">低音 {{ bass }}</span>
    </div>
    <div class="flex flex-col items-center gap-fluent-m">
      <FluereSlider
        v-model="treble"
        orientation="vertical"
        :vertical-length="SLIDER_LENGTH"
        label="高音"
      />
      <span class="text-sm text-colorNeutralForeground3">高音 {{ treble }}</span>
    </div>
    <p class="text-sm text-colorNeutralForeground3 max-w-[16rem]">
      纵向滑块的取值自下而上递增（与 WinUI 一致：最小值在底部）；传
      <code>inverted</code> 可反向。
    </p>
  </div>
</template>
