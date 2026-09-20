import {
  presetFluere as generatedPresetFluere,
  tokensCssText,
} from '@fluere-vue/designs/preset-fluent'

export type { Theme, BrandVariants } from '@fluentui/tokens'
export type { FluereTokenName } from '@fluere-vue/designs/token-names'

/**
 * Fluent 2 UnoCSS preset。
 *
 * 生成自 `@fluere-vue/designs` 的 `data/fluent-tokens.json`（唯一事实源）：
 * - preflight 注入全部 token CSS 变量（`light-dark()` + `color-scheme`）
 * - `theme.colors` 用精确 token 名（`bg-colorBrandBackground`）
 * - `theme.spacing / borderRadius / duration` 用 `fluent-*` 短别名（`p-fluent-m` 等）
 *
 * 用法：
 * ```ts
 * import { presetFluere } from '@fluere-vue/themes'
 * // uno.config.ts
 * export default defineConfig({
 *   presets: [presetWind4(), presetFluere()],
 * })
 * ```
 */
export { generatedPresetFluere as presetFluere, tokensCssText }
