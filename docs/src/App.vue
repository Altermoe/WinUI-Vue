<script lang="ts" setup>
import { Base, Button, Layer, ThemeProvider } from '@/components'
</script>

<template>
  <ThemeProvider>
    <Base style="display: grid; place-items: center; width: 80%; height: 80%">
      <div style="display: flex; gap: 1em">
        <Button type="accent">
          Hello world
        </Button>
        <Button type="standard">
          Hello world
        </Button>
      </div>
    </Base>
  </ThemeProvider>
</template>
