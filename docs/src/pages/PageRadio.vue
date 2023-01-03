<script lang="ts" setup>
import type { FunctionalComponent } from 'vue'
import { AppPage } from '../components'
import { Card, RadioGroup } from '@/components'

const example = ref('banya')

const box: FunctionalComponent = (props, ctx) => h(
  'div',
  { class: 'flex flex-col flex-wrap items-start gap-2' },
  { default: ctx.slots.default },
)

const options = [
  {
    label: '板鸭',
    value: 'banana',
  },
  {
    label: '板鸭',
    value: 'banya',
  },
  {
    label: '烧鸡',
    value: 'shaoji',
  },
  {
    label: '咕呀',
    value: 'guya',
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
