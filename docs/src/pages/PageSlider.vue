<script lang="ts" setup>
import type { FunctionalComponent } from 'vue'
import { AppPage } from '../components'
import { Card, Slider } from '@/components'

const example = ref(50)

const box: FunctionalComponent = (props, ctx) => h(
  'div',
  { class: 'flex flex-col flex-wrap items-start gap-2' },
  { default: ctx.slots.default },
)
</script>

<template>
  <AppPage>
    <Card title="基础用法">
      <div>{{ example }}</div>
      <component :is="box">
        <Slider v-model="example" />
      </component>
    </Card>

    <Card title="禁用">
      <div>{{ example }}</div>
      <component :is="box">
        <Slider v-model="example" disabled />
      </component>
    </Card>
  </AppPage>
</template>
