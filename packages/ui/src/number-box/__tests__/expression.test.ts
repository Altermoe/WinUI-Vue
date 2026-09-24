/* oxlint-disable no-magic-numbers -- 断言里的字面量就是被测输入与期望值，抽成常量反而更难读 */
import { describe, expect, it } from 'vitest'
import { evaluateExpression } from '../expression'

describe('NumberBox 内联表达式（逐行对齐 WinUI NumberBoxParser）', () => {
  it('四则运算与标准优先级', () => {
    expect(evaluateExpression('1+2', {})).toBe(3)
    expect(evaluateExpression('1+2*3', {})).toBe(7)
    expect(evaluateExpression('10-4/2', {})).toBe(8)
  })

  it('括号覆盖优先级', () => {
    expect(evaluateExpression('(1+2)*3', {})).toBe(9)
    expect(evaluateExpression('((2))', {})).toBe(2)
  })

  it('幂运算：优先级最高，且同级左结合（与 WinUI 的调度场实现一致）', () => {
    expect(evaluateExpression('2^3', {})).toBe(8)
    expect(evaluateExpression('2*2^3', {})).toBe(16)
    expect(evaluateExpression('2^3^2', {})).toBe(64)
  })

  it('一元负号被并入数字字面量', () => {
    expect(evaluateExpression('-3+2', {})).toBe(-1)
    expect(evaluateExpression('3+-2', {})).toBe(1)
    expect(evaluateExpression('2*-3', {})).toBe(-6)
  })

  it('空格被忽略', () => {
    expect(evaluateExpression('1 + 2 * 3', {})).toBe(7)
  })

  it('除以 0 得 NaN（WinUI 返回值为 NaN 的引用，调用方据此清空值）', () => {
    expect(evaluateExpression('1/0', {})).toBeNaN()
  })

  it('数字字面量按区域设置解析', () => {
    expect(evaluateExpression('1,5*2', { locale: 'de-DE' })).toBe(3)
    expect(evaluateExpression('1.5*2', { locale: 'en-US' })).toBe(3)
  })

  it('求值失败返回 null', () => {
    for (const expression of ['abc', '1+', '+1', '(1+2', '1+2)', '()', '', '1 2', '1+*2']) {
      expect(evaluateExpression(expression, {})).toBeNull()
    }
  })
})
