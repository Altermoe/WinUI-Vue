import { mkdirSync, writeFileSync } from 'node:fs'
/* oxlint-disable import/no-nodejs-modules, id-length, no-magic-numbers, prefer-named-capture-group, curly, no-null, no-continue, prefer-template, capitalized-comments, no-ternary -- 一次性 token 抽取/生成工具脚本，Node 内建模块为有意使用 */
/**
 * 从官方 @fluentui/tokens 重新抽取完整 token 集，重建 data/fluent-tokens.json（唯一事实源）。
 *
 * 用法：node scripts/extract-tokens.mjs
 * 依赖：packages/designs 的 devDependencies 中包含 @fluentui/tokens
 *
 * 说明：fluent-tokens skill 自带的 data/tokens/fluent-tokens.json 只含 184 个核心
 * 语义色 token，缺少 colorStatus* / colorPalette* 等。本脚本按 skill 文档化的重建
 * 路径从 @fluentui/tokens 抽取**完整** webLightTheme / webDarkTheme（459 个 token）
 * 与 typographyStyles，保证 JSON 事实源完整、不丢 token。
 */
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const outFile = join(here, '..', 'data', 'fluent-tokens.json')

const require = createRequire(join(here, '..', 'package.json'))
const pkg = require('@fluentui/tokens/package.json')
const { webLightTheme, webDarkTheme, typographyStyles } = require('@fluentui/tokens')

const light = webLightTheme
const dark = webDarkTheme
const keys = Object.keys(light)

const tokens = {}
for (const key of keys) {
  tokens[key] = { light: light[key], dark: dark[key] }
}

const json = {
  generatedFrom: `@fluentui/tokens@${pkg.version}`,
  version: pkg.version,
  tokenCount: keys.length,
  themeDependentCount: keys.filter((k) => String(light[k]) !== String(dark[k])).length,
  tokens,
  typographyStyles,
}

mkdirSync(dirname(outFile), { recursive: true })
writeFileSync(outFile, JSON.stringify(json, null, 2) + '\n')
console.log(`Wrote ${outFile} (${keys.length} tokens, ${json.themeDependentCount} theme-dependent)`)
