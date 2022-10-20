<script lang="ts" setup>
import { NavMenu, ThemeProvider } from '@/components'
</script>

<template>
  <ThemeProvider>
    <div style="display: flex; flex-direction: column; align-items: center; padding-top: 1em ; width: 100%; height: 100%">
      <div style="display: flex; flex-direction: column; gap: 1em">
        <NavMenu />
      </div>
    </div>
  </ThemeProvider>
</template>
