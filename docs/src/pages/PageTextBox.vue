<script lang="ts" setup>
import type { FunctionalComponent } from 'vue'
import { AppPage } from '../components'
import { Card, TextBox } from '@/components'

const text = ref('')

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
        <TextBox v-model="text" />
      </component>
    </Card>

    <Card title="禁用">
      <component :is="box">
        <TextBox v-model="text" disabled />
      </component>
    </Card>

    <Card title="可清除">
      <component :is="box">
        <TextBox v-model="text" clearable />
      </component>
    </Card>

    <Card title="密码">
      <component :is="box">
        <TextBox v-model="text" type="password" />
      </component>
    </Card>
  </AppPage>
</template>
