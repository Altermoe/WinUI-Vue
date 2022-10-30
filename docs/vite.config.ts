import { resolve } from 'path'
import type { CommonServerOptions } from 'vite'
import { defineConfig } from 'vite'
import Vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'

export default defineConfig(() => {
  const commonServerOptions: CommonServerOptions = {
    host: '0.0.0.0',
    port: 60755,
    cors: true,
    headers: {
      'Cross-Origin-Resource-Policy': 'cross-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    },
  }

  return {
    resolve: {
      alias: [
        {
          find: /^@\//,
          replacement: `${resolve(__dirname, '../src')}/`,
        },
      ],
    },

    server: {
      ...commonServerOptions,
    },

    preview: {
      ...commonServerOptions,
    },

    plugins: [
      Vue(),
      AutoImport({
        imports: ['vue', '@vueuse/core', 'vue-router'],
        dts: resolve(__dirname, '../auto-import.d.ts'),
      }),
    ],
  }
})
