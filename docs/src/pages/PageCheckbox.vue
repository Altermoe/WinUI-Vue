<script lang="ts" setup>
import type { FunctionalComponent } from 'vue'
import { AppPage } from '../components'
import { Card, Checkbox, CheckboxGroup } from '@/components'

const box: FunctionalComponent = (props, ctx) => h(
  'div',
  { class: 'flex flex-wrap items-start gap-2' },
  { default: ctx.slots.default },
)

const example = ref(['shanghai'])
const options = [
  { label: '北京', value: 'beijing' },
  { label: '上海', value: 'shanghai' },
  { label: '广州', value: 'guangzhou' },
  { label: '深圳', value: 'shenzhen' },
]

const exampel1 = ref(true)

const example2 = ref(['xigua', 'shizi'])
const options2 = [
  { label: '苹果', value: 'pingguo' },
  { label: '西瓜', value: 'xigua' },
  { label: '雪梨', value: 'xueli' },
  { label: '柿子', value: 'shizi', disabled: true },
]
</script>

<template>
  <AppPage>
    <Card title="基础用法">
      <component :is="box">
        <Checkbox label="单个使用" />
      </component>
    </Card>

    <Card title="单个禁用">
      <component :is="box">
        <Checkbox label="单个使用" />
      </component>
    </Card>

    <Card title="多选框组">
      <component :is="box">
        <CheckboxGroup v-model="example" :options="options" />
      </component>
    </Card>

    <Card title="多选框组整体禁用">
      <component :is="box">
        <CheckboxGroup v-model="example" :options="options" disabled />
      </component>
    </Card>

    <Card title="多选框组部分禁用">
      <component :is="box">
        <CheckboxGroup v-model="example2" :options="options2" />
      </component>
    </Card>

    <Card title="半选择">
      <component :is="box">
        <Checkbox v-model="exampel1" label="半选择" indeterminate />
        <Checkbox v-model="exampel1" label="半选择禁用" disabled indeterminate />
      </component>
    </Card>
  </AppPage>
</template>
