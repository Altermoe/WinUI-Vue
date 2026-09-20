/**
 * 主题键名规范化工具
 *
 * UnoCSS（preset-wind4）的颜色/尺寸等 utility 在解析主题键时，
 * 使用 kebab-case（用 `-` 分隔）进行匹配，例如 `bg-brand-background-hover`
 * 会按 `["brand", "background", "hover"]` 去 theme.colors 中查找。
 *
 * 而 Fluent Design 的令牌命名是驼峰式（camelCase），
 * 如 `colorBrandBackgroundHover`，对应的主题键名也是 `backgroundHover`。
 *
 * 此模块提供工具函数，将驼峰主题对象递归转换为 kebab-case，
 * 确保 UnoCSS 能正确识别并生成对应的 utility。
 */

/**
 * 驼峰 → 连字符分隔
 *
 * 示例：
 *   `foregroundOnBrand` → `foreground-on-brand`
 *   `backgroundHover` → `background-hover`
 *   `stroke1` → `stroke-1`
 */
export function kebabify(str: string): string {
  return str
    // 数字前插入连字符：stroke1 → stroke-1
    .replace(/([a-z])(\d)/g, '$1-$2')
    // 大写字母前插入连字符：backgroundHover → background-hover
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .toLowerCase()
}

/**
 * 递归地将对象的所有键转换为 kebab-case
 *
 * 对嵌套对象也做同样处理。数组值原样保留。
 */
export function kebabifyKeys<T extends Record<string, any>>(obj: T): Record<string, any> {
  const result: Record<string, any> = {}
  for (const [key, value] of Object.entries(obj)) {
    const newKey = kebabify(key)
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      result[newKey] = kebabifyKeys(value)
    } else {
      result[newKey] = value
    }
  }
  return result
}
