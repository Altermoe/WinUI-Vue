<script lang="ts" setup>
import type { FunctionalComponent } from 'vue'
import { AppPage } from '../components'
import { Card, TextBox } from '@/components'

const text = ref('越过长城，走向世界')

const box: FunctionalComponent = (props, ctx) => h(
  'div',
  { class: 'flex flex-col flex-wrap items-start gap-2' },
  { default: ctx.slots.default },
)
</script>

<template>
  <AppPage>
    <Card title="基础">
      <component :is="box">
        <TextBox v-model="text" clearable placeholder="请输入内容" />
      </component>
    </Card>

    <Card title="禁用">
      <component :is="box">
        <TextBox v-model="text" disabled />
      </component>
    </Card>

    <Card title="只读">
      <component :is="box">
        <TextBox v-model="text" readonly />
      </component>
    </Card>
  </AppPage>
</template>
