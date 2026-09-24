<script setup lang="ts">
import type { FluereComboboxItem, FluereComboboxSelectionChangedEventArgs } from '@fluere-vue/ui'
import { FluereCombobox } from '@fluere-vue/ui'
import { ref } from 'vue'

interface City {
  id: number
  name: string
}

/** 对象项：用 `by` 指定项身份，`text` 决定显示与搜索文本 */
const CITIES: City[] = [
  { id: 1, name: '北京' },
  { id: 2, name: '上海' },
  { id: 3, name: '广州' },
  { id: 4, name: '深圳' },
]

/** 缺省选中上海（按名字找，避免下标字面量） */
const city = ref<City | null>(CITIES.find((item) => item.name === '上海') ?? null)
const history = ref<string[]>([])
/** 选中项映射成组件要的选项数据（对象项 + 显示文本） */
const CITY_ITEMS: FluereComboboxItem<City>[] = CITIES.map((item) => ({
  value: item,
  text: item.name,
}))

const onSelectionChanged = (args: FluereComboboxSelectionChangedEventArgs<City>): void => {
  history.value = [
    ...history.value,
    `+${args.addedItem?.name ?? 'null'}（下标 ${args.addedIndex}） −${args.removedItem?.name ?? 'null'}（下标 ${args.removedIndex}）`,
  ]
}
</script>

<template>
  <div class="flex flex-col gap-fluent-l max-w-xs">
    <FluereCombobox
      v-model="city"
      :items="CITY_ITEMS"
      by="id"
      header="城市（对象项 + by）"
      @selection-changed="onSelectionChanged"
    />
    <ul class="text-sm text-colorNeutralForeground3 space-y-1">
      <li
        v-for="(entry, index) in history"
        :key="index"
      >
        {{ entry }}
      </li>
    </ul>
  </div>
</template>
