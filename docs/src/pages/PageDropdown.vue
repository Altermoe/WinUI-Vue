<script lang="ts" setup>
import type { DropdownItem } from '@/components'
import { Dropdown } from '@/components'

const items: DropdownItem[] = [
  { title: '北京', value: 'beijing', key: 'beijing' },
  { title: '上海', value: 'shanghai', key: 'shanghai' },
  { title: '广州', value: 'guangzhou', key: 'guangzhou' },
  { title: '深圳', value: 'shenzhen', key: 'shenzhen' },
]

const modelValue = ref('shanghai')
</script>

<template>
  <div class="h-full overflow-auto flex flex-col">
    <div class="flex gap-4 p-4">
      <div>普通</div>
      <Dropdown v-model="modelValue" :items="items" />
    </div>
  </div>
</template>
