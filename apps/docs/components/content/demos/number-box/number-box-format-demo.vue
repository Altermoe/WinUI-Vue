<script setup lang="ts">
import { FluereNumberBox } from '@fluere-vue/ui'
import { ref } from 'vue'

/** 演示用的初始值 */
const INITIAL_INTEGER = 25.8
const INITIAL_FIXED = 25.8
const INITIAL_GERMAN = 1234.5

const integer = ref<number | null>(INITIAL_INTEGER)
const fixed = ref<number | null>(INITIAL_FIXED)
const german = ref<number | null>(INITIAL_GERMAN)
</script>

<template>
  <div class="flex flex-col gap-fluent-l max-w-sm">
    <FluereNumberBox
      v-model="integer"
      :format-options="{ maximumFractionDigits: 0 }"
      header="整数外观（maximumFractionDigits: 0）"
      description="25.8 显示为 26 —— 与 WinUI 默认 DecimalFormatter 的 FractionDigits(0) 同观感"
    />
    <FluereNumberBox
      v-model="fixed"
      :format-options="{ minimumFractionDigits: 2, maximumFractionDigits: 2 }"
      header="固定两位小数"
    />
    <FluereNumberBox
      v-model="german"
      locale="de-DE"
      header="de-DE：1.234,5"
      description="小数点与分组分隔符跟随 locale，解析也认同一套符号"
    />
  </div>
</template>
