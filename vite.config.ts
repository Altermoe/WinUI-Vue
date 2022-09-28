import { resolve } from 'path'
import { defineConfig } from 'vite'
import Vue from '@vitejs/plugin-vue'
import VueJsx from '@vitejs/plugin-vue-jsx'
import AutoImport from 'unplugin-auto-import/vite'

export default defineConfig((/** context */) => {
  return {
    root: __dirname,

    envDir: resolve(__dirname, './env'),

    resolve: {
      alias: [
        {
          find: /^@\//,
          replacement: `${resolve(__dirname, './src')}/`,
        },
      ],
    },

    build: {
      lib: {
        entry: resolve(__dirname, './src/index.ts'),
        name: 'WinUI-Vue',
        fileName: 'winui-vue',
      },
      rollupOptions: {
        external: ['vue'],
        output: {
          globals: {
            vue: 'Vue',
          },
        },
      },
    },

    esbuild: {
      jsxFactory: 'h',
      jsxFragment: 'Fragment',
    },

    plugins: [
      Vue(),
      VueJsx(),
      AutoImport({
        imports: ['vue', '@vueuse/core'],
        dts: resolve(__dirname, './auto-import.d.ts'),
      }),
    ],
  }
})
