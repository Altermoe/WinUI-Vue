<script lang="ts" setup>
import type { FunctionalComponent } from 'vue'
import { AppPage } from '../components'
import { Card, RadioGroup } from '@/components'

const example = ref('shanghai')

const box: FunctionalComponent = (props, ctx) => h(
  'div',
  { class: 'flex flex-col flex-wrap items-start gap-2' },
  { default: ctx.slots.default },
)

const options = [
  {
    label: '北京',
    value: 'beijing',
  },
  {
    label: '上海',
    value: 'shanghai',
  },
  {
    label: '广州',
    value: 'guangzhou',
  },
  {
    label: '深圳',
    value: 'shenzhen',
  },
]
</script>

<template>
  <AppPage>
    <Card title="基础用法">
      <component :is="box">
        <RadioGroup v-model="example" :options="options" />
      </component>
    </Card>
  </AppPage>
</template>
