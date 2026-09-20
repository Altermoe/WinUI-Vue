import { webDarkTheme, webLightTheme } from '@fluentui/tokens'
import type { Theme } from '@fluentui/tokens'

/**
 * 在明暗主题之间值不同的 token 前缀
 * 经确认：所有不同值的 token 均以 color 或 shadow 开头
 */
const THEME_DEPENDENT_PREFIXES = ['color', 'shadow'] as const

const isThemeDependent = (key: string): boolean =>
  THEME_DEPENDENT_PREFIXES.some(prefix => key.startsWith(prefix))

/**
 * 生成 Fluent Design 所有 CSS 变量的全局定义
 *
 * - 颜色与阴影 token 使用 CSS 原生 `light-dark()` 函数，
 *   自动响应元素的 `color-scheme` 属性实现明暗主题切换
 * - 非颜色 token（间距、字体、圆角等）在明暗主题下值相同，直接定义为固定值
 *
 * @returns 完整的 `:root { ... }` CSS 字符串
 */
const generateFluentCssVars = (): string => {
  const declarations: string[] = []

  for (const key of Object.keys(webLightTheme) as (keyof Theme)[]) {
    const cssVarName = `--${key}`
    const lightValue = webLightTheme[key]
    const darkValue = webDarkTheme[key]

    if (isThemeDependent(key) && lightValue !== darkValue) {
      declarations.push(`  ${cssVarName}: light-dark(${lightValue}, ${darkValue});`)
    } else {
      declarations.push(`  ${cssVarName}: ${lightValue};`)
    }
  }

  return `:root {\n  color-scheme: light dark;\n${declarations.join('\n')}\n}`
}

export default generateFluentCssVars
