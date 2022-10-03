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
    <div style="display: flex; flex-direction: column; align-items: center; padding-top: 1em ; width: 100%; height: 100%">
      <div style="display: flex; flex-direction: column; gap: 1em">
        <Dropdown v-model="value" :items="items" />
      </div>
    </div>
  </ThemeProvider>
</template>
