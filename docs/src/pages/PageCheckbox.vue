<script lang="ts" setup>
import type { FunctionalComponent } from 'vue'
import { AppPage } from '../components'
import { Card, Checkbox, CheckboxGroup } from '@/components'

const example = ref(['shanghai'])
const exampel2 = ref(true)

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
        <CheckboxGroup v-model="example" :options="options" />
      </component>
    </Card>

    <Card title="禁用">
      <component :is="box">
        <CheckboxGroup v-model="example" :options="options" disabled />
      </component>
    </Card>

    <Card title="半选择">
      <component :is="box">
        <Checkbox v-model="exampel2" label="半选择" indeterminate />
        <Checkbox v-model="exampel2" label="半选择禁用" disabled indeterminate />
      </component>
    </Card>
  </AppPage>
</template>
