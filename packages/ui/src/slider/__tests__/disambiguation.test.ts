/* oxlint-disable no-magic-numbers -- 纯函数用例：小数位与步进本身就是要断言的数字 */
/**
 * 数值提示文本：WinUI DefaultDisambiguationUIConverter 的口径。
 */

import { describe, expect, it } from 'vitest'
import { formatValueText, getValueDecimals } from '../disambiguation'

describe('getValueDecimals（按 StepFrequency 定小数位）', () => {
  it('整数步进保留 0 位', () => {
    expect(getValueDecimals(1)).toBe(0)
    expect(getValueDecimals(50)).toBe(0)
  })

  it('按步进本身的小数位', () => {
    expect(getValueDecimals(0.1)).toBe(1)
    expect(getValueDecimals(0.25)).toBe(2)
    expect(getValueDecimals(0.125)).toBe(3)
  })

  it('超过 4 位一律截到 4 位（WinUI 转换器的上限）', () => {
    expect(getValueDecimals(0.0001)).toBe(4)
    expect(getValueDecimals(0.00001)).toBe(4)
  })
})

describe('formatValueText', () => {
  it('按步进的小数位补零', () => {
    expect(formatValueText(30, 1)).toBe('30')
    expect(formatValueText(0.25, 0.25)).toBe('0.25')
    expect(formatValueText(0.5, 0.25)).toBe('0.50')
  })

  it('整数步进下四舍五入到整数', () => {
    expect(formatValueText(30.4, 1)).toBe('30')
    expect(formatValueText(30.6, 1)).toBe('31')
  })

  it('小数步进下按步进位数舍入', () => {
    expect(formatValueText(0.3333, 0.01)).toBe('0.33')
    expect(formatValueText(0.336, 0.01)).toBe('0.34')
  })

  it('负值同样按步进位数格式化（区间可以为负）', () => {
    expect(formatValueText(-2.5, 0.5)).toBe('-2.5')
  })
})
