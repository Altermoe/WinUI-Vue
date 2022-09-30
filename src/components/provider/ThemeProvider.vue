<script lang="ts" setup>
import { useStyleTag } from '@vueuse/core'
import { createStyle, getDefaultLightTheme } from '@/theme'
import '@/styles/font.scss'

const css = createStyle(getDefaultLightTheme())
const { unload } = useStyleTag(css)
onUnmounted(unload)
</script>

<template>
  <slot />
</template>
