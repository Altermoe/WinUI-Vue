<script setup lang="ts">
import { FluereNumberBox } from '@fluere-vue/ui'
import { ref } from 'vue'

/** 演示用的初始值 */
const INITIAL_STRICT = 20
const INITIAL_LENIENT = 20

const strict = ref<number | null>(INITIAL_STRICT)
const lenient = ref<number | null>(INITIAL_LENIENT)
</script>

<template>
  <div class="flex flex-col gap-fluent-l max-w-sm">
    <FluereNumberBox
      v-model="strict"
      :min="0"
      :max="100"
      header="默认：非法输入被覆盖"
      description="试试输入 abc —— 失焦后回到 20；输入 150 —— 钳制到 100"
    />
    <FluereNumberBox
      v-model="lenient"
      :min="0"
      :max="100"
      validation-mode="disabled"
      header="ValidationMode=Disabled：保留输入"
      description="文本原样保留，值仍停在最后一次合法解析结果"
    />
    <p class="text-sm text-colorNeutralForeground3">
      严格模式：{{ strict ?? '—' }} · 宽松模式：{{ lenient ?? '—' }}
    </p>
  </div>
</template>
