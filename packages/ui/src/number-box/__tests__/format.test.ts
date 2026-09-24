/* oxlint-disable no-magic-numbers -- 断言里的字面量就是被测输入与期望值，抽成常量反而更难读 */
import { describe, expect, it } from 'vitest'
import {
  createNumberFormat,
  formatNumberValue,
  resolveFormatOptions,
  resolveInputMode,
  roundToDisplayPrecision,
} from '../format'

describe('NumberBox 格式化（对齐 WinUI DecimalFormatter + 10 位有效数字舍入）', () => {
  it('缺省选项 = IntegerDigits(1) + 20 位小数上限（Web 侧不跟随 FractionDigits(0)）', () => {
    expect(resolveFormatOptions()).toEqual({
      minimumIntegerDigits: 1,
      maximumFractionDigits: 20,
    })
  })

  it('消费方传入的选项覆盖缺省值', () => {
    expect(resolveFormatOptions({ maximumFractionDigits: 0, useGrouping: false })).toEqual({
      minimumIntegerDigits: 1,
      maximumFractionDigits: 0,
      useGrouping: false,
    })
  })

  it('显示前舍入到 10 位有效数字（对应 m_displayRounder.SignificantDigits(10)）', () => {
    expect(roundToDisplayPrecision(0.1 + 0.2)).toBe(0.3)
    expect(roundToDisplayPrecision(1 / 3)).toBe(0.3333333333)
    expect(roundToDisplayPrecision(12)).toBe(12)
  })

  it('无值 / NaN → 空串（此时显示 PlaceholderText）', () => {
    expect(formatNumberValue(null, { locale: 'en-US' })).toBe('')
    expect(formatNumberValue(Number.NaN, { locale: 'en-US' })).toBe('')
  })

  it('浮点噪声在显示层被抹平', () => {
    expect(formatNumberValue(0.1 + 0.2, { locale: 'en-US' })).toBe('0.3')
  })

  it('按区域设置分组与小数点', () => {
    expect(formatNumberValue(1234.5, { locale: 'en-US' })).toBe('1,234.5')
    expect(formatNumberValue(1234.5, { locale: 'de-DE' })).toBe('1.234,5')
  })

  it('WinUI 的整数观感可经 formatOptions 复现（FractionDigits(0)）', () => {
    expect(formatNumberValue(25.8, { formatOptions: { maximumFractionDigits: 0 } })).toBe('26')
    expect(
      formatNumberValue(25.8, {
        formatOptions: { minimumFractionDigits: 2, maximumFractionDigits: 2 },
      }),
    ).toBe('25.80')
  })

  it('软键盘类型：允许小数用 decimal，只接受整数用 numeric', () => {
    expect(resolveInputMode({})).toBe('decimal')
    expect(resolveInputMode({ formatOptions: { maximumFractionDigits: 0 } })).toBe('numeric')
  })

  it('同一个格式化器同时提供符号（解析与显示同一套）', () => {
    expect(createNumberFormat({ locale: 'de-DE' }).format(1234.5)).toBe('1.234,5')
    expect(createNumberFormat({ locale: 'en-US' }).format(1234.5)).toBe('1,234.5')
  })
})
