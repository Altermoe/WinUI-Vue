<script setup lang="ts">
import type { FluereComboboxItem } from '@fluere-vue/ui'
import { FluereCombobox } from '@fluere-vue/ui'
import { ref } from 'vue'

/** 演示用颜色列表（对应 WinUI Gallery 的 ComboBox 基础示例） */
const COLORS: FluereComboboxItem<string>[] = [
  { value: 'blue', text: '蓝色' },
  { value: 'green', text: '绿色' },
  { value: 'red', text: '红色' },
  { value: 'yellow', text: '黄色' },
]

const picked = ref<string | null>(null)
</script>

<template>
  <div class="flex flex-col gap-fluent-l max-w-xs">
    <FluereCombobox
      v-model="picked"
      :items="COLORS"
      header="颜色"
      placeholder="请选择颜色"
    />
    <p class="text-sm text-colorNeutralForeground3">
      当前选中：{{ picked ?? '—' }}（未选中时输入框显示 placeholder）
    </p>
  </div>
</template>
