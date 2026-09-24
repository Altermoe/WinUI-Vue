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
    <!--
      两个图标都渲染、可见性交给 CSS（按 html[data-color-mode]，与 content-code.css 同一约定）：
      SSR 与水合的 DOM 完全一致，主题差异由 nuxt.config 的首帧脚本在水合前写入的属性决定，
      既不产生水合告警，也不会闪错图标。aria-label/title 仍是动态文案，靠
      useColorMode 把「读取存储值」推迟到 onMounted（水合完成后）保证属性一致。
    -->
    <FluentIconWeatherSunny24Regular class="fui-theme-toggle__icon fui-theme-toggle__icon--sun" />
    <FluentIconWeatherMoon24Regular class="fui-theme-toggle__icon fui-theme-toggle__icon--moon" />
  </button>
</template>

<style scoped>
/* 亮色（或脚本未写入属性）显示月亮、暗色显示太阳 —— 语义与原 isDark 分支一致：
   图标提示的是「可切换到的目标模式」。选择器锚定 html 属性（组件外的全局状态），
   而图标本身带本组件 scope id，故只作用于这两个 svg。 */
html:not([data-color-mode='dark']) .fui-theme-toggle__icon--sun {
  display: none;
}
html[data-color-mode='dark'] .fui-theme-toggle__icon--moon {
  display: none;
}
</style>
