import { defineConfig, presetWind4 } from 'unocss'
import { presetFluent } from '@fluentui-vue/themes'
import presetFluentUi from './src/preset'

export default defineConfig({
  presets: [
    presetWind4(),
    presetFluent(),
    presetFluentUi(),
  ],
  content: {
    pipeline: {
      include: [
        /\.(vue|svelte|[jt]sx|mdx?|astro|elm|php|phtml|html)($|\?)/,
        'src/**/*.{js,ts,vue}',
      ],
    },
  },
})
