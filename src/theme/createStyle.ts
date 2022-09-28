import { kebabCase } from 'lodash'
import type { ThemeColor } from '.'

export const createStyle = (theme: ThemeColor) => {
  const cssRules: string[] = []

  for (const type in theme) {
    for (const name in theme[type])
      cssRules.push(`--win-${type}-${kebabCase(name)}: ${theme[type][name]}`)
  }

  const cssRuleStr = `html { ${cssRules.join(';\n')} }`

  return cssRuleStr
}
