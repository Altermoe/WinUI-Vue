import { kebabCase } from 'lodash'
import type { ThemeColor } from '.'

type Key = keyof ThemeColor
type Theme = ThemeColor[Key]

export const createStyle = (theme: ThemeColor) => {
  const cssRules: string[] = []

  for (const type in theme) {
    for (const name in theme[type as keyof ThemeColor])
      cssRules.push(`--win-${type}-${kebabCase(name)}: ${theme[type as keyof ThemeColor][name as keyof Theme]}`)
  }

  const cssRuleStr = `html { ${cssRules.join(';\n')} }`

  return cssRuleStr
}
