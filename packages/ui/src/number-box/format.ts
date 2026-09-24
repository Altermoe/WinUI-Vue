/**
 * NumberBox 的数值格式化（纯函数，无 Vue 依赖）。
 *
 * 对照来源：WinUI 3 / Windows App SDK
 *   src/controls/dev/NumberBox/NumberBox.cpp
 *     - `GetRegionalSettingsAwareDecimalFormatter()`：默认 DecimalFormatter
 *     - `UpdateTextToValue()`：先经 `m_displayRounder.SignificantDigits(10)` 抹掉浮点噪声，
 *       再交给 NumberFormatter 格式化
 *
 * 与 WinUI 的一处有意偏差（已在文档中标注）：
 *   WinUI 的默认 DecimalFormatter 被显式设成 `IntegerDigits(1)` + `FractionDigits(0)`，
 *   在多个 WinAppSDK 版本上会把显示值四舍五入到整数（microsoft/microsoft-ui-xaml#8780：
 *   输入 25.8 失焦后显示 26）。Web 侧缺省不丢小数（`maximumFractionDigits: 20`）——
 *   否则 `step = 0.1` 这类用法在显示层直接不可用；需要整数外观时传
 *   `:format-options="{ maximumFractionDigits: 0 }"` 即可回到 WinUI 的默认观感。
 */
import {
  DISPLAY_SIGNIFICANT_DIGITS,
  MAX_FRACTION_DIGITS,
  MIN_INTEGER_DIGITS,
  NO_FRACTION_DIGITS,
} from './constants'

/** 格式化 / 解析共用的区域设置与选项 */
export interface NumberFormatSettings {
  /** BCP 47 语言标记；缺省跟随运行环境 */
  locale?: string
  /** 对应 WinUI `NumberFormatter` 的格式化选项 */
  formatOptions?: Intl.NumberFormatOptions
}

/**
 * 把消费方传入的 `formatOptions` 补齐成缺省选项：
 * `IntegerDigits(1)` 保留，`FractionDigits(0)` 换成不丢小数的 20 位上限。
 */
export const resolveFormatOptions = (
  formatOptions?: Intl.NumberFormatOptions,
): Intl.NumberFormatOptions => ({
  minimumIntegerDigits: MIN_INTEGER_DIGITS,
  maximumFractionDigits: MAX_FRACTION_DIGITS,
  ...formatOptions,
})

/** 按区域设置与选项创建格式化器（解析符号也走它，保证格式化 / 解析同一套符号） */
export const createNumberFormat = (settings: NumberFormatSettings): Intl.NumberFormat =>
  new Intl.NumberFormat(settings.locale, resolveFormatOptions(settings.formatOptions))

/**
 * WinUI `m_displayRounder.RoundDouble(value)`：舍入到 10 位有效数字。
 * 0.1 + 0.2 这类浮点噪声在这一步被抹平（0.30000000000000004 → 0.3）。
 */
export const roundToDisplayPrecision = (value: number): number =>
  Number.parseFloat(value.toPrecision(DISPLAY_SIGNIFICANT_DIGITS))

/**
 * 值 → 输入框文本。无值（`null` / `NaN`）时返回空串（对应 WinUI 的 `Value == NaN` → `Text == ""`，
 * 此时显示 PlaceholderText）。
 */
export const formatNumberValue = (value: number | null, settings: NumberFormatSettings): string => {
  if (value === null || Number.isNaN(value)) {
    return ''
  }
  return createNumberFormat(settings).format(roundToDisplayPrecision(value))
}

/**
 * 软键盘类型：与 WinUI 的 `InputScope = Number` 对应；
 * 允许小数时用 `decimal`，否则用 `numeric`（与 reka-ui 的判定口径一致）。
 */
export const resolveInputMode = (settings: NumberFormatSettings): 'decimal' | 'numeric' => {
  // ResolvedOptions 一定给出小数位上限；拿不到时按「允许小数」处理
  const maximumFractionDigits =
    createNumberFormat(settings).resolvedOptions().maximumFractionDigits ?? MAX_FRACTION_DIGITS
  return maximumFractionDigits > NO_FRACTION_DIGITS ? 'decimal' : 'numeric'
}
