<script setup lang="ts">
import { FluereNumberBox } from '@fluere-vue/ui'
import { ref } from 'vue'

/** 演示用的初始值（集中命名，避免散落的字面量） */
const INITIAL_QUANTITY = 12
const INITIAL_PRICE = 199.9

const quantity = ref<number | null>(INITIAL_QUANTITY)
const price = ref<number | null>(INITIAL_PRICE)
</script>

<template>
  <div class="flex flex-col gap-fluent-l max-w-sm">
    <FluereNumberBox
      v-model="quantity"
      header="数量"
    />
    <FluereNumberBox
      v-model="price"
      header="单价"
      description="支持小数：失焦或回车后按 step 的小数位格式化"
    />
    <p class="text-sm text-colorNeutralForeground3">
      数量：{{ quantity ?? '—' }} · 单价：{{ price ?? '—' }}（清空输入框会得到 null，对应 WinUI 的
      NaN）
    </p>
  </div>
</template>
