<script setup lang="ts">
import { FluereNumberBox } from '@fluere-vue/ui'
import { ref } from 'vue'

/** 演示用的初始值 */
const INITIAL_TOTAL = 0
const INITIAL_BUDGET = 1000
const INITIAL_TAX_RATE = 0.06

const total = ref<number | null>(INITIAL_TOTAL)
const budget = ref<number | null>(INITIAL_BUDGET)
const taxRate = ref<number | null>(INITIAL_TAX_RATE)
</script>

<template>
  <div class="flex flex-col gap-fluent-l max-w-sm">
    <FluereNumberBox
      v-model="total"
      accepts-expression
      placeholder="例如 (2+3)*4^2"
      header="计算值"
    />
    <FluereNumberBox
      v-model="budget"
      :min="0"
      :max="5000"
      accepts-expression
      header="预算（可输入 200*3+500）"
    />
    <FluereNumberBox
      v-model="taxRate"
      :min="0"
      :max="1"
      :step="0.01"
      accepts-expression
      header="税率"
      description="失焦或回车时求值，按 ^ > * / > + − 的优先级与括号计算"
    />
    <p class="text-sm text-colorNeutralForeground3">
      计算值：{{ total ?? '—' }} · 预算：{{ budget ?? '—' }} · 税率：{{ taxRate ?? '—' }}
    </p>
  </div>
</template>
