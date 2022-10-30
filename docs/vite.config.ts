import { resolve } from 'path'
import { defineConfig } from 'vite'
import Vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'

export default defineConfig(() => {
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
      host: '0.0.0.0',
      port: 60755,
    },

    preview: {
      host: '0.0.0.0',
      port: 60755,
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
