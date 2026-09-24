import { describe, expect, it } from 'vitest'
import { parseNumberText, resolveNumberSymbols } from '../parse'

describe('NumberBox 解析（对齐 WinUI ValidateInput 的 NumberFormatter.ParseDouble）', () => {
  it('空文本（含仅空白）→ empty，调用方据此把值置空', () => {
    expect(parseNumberText('', { locale: 'en-US' })).toEqual({ status: 'empty' })
    expect(parseNumberText('   ', { locale: 'en-US' })).toEqual({ status: 'empty' })
    expect(parseNumberText('\t\n', { locale: 'en-US' })).toEqual({ status: 'empty' })
  })

  it('基本十进制：整数 / 小数 / 省略整数位 / 省略小数位 / 正负号', () => {
    expect(parseNumberText('12', {})).toEqual({ status: 'valid', value: 12 })
    expect(parseNumberText('-3.5', {})).toEqual({ status: 'valid', value: -3.5 })
    expect(parseNumberText('.5', {})).toEqual({ status: 'valid', value: 0.5 })
    expect(parseNumberText('5.', {})).toEqual({ status: 'valid', value: 5 })
    expect(parseNumberText('+7', {})).toEqual({ status: 'valid', value: 7 })
  })

  it('忽略数字内部的分组分隔符与空白（1,234 / 1 234 都能解析）', () => {
    expect(parseNumberText('1,234', { locale: 'en-US' })).toEqual({ status: 'valid', value: 1234 })
    expect(parseNumberText('1 234', { locale: 'en-US' })).toEqual({ status: 'valid', value: 1234 })
    expect(parseNumberText('1\u00A0234,5', { locale: 'fr-FR' })).toEqual({
      status: 'valid',
      value: 1234.5,
    })
  })

  it('区域设置：de-DE 的逗号是小数点、点是分组分隔符', () => {
    expect(parseNumberText('1.234,5', { locale: 'de-DE' })).toEqual({
      status: 'valid',
      value: 1234.5,
    })
    expect(parseNumberText('1,5', { locale: 'de-DE' })).toEqual({ status: 'valid', value: 1.5 })
    // 与「显示成什么样就认什么样」一致：de-DE 里 "1.5" 的点是分组分隔符
    expect(parseNumberText('1.5', { locale: 'de-DE' })).toEqual({ status: 'valid', value: 15 })
    expect(parseNumberText('1,5', { locale: 'en-US' })).toEqual({ status: 'valid', value: 15 })
  })

  it('各种「像减号」的字符统一成负号', () => {
    expect(parseNumberText('\u22125', {})).toEqual({ status: 'valid', value: -5 })
    expect(parseNumberText('\uFF0D8', {})).toEqual({ status: 'valid', value: -8 })
  })

  it('接受科学计数法（Web 侧扩展，便于输入极大 / 极小的值）', () => {
    expect(parseNumberText('1e3', {})).toEqual({ status: 'valid', value: 1000 })
    expect(parseNumberText('2.5E-2', {})).toEqual({ status: 'valid', value: 0.025 })
  })

  it('非法文本 → invalid', () => {
    for (const text of ['abc', '12abc', '1.2.3', '1,2,3.4.5', '--1', '+-1', '1e', '∞']) {
      expect(parseNumberText(text, { locale: 'en-US' })).toEqual({ status: 'invalid' })
    }
  })

  it('符号探测：小数点 / 分组分隔符 / 负号与格式化器一致', () => {
    expect(resolveNumberSymbols({ locale: 'en-US' })).toEqual({
      decimal: '.',
      group: ',',
      minusSign: '-',
    })
    const german = resolveNumberSymbols({ locale: 'de-DE' })
    expect(german.decimal).toBe(',')
    expect(german.group).toBe('.')
    expect(german.minusSign).toBe('-')
  })
})
