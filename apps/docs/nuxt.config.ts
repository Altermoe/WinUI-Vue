import { fileURLToPath } from 'node:url'
import { presetFluent } from '@fluentui-vue/themes'
import presetFluentUi from '@fluentui-vue/ui/preset'
import { presetWind4, type Preset } from 'unocss'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',
  devtools: { enabled: true },
  modules: ['@unocss/nuxt'],
  unocss: {
    presets: [presetWind4(), presetFluent() as Preset, presetFluentUi()],
    content: {
      pipeline: {
        include: [
          // 扫描当前 docs 项目内的文件
          /\.(vue|svelte|[jt]sx|mdx?|astro|elm|php|phtml|html)($|\?)/,
          // 扫描 ui 组件包的源码，让 UnoCSS 能提取到 fluent-btn-* 等组件类名
          fileURLToPath(new URL('../../packages/ui/src/**/*.{vue,ts,js}', import.meta.url)),
        ],
      },
    },
  },
  devServer: {
    port: 60727,
  },
  app: {
    head: {
      htmlAttrs: {
        lang: 'zh-CN',
      },
      title: 'FluentUI-Vue',
      link: [{ rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
    },
  },
})
