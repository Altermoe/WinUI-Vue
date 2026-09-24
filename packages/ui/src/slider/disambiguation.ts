/**
 * Slider 的数值提示文本口径（WinUI Disambiguation UI）。
 *
 * 对照来源：WinUI 3 / Windows App SDK
 *   src/dxaml/xcp/dxaml/lib/Slider_Partial.cpp（把 Disambiguation UI 挂到 Thumb 上）
 *   DefaultDisambiguationUIConverter：按 StepFrequency 的小数位格式化，最多 4 位。
 *
 * 纯函数，无 Vue 依赖，可直接单测。
 */
import {
  DECIMAL_POINT_LENGTH,
  INDEX_NOT_FOUND,
  TOOLTIP_MAX_DECIMALS,
  TOOLTIP_MIN_DECIMALS,
} from './constants'

/** 由 step 推出的小数位数（0 .. TOOLTIP_MAX_DECIMALS） */
export const getValueDecimals = (step: number): number => {
  const raw = String(step)
  const dot = raw.indexOf('.')
  return dot === INDEX_NOT_FOUND
    ? TOOLTIP_MIN_DECIMALS
    : Math.min(raw.length - dot - DECIMAL_POINT_LENGTH, TOOLTIP_MAX_DECIMALS)
}

/** 数值提示文本：与 WinUI 的转换器同口径 */
export const formatValueText = (value: number, step: number): string =>
  value.toFixed(getValueDecimals(step))
