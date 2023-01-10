<script lang="ts" setup>
import type { FunctionalComponent } from 'vue'
import { AppPage } from '../components'
import { Card, Slider } from '@/components'

const example = ref(30)

const rotate = ref(0)

const box: FunctionalComponent = (props, ctx) => h(
  'div',
  { class: 'flex flex-col flex-wrap items-start gap-2' },
  { default: ctx.slots.default },
)
</script>

<template>
  <AppPage>
    <Card title="基础用法" class="flex">
      <div class="flex-1">
        <div>{{ example }}</div>
        <component :is="box">
          <Slider v-model="example" :style="{ transform: `rotate(${rotate}deg)` }" />
        </component>
      </div>
      <div class="flex-1 flex flex-col items-start">
        旋转角度
        <input :min="0" :max="360" :value="`${rotate}`" type="range" @input="(ev) => rotate = Number((ev.target as HTMLInputElement).value)">
      </div>
    </Card>

    <Card title="禁用">
      <div>{{ example }}</div>
      <component :is="box">
        <Slider v-model="example" disabled />
      </component>
    </Card>
  </AppPage>
</template>
