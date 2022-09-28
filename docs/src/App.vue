<script lang="ts" setup>
import { Base, Layer, ThemeProvider } from '@/components'
const title = 'Coming soon'
const content = 'Vue3 implementation of Windows 11 UI Design Principles.'
</script>

<template>
  <ThemeProvider>
    <Base style="display: grid; place-items: center; width: 80%; height: 80%">
      <Layer style="padding: 1em">
        <div>
          <h1>{{ title }}</h1>
          <p>{{ content }}</p>
        </div>
      </Layer>
    </Base>
  </ThemeProvider>
</template>
