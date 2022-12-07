<script lang="ts" setup>
import type { FunctionalComponent } from 'vue'
import { AppPage } from '../components'
import { Card, ColorPicker } from '@/components'

const example = ref('')

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
        <ColorPicker v-model="example" />
      </component>
    </Card>
  </AppPage>
</template>
