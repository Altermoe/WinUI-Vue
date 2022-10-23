<script lang="ts" setup>
import { NavMenu, ThemeProvider } from '@/components'

const items = [
  { title: '北京', value: 'beijing' },
  { title: '上海', value: 'shanghai' },
  { title: '广州', value: 'guangzhou' },
  { title: '深圳', value: 'shenzhen' },
]

const item = ref('shanghai')
</script>

<template>
  <ThemeProvider>
    <div style="display: flex; flex-direction: column; align-items: center; padding-top: 1em ; width: 100%; height: 100%">
      <div style="display: flex; flex-direction: column; gap: 1em">
        <NavMenu v-model="item" :items="items" />
      </div>
    </div>
  </ThemeProvider>
</template>
