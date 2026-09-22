import { presetFluere } from '@fluere-vue/themes'
import { presetWind4, type Preset } from 'unocss'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',
  devtools: { enabled: true },
  modules: ['@unocss/nuxt', '@nuxt/content'],
  content: {
    // 用 Node 原生 sqlite（v22.5+），避免 pnpm 原生构建脚本被禁导致的 better-sqlite3 绑定问题
    experimental: { sqliteConnector: 'native' },
    build: {
      markdown: {
        highlight: {
          theme: {
            default: 'github-light',
            dark: 'github-dark',
          },
          langs: ['js', 'ts', 'json', 'vue', 'html', 'css', 'shell', 'md', 'mdc', 'yaml'],
        },
      },
    },
  },
  css: ['~/assets/content-code.css'],
  unocss: {
    presets: [presetWind4(), presetFluere() as Preset],
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
      title: 'FluereVue',
      link: [{ rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
    },
  },
})
