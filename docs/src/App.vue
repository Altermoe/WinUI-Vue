<script lang="ts" setup>
import { Base, Dropdown, ThemeProvider } from '@/components'
import type { DropdownItem } from '@/components'

const value = ref('shanghai')

const items: DropdownItem[] = [
  { title: '上海', key: 'shanghai', value: 'shanghai' },
  { title: '广州', key: 'guanghzou', value: 'guangzhou ' },
]
</script>

<template>
  <ThemeProvider>
    <Base style="display: grid; place-items: center; width: 90%; height: 90%">
      <div style="display: flex; flex-direction: column; gap: 1em">
        <Dropdown v-model="value" :items="items" disabled />
      </div>
    </Base>
  </ThemeProvider>
</template>
