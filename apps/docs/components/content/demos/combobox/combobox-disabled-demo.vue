<script setup lang="ts">
import type { FluereComboboxItem } from '@fluere-vue/ui'
import { FluereCombobox } from '@fluere-vue/ui'
import { ref } from 'vue'

/** 含不可选项的列表：不可选项不参与方向键选区与文本搜索 */
const PLANS: FluereComboboxItem<string>[] = [
  { value: 'free', text: '免费版' },
  { value: 'pro', text: '专业版' },
  { value: 'team', text: '团队版（内测中）', disabled: true },
  { value: 'enterprise', text: '企业版' },
]

const plan = ref<string | null>('pro')
const locked = ref<string | null>('team')
</script>

<template>
  <div class="flex flex-col gap-fluent-l max-w-xs">
    <FluereCombobox
      v-model="plan"
      :items="PLANS"
      header="可选中：方向键与文本搜索都会跳过禁用项"
    />
    <FluereCombobox
      v-model="locked"
      :items="PLANS"
      disabled
      header="整体禁用"
    />
  </div>
</template>
