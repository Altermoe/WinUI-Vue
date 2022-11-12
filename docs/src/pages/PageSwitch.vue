<script lang="ts" setup>
import type { FunctionalComponent } from 'vue'
import { AppPage } from '../components'
import { Card, Switch } from '@/components'

const example = ref(false)

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
        <Switch v-model="example" clearable />
      </component>
    </Card>
  </AppPage>
</template>
