<script lang="ts" setup>
import { useStyleTag } from '@vueuse/core'
import { createStyle, getDefaultLightTheme } from '@/theme'

const css = createStyle(getDefaultLightTheme())
const { unload } = useStyleTag(css)
onUnmounted(unload)
</script>

<template>
  <slot />
</template>
