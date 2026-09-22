<script setup lang="ts">
import { FluentIconWeatherMoon24Regular, FluentIconWeatherSunny24Regular } from '@fluere-vue/icons'

const { isDark, toggle } = useColorMode()
</script>

<template>
  <button
    type="button"
    class="flex items-center justify-center w-8 h-8 rounded-fluent-md border border-colorNeutralStroke1 hover:bg-colorNeutralBackground1Hover text-colorNeutralForeground2 transition-colors"
    :aria-label="isDark ? '切换到亮色模式' : '切换到暗色模式'"
    :title="isDark ? '切换到亮色模式' : '切换到暗色模式'"
    @click="toggle"
  >
    <FluentIconWeatherSunny24Regular v-if="isDark" />
    <FluentIconWeatherMoon24Regular v-else />
  </button>
</template>
