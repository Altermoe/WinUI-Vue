import type { PresetFactory } from 'unocss'
import type { Theme } from 'unocss/preset-wind4'
import { colors } from './colors'
import type { FluentColors } from './colors'
import generateFluentCssVars from './css-vars'
import { kebabifyKeys } from './kebabify'
import { duration, easing, typographyStyles, zIndex } from './motion'
import type { FluentTypographyStyles } from './motion'
import {
  borderRadius,
  borderWidth,
  boxShadow,
  fontFamily,
  fontSize,
  fontWeight,
  lineHeight,
  spacing,
  spacingHorizontal,
  spacingVertical,
} from './scales'

/**
 * Fluent Design 主题接口
 *
 * 继承自 UnoCSS preset-wind4 的标准 Theme，
 * 额外声明 Fluent 主题独有的扩展字段。
 */
interface FluentTheme extends Theme {
  /** 水平间距令牌（Fluent 独有） */
  spacingHorizontal: typeof spacingHorizontal
  /** 垂直间距令牌（Fluent 独有） */
  spacingVertical: typeof spacingVertical
  /** 排版样式预设（Fluent 独有） */
  typography: FluentTypographyStyles
  /** 语义化颜色令牌（Fluent 独有结构） */
  colors: FluentColors
  /** 边框宽度令牌（Fluent 独有结构） */
  borderWidth: typeof borderWidth
  /** 过渡曲线令牌（Fluent 独有结构） */
  easing: typeof easing
  /** Z-index 层级令牌（Fluent 独有结构） */
  zIndex: typeof zIndex
}

/**
 * 将 fontSize 与 lineHeight 合并为 UnoCSS text 主题格式
 * 两者键名一致（如 base-100、hero-700 等），直接按 key 配对
 */
const text: Theme['text'] = Object.fromEntries(
  Object.entries(fontSize).map(([key, value]) => [
    key,
    { fontSize: value, lineHeight: lineHeight[key as keyof typeof lineHeight] },
  ]),
) as Theme['text']

/**
 * 基于 @fluentui/tokens 的 UnoCSS 主题配置
 *
 * 使用方式：
 * ```ts
 * // uno.config.ts
 * import { defineConfig, presetWind4 } from 'unocss'
 * import { fluentTheme } from '@fluentui-vue/themes'
 *
 * export default defineConfig({
 *   presets: [presetWind4()],
 *   theme: fluentTheme,
 * })
 * ```
 *
 * 所有颜色值均为 CSS 变量引用（var(--xxx)），
 * 配合 Fluent 主题的 data-color-scheme 属性可自动切换明/暗主题。
 */
const fluentTheme: FluentTheme = {
  // ---- 颜色（键名转为 kebab-case 以匹配 UnoCSS 解析规则）----
  colors: kebabifyKeys(colors) as unknown as FluentColors,

  // ---- 字体 ----
  font: fontFamily,
  text,
  fontWeight,

  // ---- 间距与尺寸 ----
  spacing,
  // 额外暴露水平/垂直间距（UnoCSS 默认只有 spacing，这里作为扩展字段）
  spacingHorizontal,
  spacingVertical,

  // ---- 圆角与边框 ----
  radius: borderRadius,
  borderWidth,

  // ---- 阴影 ----
  shadow: boxShadow,

  // ---- 动画 ----
  // UnoCSS 的 transition-timing-function 读取 theme.transitionTimingFunction
  ease: easing,
  // 同时保留原名，便于在代码中通过 theme.duration 引用
  duration,
  easing,

  // ---- 层级 ----
  zIndex,

  // ---- 排版样式（自定义字段，可在 shortcuts 中引用）----
  typography: typographyStyles,
}

/**
 * 创建一个包含 Fluent Design 主题的 UnoCSS preset
 *
 * 使用方式：
 * ```ts
 * import { defineConfig, presetWind4 } from 'unocss'
 * import { presetFluent } from '@fluentui-vue/themes'
 *
 * export default defineConfig({
 *   presets: [presetWind4(), presetFluent()],
 * })
 * ```
 */
const presetFluent: PresetFactory<FluentTheme> = () => ({
  name: 'unocss-preset-fluent',
  theme: fluentTheme,
  preflights: [
    {
      getCSS: () => generateFluentCssVars(),
      layer: 'base',
    },
  ],
})

// 重新导出子模块，方便按需使用
export {
  borderRadius,
  borderWidth,
  boxShadow,
  fontFamily,
  fontSize,
  fontWeight,
  lineHeight,
  spacing,
  spacingHorizontal,
  spacingVertical,
} from './scales'
export {
  text,
  colors,
  fluentTheme,
  presetFluent,
  generateFluentCssVars,
  type FluentColors,
  type FluentTheme,
}
export { duration, easing, typographyStyles, zIndex } from './motion'
export type { FluentTypographyStyles } from './motion'
