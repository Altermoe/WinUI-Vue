/**
 * NumberBox 的文本 → 数值解析（纯函数，无 Vue 依赖）。
 *
 * 对照来源：WinUI 3 / Windows App SDK
 *   src/controls/dev/NumberBox/NumberBox.cpp
 *     - `ValidateInput()`：先 `trim`，空串 → `Value = NaN`；否则 `NumberFormatter.ParseDouble(text)`
 *     - 解析失败时保留 `Value`，由 `ValidationMode` 决定是否用当前值的文本覆盖输入
 *
 * 与 WinUI 的差异：WinUI 把解析完全交给区域设置感知的 `DecimalFormatter.ParseDouble`；
 * Web 侧用同一套 `Intl` 选项先取出该区域设置的小数点 / 分组分隔符 / 负号，再归一化后解析，
 * 因此「格式化用什么符号，解析就认什么符号」。
 *
 * 额外宽容度（不影响既有用例）：
 *   - 数字内部的所有空白与分组分隔符都会被忽略（`1 234` / `1,234` 都能解析）
 *   - 接受 `+` 前缀与科学计数法（`1e3`）
 */
import { createNumberFormat } from './format'
import type { NumberFormatSettings } from './format'

/** 各种「像减号」的字符（U+2212 真减号、各种连字符、全角减号…）统一成 ASCII `-` */
const OTHER_MINUS_SIGNS = /[\u2212\u2010\u2011\u2012\u2013\u2014\uFE63\uFF0D]/g

/** 数字内部的空白（含不换行空格与窄不换行空格） */
const INNER_WHITESPACE = /[\s\u00A0\u202F\uFEFF]/g

/** 归一化后的十进制字面量（可带符号与科学计数法） */
const DECIMAL_LITERAL = /^[+-]?(?<digits>\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/

/** 用于探测符号的样本值（含小数与分组，一次 `formatToParts` 即可取全三种符号） */
const SAMPLE_VALUE = -12_345.6

/** 兜底符号：万一格式化器不产出某一类 part，退回 en-US 的符号 */
const FALLBACK_SYMBOLS = { decimal: '.', group: ',', minusSign: '-' }

/** 解析结果：空文本 / 合法数值 / 非法文本（对应用户乱输或表达式求值失败） */
export type NumberParseResult =
  | { status: 'empty' }
  | { status: 'valid'; value: number }
  | { status: 'invalid' }

/** 当前区域设置下的数字符号 */
export interface NumberSymbols {
  /** 小数点，如 en-US 的 `.`、de-DE 的 `,` */
  decimal: string
  /** 分组分隔符，如 en-US 的 `,`、fr-FR 的窄不换行空格 */
  group: string
  /** 负号 */
  minusSign: string
}

/**
 * 取出当前区域设置与选项下的数字符号。
 * 与格式化器共用同一份选项，保证「显示成什么样，就认什么样」。
 */
export const resolveNumberSymbols = (settings: NumberFormatSettings): NumberSymbols => {
  const parts = createNumberFormat(settings).formatToParts(SAMPLE_VALUE)
  const findPart = (type: Intl.NumberFormatPartTypes): string | undefined =>
    parts.find((part) => part.type === type)?.value

  return {
    decimal: findPart('decimal') ?? FALLBACK_SYMBOLS.decimal,
    group: findPart('group') ?? FALLBACK_SYMBOLS.group,
    minusSign: findPart('minusSign') ?? FALLBACK_SYMBOLS.minusSign,
  }
}

/**
 * 文本 → 数值。
 *
 * 与 WinUI 一致：空文本（trim 后）返回 `empty`（调用方据此把值置空，对应 `Value = NaN`）。
 */
export const parseNumberText = (
  text: string,
  settings: NumberFormatSettings,
): NumberParseResult => {
  const trimmed = text.trim()
  if (trimmed === '') {
    return { status: 'empty' }
  }

  const { decimal, group, minusSign } = resolveNumberSymbols(settings)
  let normalized = trimmed.replace(INNER_WHITESPACE, '')
  if (group !== '') {
    normalized = normalized.split(group).join('')
  }
  normalized = normalized.replace(OTHER_MINUS_SIGNS, FALLBACK_SYMBOLS.minusSign)
  if (minusSign !== FALLBACK_SYMBOLS.minusSign) {
    normalized = normalized.split(minusSign).join(FALLBACK_SYMBOLS.minusSign)
  }
  if (decimal !== FALLBACK_SYMBOLS.decimal) {
    normalized = normalized.split(decimal).join(FALLBACK_SYMBOLS.decimal)
  }

  if (!DECIMAL_LITERAL.test(normalized)) {
    return { status: 'invalid' }
  }
  const value = Number(normalized)
  return Number.isNaN(value) ? { status: 'invalid' } : { status: 'valid', value }
}
