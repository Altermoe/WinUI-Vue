import { resolve } from 'path'
import { defineConfig } from 'vite'
import Vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'

export default defineConfig(() => {
  return {
    plugins: [
      Vue(),
      AutoImport({
        imports: ['vue', '@vueuse/core'],
        dts: resolve(__dirname, '../auto-import.d.ts'),
      }),
    ],
  }
})
