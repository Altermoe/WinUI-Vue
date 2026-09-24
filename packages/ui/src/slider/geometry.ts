/**
 * Slider 的轨道几何（纯函数，无 Vue 依赖）。
 *
 * 把「取值域 → 刻度分布 → 刻度条显隐 → 模板要绑的 CSS 自定义属性」一次性投影成
 * 可直接单测的函数；组件只负责把 props 传进来、把结果绑到模板上。
 *
 * 对照来源：WinUI 3 / Windows App SDK
 *   controls/dev/CommonStyles/Slider_themeresources.xaml（Top/Bottom/Inline TickBar 与宿主尺寸）
 *   dxaml/xcp/dxaml/lib/Slider_Partial.cpp（UpdateTrackLayout / MoveThumbToPoint 的取值口径）
 */
import {
  EMPTY_RANGE,
  FIRST_TICK_INDEX,
  PERCENT_MAX,
  TICK_COUNT_LIMIT,
  TICK_EPSILON,
  TICK_INDEX_STEP,
} from './constants'
import type { FluereSliderOrientation, FluereSliderTickPlacement } from './types'

/** 刻度分布入参（组件把 props 直接摊进来） */
export interface SliderTickOptions {
  min: number
  max: number
  tickFrequency: number
  tickPlacement: FluereSliderTickPlacement
}

/** 三条 TickBar 的显隐（WinUI 模板里的 Inline / Top / Bottom） */
export interface SliderTickBars {
  /** HorizontalInlineTickBar：画在轨道内 */
  inline: boolean
  /** TopTickBar：横向在轨道上方、纵向在轨道左侧 */
  top: boolean
  /** BottomTickBar：横向在轨道下方、纵向在轨道右侧 */
  bottom: boolean
}

/** 宿主样式：纵向长度走 --fui-slider-length；横向由布局撑满，不额外给样式 */
export type SliderHostStyle = Record<string, string> | undefined

/**
 * 刻度线的位置（百分比数组，含首尾端点）。
 *
 * 与 WinUI 一致：TickPlacement=none 或 TickFrequency ≤ 0 都不画刻度；
 * 数量超过 TICK_COUNT_LIMIT 时整体放弃（极小的 tickFrequency 不该渲染出上万节点）。
 */
export const getTickPercents = ({
  min,
  max,
  tickFrequency,
  tickPlacement,
}: SliderTickOptions): number[] => {
  const range = max - min
  if (tickPlacement === 'none' || tickFrequency <= EMPTY_RANGE || range <= EMPTY_RANGE) {
    return []
  }

  const count = Math.floor(range / tickFrequency + TICK_EPSILON)
  if (count < TICK_INDEX_STEP || count + TICK_INDEX_STEP > TICK_COUNT_LIMIT) {
    return []
  }

  const percents: number[] = []
  for (let index = FIRST_TICK_INDEX; index <= count; index += TICK_INDEX_STEP) {
    percents.push(((index * tickFrequency) / range) * PERCENT_MAX)
  }
  return percents
}

/**
 * 刻度条显隐矩阵（对应 WinUI 的 TickPlacement 语义）：
 * outside 两侧都画、top-left / bottom-right 单侧、inline 只画轨道内；
 * 没有刻度线时三条都不画。
 */
export const getTickBars = (
  tickPlacement: FluereSliderTickPlacement,
  tickPercents: readonly number[],
): SliderTickBars => {
  const hasTicks = tickPercents.length > FIRST_TICK_INDEX
  return {
    inline: hasTicks && tickPlacement === 'inline',
    top: hasTicks && (tickPlacement === 'outside' || tickPlacement === 'top-left'),
    bottom: hasTicks && (tickPlacement === 'outside' || tickPlacement === 'bottom-right'),
  }
}

/** 单条刻度线的样式：位置交给 --fui-slider-tick（横向左移 / 纵向上移都由 CSS 决定） */
export const getTickStyle = (percent: number): Record<string, string> => ({
  '--fui-slider-tick': `${percent}%`,
})

/** 宿主样式：纵向给出长度；横向返回 undefined（不产生多余的内联样式） */
export const getHostStyle = (
  orientation: FluereSliderOrientation,
  verticalLength: number,
): SliderHostStyle =>
  orientation === 'vertical' ? { '--fui-slider-length': `${verticalLength}px` } : undefined
