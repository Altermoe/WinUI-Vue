/**
 * NumberBox 的取值 / 步进 / 按钮可用性（纯函数，无 Vue 依赖）。
 *
 * 对照来源：WinUI 3 / Windows App SDK `src/controls/dev/NumberBox/NumberBox.cpp`
 *   - `Value` / `CoerceValue`：越界时按 `ValidationMode` 决定是否拉回区间
 *   - `StepValue`：`Value += change`，`IsWrapEnabled` 时越界回绕，
 *     最后经 `CoerceValue`（即只有 InvalidInputOverwritten 才钳制）
 *   - `UpdateSpinButtonEnabled`：值越界前的按钮禁用口径
 *
 * 与 WinUI 的差异（有意）：WinUI 直接做双精度加法，`0.1 + 0.2` 会留下
 * 0.30000000000000004 这样的浮点噪声；这里改用十进制定点加法，值域表现与 WinUI 一致但更干净。
 * 显示层另有 WinUI 的 10 位有效数字舍入（见 format.ts）兜底。
 */
import { INDEX_NOT_FOUND, MAX_DECIMAL_DIGITS, NO_FRACTION_DIGITS } from './constants'
import type { FluereNumberBoxValidationMode } from './types'

/** 十进制的底（把小数位换算成整数运算的放大倍数） */
const DECIMAL_BASE = 10
/** 小数点下标 → 小数位数的偏移量（`length - dot - 1`） */
const FRACTION_OFFSET = 1

/** 十进制字面量的小数位数（指数形式返回 0，交由普通加法处理） */
const fractionLength = (text: string): number => {
  const dot = text.indexOf('.')
  return dot === INDEX_NOT_FOUND ? NO_FRACTION_DIGITS : text.length - dot - FRACTION_OFFSET
}

const hasExponent = (text: string): boolean => text.includes('e') || text.includes('E')

/** 步进 / 钳制所需的取值口径 */
export interface NumberBoxStepOptions {
  /** 已解析的最小值（缺省为 -Number.MAX_VALUE） */
  min: number
  /** 已解析的最大值（缺省为 Number.MAX_VALUE） */
  max: number
  /** 是否回绕（对应 WinUI `IsWrapEnabled`） */
  wrapEnabled: boolean
  /** 校验模式（对应 WinUI `ValidationMode`） */
  validationMode: FluereNumberBoxValidationMode
}

/** 增减方向 */
export type NumberBoxSpinDirection = 'increase' | 'decrease'

/** 对外值 → 内部值：`undefined` / `null` / `NaN` 一律归为「无值」 */
export const normalizeValue = (value: number | null | undefined): number | null => {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return null
  }
  return value
}

/**
 * 浮点安全的十进制加法：`0.1 + 0.2 === 0.3`。
 * 整数或指数形式直接相加（后者由显示层的有效数字舍入兜底）。
 */
export const addDecimal = (left: number, right: number): number => {
  if (Number.isInteger(left) && Number.isInteger(right)) {
    return left + right
  }
  const leftText = String(left)
  const rightText = String(right)
  if (hasExponent(leftText) || hasExponent(rightText)) {
    return left + right
  }
  const digits = Math.max(fractionLength(leftText), fractionLength(rightText))
  if (digits === NO_FRACTION_DIGITS || digits > MAX_DECIMAL_DIGITS) {
    return left + right
  }
  const factor = DECIMAL_BASE ** digits
  return (Math.round(left * factor) + Math.round(right * factor)) / factor
}

/** 钳制到 `[min, max]` */
export const clampToBounds = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max)

/**
 * WinUI `CoerceValue`：只有 `ValidationMode = InvalidInputOverwritten` 才钳制越界值；
 * `disabled` 模式保留用户输入的越界值，交给消费方自行校验。
 */
export const coerceValue = (value: number, options: NumberBoxStepOptions): number =>
  options.validationMode === 'disabled' ? value : clampToBounds(value, options.min, options.max)

/**
 * 步进一次（对应 WinUI `StepValue(change)`）。
 *
 * @returns 新值；当前无值（WinUI 的 `NaN`）时返回 `null` 表示不步进
 */
export const stepValue = (
  current: number | null,
  change: number,
  options: NumberBoxStepOptions,
): number | null => {
  const base = normalizeValue(current)
  if (base === null) {
    return null
  }

  let next = addDecimal(base, change)
  if (options.wrapEnabled) {
    if (next > options.max) {
      next = options.min
    } else if (next < options.min) {
      next = options.max
    }
  }
  return coerceValue(next, options)
}

/**
 * 单个增减按钮是否禁用（对应 WinUI `UpdateSpinButtonEnabled`）：
 * - 无值 → 两个都禁用
 * - 回绕开启，或校验模式为 `disabled` → 两个都可用
 * - 否则到上界禁用「加」、到下界禁用「减」
 */
export const isSpinButtonDisabled = (
  direction: NumberBoxSpinDirection,
  value: number | null,
  options: NumberBoxStepOptions & { disabled: boolean },
): boolean => {
  const base = normalizeValue(value)
  if (options.disabled || base === null) {
    return true
  }
  if (options.wrapEnabled || options.validationMode !== 'invalidInputOverwritten') {
    return false
  }
  return direction === 'increase' ? base >= options.max : base <= options.min
}
