<script setup lang="ts">
import type { FluereComboboxItem, FluereComboboxTextSubmittedEventArgs } from '@fluere-vue/ui'
import { FluereCombobox } from '@fluere-vue/ui'
import { ref } from 'vue'

/** 最近使用过的名称：可编辑态下用户也能输入列表外的值 */
const RECENT_NAMES: FluereComboboxItem<string>[] = [
  { value: 'Fluere', text: 'Fluere' },
  { value: 'WinUI', text: 'WinUI' },
  { value: 'Fluent 2', text: 'Fluent 2' },
]

const name = ref<string | null>('WinUI')
const log = ref('')

const onTextSubmitted = (args: FluereComboboxTextSubmittedEventArgs): void => {
  log.value = `提交了列表外的文本：${args.text}（选中项已清空，文本保留）`
}
</script>

<template>
  <div class="flex flex-col gap-fluent-l max-w-xs">
    <FluereCombobox
      v-model="name"
      :items="RECENT_NAMES"
      editable
      header="名称（可自定义）"
      placeholder="输入或选择"
      @text-submitted="onTextSubmitted"
    />
    <p class="text-sm text-colorNeutralForeground3">选中项：{{ name ?? '—' }}</p>
    <p
      v-if="log"
      class="text-sm text-colorNeutralForeground3"
    >
      {{ log }}
    </p>
  </div>
</template>
