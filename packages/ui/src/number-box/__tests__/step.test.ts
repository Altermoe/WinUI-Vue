/* oxlint-disable no-magic-numbers -- 断言里的字面量就是被测输入与期望值，抽成常量反而更难读 */
import { describe, expect, it } from 'vitest'
import {
  addDecimal,
  clampToBounds,
  coerceValue,
  isSpinButtonDisabled,
  normalizeValue,
  stepValue,
} from '../step'
import type { NumberBoxStepOptions } from '../step'

const options = (overrides: Partial<NumberBoxStepOptions> = {}): NumberBoxStepOptions => ({
  min: 0,
  max: 100,
  wrapEnabled: false,
  validationMode: 'invalidInputOverwritten',
  ...overrides,
})

describe('NumberBox 取值工具', () => {
  it('normalizeValue：null / undefined / NaN 一律归为「无值」', () => {
    expect(normalizeValue(null)).toBeNull()
    expect(normalizeValue(undefined)).toBeNull()
    expect(normalizeValue(Number.NaN)).toBeNull()
    expect(normalizeValue(0)).toBe(0)
    expect(normalizeValue(-3.5)).toBe(-3.5)
  })

  it('addDecimal：十进制加法不产生浮点噪声', () => {
    expect(addDecimal(0.1, 0.2)).toBe(0.3)
    expect(addDecimal(0.25, 0.25)).toBe(0.5)
    expect(addDecimal(1, 2)).toBe(3)
    expect(addDecimal(-0.1, 0.05)).toBe(-0.05)
  })

  it('clampToBounds / coerceValue', () => {
    expect(clampToBounds(-1, 0, 100)).toBe(0)
    expect(clampToBounds(101, 0, 100)).toBe(100)
    expect(coerceValue(101, options())).toBe(100)
    expect(coerceValue(-1, options())).toBe(0)
    // ValidationMode=Disabled：WinUI 的 CoerceValue 不执行，越界值原样保留
    expect(coerceValue(101, options({ validationMode: 'disabled' }))).toBe(101)
  })
})

describe('NumberBox 步进（对齐 WinUI StepValue）', () => {
  it('普通步进 + 钳制到区间', () => {
    expect(stepValue(50, 1, options())).toBe(51)
    expect(stepValue(100, 1, options())).toBe(100)
    expect(stepValue(0, -1, options())).toBe(0)
  })

  it('不做步长吸附（WinUI 是直接相加，不按 step 对齐）', () => {
    expect(stepValue(0.5, 1, options())).toBe(1.5)
  })

  it('无值时步进不产生变化（对应 Value == NaN 提前返回）', () => {
    expect(stepValue(null, 1, options())).toBeNull()
  })

  it('IsWrapEnabled：越界回绕到另一端', () => {
    expect(stepValue(100, 1, options({ wrapEnabled: true }))).toBe(0)
    expect(stepValue(0, -1, options({ wrapEnabled: true }))).toBe(100)
    expect(stepValue(50, 10, options({ wrapEnabled: true }))).toBe(60)
  })

  it('ValidationMode=Disabled：不回绕也不钳制', () => {
    expect(stepValue(100, 1, options({ validationMode: 'disabled' }))).toBe(101)
  })

  it('小数步长保持精确', () => {
    expect(stepValue(0.1, 0.2, options({ min: 0, max: 1 }))).toBe(0.3)
  })
})

describe('NumberBox 增减按钮可用性（对齐 WinUI UpdateSpinButtonEnabled）', () => {
  const base = { ...options(), disabled: false }

  it('无值或整体禁用时两个按钮都禁用', () => {
    expect(isSpinButtonDisabled('increase', null, base)).toBe(true)
    expect(isSpinButtonDisabled('decrease', null, base)).toBe(true)
    expect(isSpinButtonDisabled('increase', 50, { ...base, disabled: true })).toBe(true)
    expect(isSpinButtonDisabled('decrease', 50, { ...base, disabled: true })).toBe(true)
  })

  it('默认口径：到上界禁用「加」、到下界禁用「减」', () => {
    expect(isSpinButtonDisabled('increase', 100, base)).toBe(true)
    expect(isSpinButtonDisabled('decrease', 100, base)).toBe(false)
    expect(isSpinButtonDisabled('increase', 0, base)).toBe(false)
    expect(isSpinButtonDisabled('decrease', 0, base)).toBe(true)
  })

  it('回绕开启，或校验模式为 disabled 时两个按钮始终可用', () => {
    expect(isSpinButtonDisabled('increase', 100, { ...base, wrapEnabled: true })).toBe(false)
    expect(isSpinButtonDisabled('decrease', 0, { ...base, wrapEnabled: true })).toBe(false)
    const custom = { ...base, validationMode: 'disabled' as const }
    expect(isSpinButtonDisabled('increase', 100, custom)).toBe(false)
    expect(isSpinButtonDisabled('decrease', 0, custom)).toBe(false)
  })
})
