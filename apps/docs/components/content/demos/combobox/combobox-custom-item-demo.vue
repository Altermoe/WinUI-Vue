<script setup lang="ts">
import type { FluereComboboxItem } from '@fluere-vue/ui'
import { FluereCombobox } from '@fluere-vue/ui'
import { ref } from 'vue'

/** 自定义项：用 #item 插槽给每项加色块（对应 WinUI 的 ItemTemplate） */
const COLORS: FluereComboboxItem<string>[] = [
  { value: '#0f6cbd', text: '品牌蓝' },
  { value: '#107c10', text: '绿' },
  { value: '#d13438', text: '红' },
  { value: '#ffb900', text: '黄' },
]

const color = ref<string | null>('#0f6cbd')
</script>

<template>
  <div class="flex flex-col gap-fluent-l max-w-xs">
    <FluereCombobox
      v-model="color"
      :items="COLORS"
      header="强调色"
    >
      <template #item="{ item }">
        <span class="flex items-center gap-2">
          <span
            class="inline-block w-4 h-4 rounded-fluent-sm border border-colorNeutralStroke1"
            :style="{ backgroundColor: item.value }"
          />
          {{ item.text }}
        </span>
      </template>
    </FluereCombobox>
    <p class="text-sm text-colorNeutralForeground3">当前：{{ color ?? '—' }}</p>
  </div>
</template>
