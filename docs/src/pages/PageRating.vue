<script lang="ts" setup>
import type { FunctionalComponent } from 'vue'
import { AppPage } from '../components'
import { Card, Rating } from '@/components'

const example = ref(3)

const box: FunctionalComponent = (props, ctx) => h(
  'div',
  { class: 'flex flex-col flex-wrap items-start gap-2' },
  { default: ctx.slots.default },
)
</script>

<template>
  <AppPage>
    <Card title="基础用法">
      <component :is="box">
        <Rating v-model="example" />
        {{ example }}
      </component>
    </Card>

    <Card title="禁用">
      <component :is="box">
        <Rating v-model="example" disabled />
      </component>
    </Card>
  </AppPage>
</template>
