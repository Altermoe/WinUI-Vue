<script lang="ts" setup>
import { AppPage } from '../components'
import type { DropdownItem } from '@/components'
import { Card, Dropdown } from '@/components'

const items: DropdownItem[] = [
  { title: '北京', value: 'beijing', key: 'beijing' },
  { title: '上海', value: 'shanghai', key: 'shanghai' },
  { title: '广州', value: 'guangzhou', key: 'guangzhou' },
  { title: '深圳', value: 'shenzhen', key: 'shenzhen' },
]

const modelValue = ref('shanghai')
</script>

<template>
  <AppPage>
    <Card title="基础用法">
      <Dropdown v-model="modelValue" :items="items" />
    </Card>

    <Card title="禁用">
      <Dropdown v-model="modelValue" :items="items" disabled />
    </Card>
  </AppPage>
</template>
