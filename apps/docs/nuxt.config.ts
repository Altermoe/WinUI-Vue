import { presetFluent } from '@fluentui-vue/themes'
import { presetWind4, type Preset } from 'unocss'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',
  devtools: { enabled: true },
  modules: ['@unocss/nuxt'],
  unocss: {
    presets: [presetWind4(), presetFluent() as Preset],
    content: {
      pipeline: {
        include: [
          // 扫描当前 docs 项目内的文件
          /\.(vue|svelte|[jt]sx|mdx?|astro|elm|php|phtml|html)($|\?)/,
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
