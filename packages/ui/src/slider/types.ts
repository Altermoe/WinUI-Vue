/**
 * FluereSlider 公共类型契约
 *
 * 设计规范来源：WinUI 3 / Windows App SDK — Slider
 * （controls/dev/CommonStyles/Slider_themeresources.xaml 提供几何与资源名，
 *   dxaml/xcp/dxaml/lib/Slider_Partial.cpp、Thumb_Partial.cpp 提供交互与取值口径）
 *
 * 类型与 Props 说明集中在这一层：slider.vue 只做组合，
 * 逻辑层（constants / geometry / disambiguation / use-slider-*）反向依赖本文件，
 * 避免逻辑模块从 .vue 反向导入类型。
 */
import type { Direction } from 'reka-ui'

/** 方向（对应 WinUI Slider.Orientation） */
export type FluereSliderOrientation = 'horizontal' | 'vertical'

/**
 * 刻度线位置（对应 WinUI Slider.TickPlacement）
 * - none        不画刻度（WinUI 默认）
 * - inline      画在轨道内（TickPlacement=Inline）
 * - outside     轨道两侧都画（TickPlacement=Outside）
 * - top-left    WinUI TopLeft：横向在轨道上方 / 纵向在轨道左侧
 * - bottom-right WinUI BottomRight：横向在轨道下方 / 纵向在轨道右侧
 */
export type FluereSliderTickPlacement = 'none' | 'inline' | 'outside' | 'top-left' | 'bottom-right'

export interface FluereSliderProps {
  /**
   * 当前值（v-model）。缺省时组件走非受控模式（见 defaultValue）。
   */
  modelValue?: number

  /**
   * 非受控初始值，缺省落到 min（对应 WinUI Slider.Value 默认 = Minimum）
   */
  defaultValue?: number

  /**
   * 最小值（对应 WinUI RangeBase.Minimum）
   * @default 0
   */
  min?: number

  /**
   * 最大值（对应 WinUI RangeBase.Maximum）
   * @default 100
   */
  max?: number

  /**
   * 步进（对应 WinUI Slider.StepFrequency）
   * @default 1
   */
  step?: number

  /**
   * 是否禁用
   * @default false
   */
  disabled?: boolean

  /**
   * 方向（对应 WinUI Slider.Orientation）
   * @default 'horizontal'
   */
  orientation?: FluereSliderOrientation

  /**
   * 反向：横向时最大值在左，纵向时最大值在下（对应 WinUI Slider.IsDirectionReversed）
   * @default false
   */
  inverted?: boolean

  /**
   * 顶部标题（对应 WinUI Slider.Header）。同时作为缺省的可访问名。
   */
  header?: string

  /**
   * 可访问名称（缺省依次回落到 header 文本、#header 插槽）
   */
  label?: string

  /**
   * 表单提交名：位于 <form> 内时补隐藏原生 input，提交 `name=value`。
   * （reka 的隐藏 input 会把数组值摊平成 `name[0]`，这里自渲染以保证提交名可预期）
   */
  name?: string

  /**
   * 阅读方向（一般无需设置，由 ConfigProvider / LTR 推断）
   */
  dir?: Direction

  /**
   * 是否显示数值提示（对应 WinUI Slider.IsThumbToolTipEnabled）
   * @default true
   */
  tooltip?: boolean

  /**
   * 刻度线位置（对应 WinUI Slider.TickPlacement）
   * @default 'none'
   */
  tickPlacement?: FluereSliderTickPlacement

  /**
   * 刻度间隔（对应 WinUI Slider.TickFrequency）。
   * 与 WinUI 一致：为 0 时不画刻度线。
   * @default 0
   */
  tickFrequency?: number

  /**
   * 纵向时的控件长度（px）。横向固定 32px（WinUI SliderHorizontalHeight）
   * @default 200
   */
  verticalLength?: number
}
