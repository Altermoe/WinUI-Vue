import type { Preset } from 'unocss'
import buttonPreset from './button/button.uno'

/**
 * Fluent UI 组件库统一 UnoCSS preset
 *
 * 汇总所有组件的样式 preset，在 uno.config.ts 中引入后即可使用全部组件的语义化类名。
 *
 * 使用方式：
 * ```ts
 * import { defineConfig, presetWind4 } from 'unocss'
 * import { presetFluent } from '@fluentui-vue/themes'
 * import { presetFluentUi } from '@fluentui-vue/ui/preset'
 *
 * export default defineConfig({
 *   presets: [presetWind4(), presetFluent(), presetFluentUi()],
 * })
 * ```
 */
const presetFluentUi = (): Preset => ({
  name: 'unocss-preset-fluent-ui',
  presets: [buttonPreset],
})

export default presetFluentUi
