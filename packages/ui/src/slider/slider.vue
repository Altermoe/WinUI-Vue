<script lang="ts">
import type { Direction } from 'reka-ui'

/**
 * 组件级数值常量。
 * 放在普通 <script> 块（模块作用域）里，才能在 <script setup> 的
 * withDefaults() 中被引用 —— defineProps 的默认值会被提升到 setup 之外。
 */

/** 值提示的小数位上限（WinUI DefaultDisambiguationUIConverter 最多保留 4 位） */
const TOOLTIP_MAX_DECIMALS = 4
/** 步进为整数（step=1）时提示保留 0 位小数 */
const TOOLTIP_MIN_DECIMALS = 0
/** String.indexOf 未命中的返回值（小数分隔符不存在） */
const INDEX_NOT_FOUND = -1
/** 小数分隔符自身的长度，用于把「小数点位置」换算成「小数位数」 */
const DECIMAL_POINT_LENGTH = 1
/** 浮点累加误差容忍，用于判定刻度是否落到 max 上 */
const TICK_EPSILON = 1e-9
/** 纵向控件的缺省长度（px）；WinUI 里由布局决定，Web 侧给一个可用缺省值 */
const DEFAULT_VERTICAL_LENGTH = 200
/** 刻度线数量上限：避免 tickFrequency 极小时渲染出成千上万个节点 */
const TICK_COUNT_LIMIT = 200
/** 刻度下标从 0 起、每次 +1 */
const FIRST_TICK_INDEX = 0
const TICK_INDEX_STEP = 1
/** 比例 / 百分比标度：ratio ∈ [0, 1]，percent ∈ [0, 100] */
const RATIO_MIN = 0
const RATIO_MAX = 1
const PERCENT_MAX = 100
/** 值域下界：range ≤ 0 视为无有效值域 */
const EMPTY_RANGE = 0
/** 单值滑块的取值口径：reka 的 modelValue 是数组，固定取第 0 项 */
const SINGLE_THUMB_INDEX = 0

/**
 * FluereSlider 组件 Props 契约
 *
 * 设计规范来源：WinUI 3 / Windows App SDK — Slider
 * （src/controls/dev/CommonStyles/Slider_themeresources.xaml，
 *   几何/动画另对照 src/dxaml/xcp/dxaml/lib/Slider_Partial.cpp 的
 *   UpdateTrackLayout / MoveThumbToPoint / OnThumbDragDelta，
 *   指针归属另对照 src/dxaml/xcp/dxaml/lib/Thumb_Partial.cpp）
 * 交互底座复用 reka-ui 的 SliderRoot：指针拖拽（setPointerCapture）、
 * 步进吸附、Home/End/方向键/PageUp/PageDown、role=slider 语义、表单隐藏 input。
 * 取值一律经 Fluent 2 语义 token 落地（fluent-tokens：data/fluent-tokens.json）
 *
 * 解剖（anatomy，对照 WinUI ControlTemplate）：
 * - host            宿主：header + 控件本体，并跟踪按下/聚焦（值提示的显隐）
 * - header          WinUI HeaderContentPresenter：Margin 0,0,0,4、FontWeight Normal
 * - root (reka)     SliderContainer：整块可交互，ManipulationMode=None → touch-action:none
 * - track (reka)    HorizontalTrackRect：SliderTrackThemeHeight=4、CornerRadius=2
 * - range (reka)    HorizontalDecreaseRect：AccentFillColorDefault 填充
 * - thumb (reka)    Thumb 18×18（SliderHorizontalThumbWidth/Height）
 *     puck          Thumb 模板里的 Border：Margin=-2 → 22×22、
 *                   CornerRadius=10（SliderThumbCornerRadius）、
 *                   填充 ControlSolidFillColorDefault、描边 ControlElevationBorderBrush
 *     dot           Ellipse SliderInnerThumbWidth/Height=12，靠 RenderTransform 缩放
 *
 * 指针归属（决定「按哪里跳值」，对照 Slider_Partial.cpp + Thumb_Partial.cpp）：
 *   按在滑块上 → Thumb 自己 put_Handled(TRUE) 并 IsDragging，按 DragDelta 的相对位移
 *     移动（抓住手感），Slider 收不到 PointerPressed；
 *   按在滑块之外 → Slider::OnPointerPressed → MoveThumbToPoint，把滑块中心挪到指针
 *     处并跳值（getValueFromPointerEvent 的 slideStart 分支与它同口径）。
 *   Web 侧：滑块的可见外圈（puck，22×22）整体都是命中区，命中 thumb 本体时 reka
 *   SliderImpl 只 focus 而不 emit slideStart —— 于是「点中滑块不跳值」自然成立。
 *
 * 尺寸（WinUI 原值，无尺寸变体）：
 *   控件高 32 = SliderPreContentMargin 14 + 轨道 4 + SliderPostContentMargin 14
 *   轨道厚 4 · 轨道圆角 2 · 滑块 18×18（视觉 22×22）· 内点 12（基准）× 0.86
 *   外圈按半宽收敛成真圆（见下方 .fui-slider__puck 处的说明）
 *
 * 内点的三态缩放（Thumb 自己的 VisualState，逐字对齐 Storyboard）：
 *   Normal      0.86（12 × 0.86 = 10.32 —— 与 WinUI 实机截图一致）
 *   PointerOver 1.167（12 → 14）
 *   Pressed     0.71
 *   Disabled    1.167
 * 轨道/数值填充的 hover/pressed 由 Slider 自身的 VisualState 驱动（悬停轨道也会变色），
 * 内点缩放则由 Thumb 自己的指针状态驱动 —— 两者是两套机制，这里用
 * 「root :hover/:active」与「thumb :hover/:active」分别落地。
 *
 * 数值提示（WinUI Disambiguation UI，Slider 在代码里挂到 Thumb 上的 ToolTip）：
 *   按下 / 键盘聚焦时显示，文本按 StepFrequency 的小数位（上限 4 位）格式化。
 *   它是 Slider 的一部分，正式 ToolTip 组件（Wave 3）落地后再统一表面样式。
 *
 * 无障碍：thumb 自带 role=slider + aria-valuenow/min/max + tabindex；
 * 可访问名优先取 label，其次 WinUI Header（对应 GetPlainText 用 Header 当 AutomationName），
 * 再其次由 #header 插槽经 aria-labelledby 关联。
 */
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
</script>

<script setup lang="ts">
import {
  SliderRange as RekaSliderRange,
  SliderRoot as RekaSliderRoot,
  SliderThumb as RekaSliderThumb,
  SliderTrack as RekaSliderTrack,
} from 'reka-ui'
import { computed, getCurrentInstance, ref, useSlots } from 'vue'

const slots = useSlots()
const instance = getCurrentInstance()
const headerId = computed(() => `fui-slider-${instance?.uid ?? 'x'}-header`)

const props = withDefaults(defineProps<FluereSliderProps>(), {
  modelValue: undefined,
  defaultValue: undefined,
  min: 0,
  max: 100,
  step: 1,
  disabled: false,
  orientation: 'horizontal',
  inverted: false,
  header: undefined,
  label: undefined,
  name: undefined,
  dir: undefined,
  tooltip: true,
  tickPlacement: 'none',
  tickFrequency: 0,
  verticalLength: DEFAULT_VERTICAL_LENGTH,
})

const emit = defineEmits<{
  'update:modelValue': [value: number]
  /** 一次交互结束时的最终值（对应 reka 的 valueCommit） */
  'valueCommit': [value: number]
}>()

/** 非受控模式下的本地值（与 reka 的 defaultValue 并行维护，供值提示显示） */
const localValue = ref(props.defaultValue ?? props.min)
const currentValue = computed(() => props.modelValue ?? localValue.value)

/** 受控时把单值包成 reka 需要的数组；非受控时交给 reka 的 defaultValue */
const controlledValue = computed(() =>
  props.modelValue === undefined ? undefined : [props.modelValue],
)
const rootDefaultValue = computed(() => [props.defaultValue ?? props.min])

/** 百分比位置（0..100），与 reka / WinUI 的取值口径一致 */
const percent = computed(() => {
  const range = props.max - props.min
  if (range <= EMPTY_RANGE) {
    return RATIO_MIN
  }
  const ratio = (currentValue.value - props.min) / range
  return Math.min(Math.max(ratio, RATIO_MIN), RATIO_MAX) * PERCENT_MAX
})

/** 值提示文本：小数位 = step 的小数位（上限 4），与 WinUI 的转换器一致 */
const valueText = computed(() => {
  const raw = String(props.step)
  const dot = raw.indexOf('.')
  const decimals =
    dot === INDEX_NOT_FOUND
      ? TOOLTIP_MIN_DECIMALS
      : Math.min(raw.length - dot - DECIMAL_POINT_LENGTH, TOOLTIP_MAX_DECIMALS)
  return currentValue.value.toFixed(decimals)
})

/* ---- 交互状态：按下 / 键盘聚焦（驱动数值提示；按下同时驱动 pressed 配色） ---- */
/*
 * 与 WinUI 一致：数值提示在「按下 / 键盘聚焦」时出现，指针抬起即收起。
 * 指针交互时 reka 也会 focus() 滑块，所以「聚焦」不能直接等同于「键盘聚焦」：
 * pointerdown 在捕获阶段先记下「本次聚焦由指针发起」，focusin 再据此判定。
 */
const pressed = ref(false)
const keyboardFocus = ref(false)
let pointerInitiatedFocus = false
const tooltipVisible = computed(() => props.tooltip && (pressed.value || keyboardFocus.value))

function onHostPointerDownCapture() {
  pointerInitiatedFocus = true
}
function onHostPointerDown() {
  if (!props.disabled) {
    pressed.value = true
    keyboardFocus.value = false
  }
}
function onHostPointerUp() {
  pressed.value = false
  pointerInitiatedFocus = false
}
function onHostKeyDown() {
  if (!props.disabled) {
    keyboardFocus.value = true
  }
}
function onFocusIn() {
  keyboardFocus.value = !pointerInitiatedFocus
}
function onFocusOut() {
  keyboardFocus.value = false
  pointerInitiatedFocus = false
}

function onUpdateModelValue(payload?: number[]) {
  const next = payload?.[SINGLE_THUMB_INDEX]
  if (next === undefined) {
    return
  }
  localValue.value = next
  emit('update:modelValue', next)
}
function onValueCommit(payload: number[]) {
  emit('valueCommit', payload[SINGLE_THUMB_INDEX] ?? props.min)
}

/* ---- 刻度线（WinUI TickBar）：频率 ≤ 0 时不画，与 WinUI 默认 TickFrequency=0 一致 ---- */
const tickPercents = computed(() => {
  const { min, max, tickFrequency } = props
  const range = max - min
  if (props.tickPlacement === 'none' || tickFrequency <= EMPTY_RANGE || range <= EMPTY_RANGE) {
    return []
  }
  const count = Math.floor(range / tickFrequency + TICK_EPSILON)
  if (count < TICK_INDEX_STEP || count + TICK_INDEX_STEP > TICK_COUNT_LIMIT) {
    return []
  }
  const out: number[] = []
  for (let i = FIRST_TICK_INDEX; i <= count; i += TICK_INDEX_STEP) {
    out.push(((i * tickFrequency) / range) * PERCENT_MAX)
  }
  return out
})
const hasTicks = computed(() => tickPercents.value.length > FIRST_TICK_INDEX)
const showInlineTicks = computed(() => hasTicks.value && props.tickPlacement === 'inline')
/** WinUI TopTickBar（纵向时是 LeftTickBar） */
const showTopTicks = computed(
  () => hasTicks.value && (props.tickPlacement === 'outside' || props.tickPlacement === 'top-left'),
)
/** WinUI BottomTickBar（纵向时是 RightTickBar） */
const showBottomTicks = computed(
  () =>
    hasTicks.value && (props.tickPlacement === 'outside' || props.tickPlacement === 'bottom-right'),
)
const tickStyle = (value: number) => ({ '--fui-slider-tick': `${value}%` })

const hostStyle = computed(() =>
  props.orientation === 'vertical'
    ? { '--fui-slider-length': `${props.verticalLength}px` }
    : undefined,
)

/** 可访问名：label > header 文本；只有 #header 插槽时改用 aria-labelledby 关联 */
const ariaLabel = computed(() => props.label ?? props.header)
const ariaLabelledby = computed(() =>
  !ariaLabel.value && slots.header ? headerId.value : undefined,
)

defineOptions({ name: 'FluereSlider' })
</script>

<template>
  <span
    class="fui-slider-host"
    :data-orientation="orientation"
    :data-disabled="disabled ? '' : undefined"
    :data-pressed="pressed ? '' : undefined"
    :style="hostStyle"
    @pointerdown.capture="onHostPointerDownCapture"
    @pointerdown="onHostPointerDown"
    @pointerup="onHostPointerUp"
    @pointercancel="onHostPointerUp"
    @keydown="onHostKeyDown"
    @focusin="onFocusIn"
    @focusout="onFocusOut"
  >
    <!-- 顶部标题：WinUI HeaderContentPresenter（Margin 0,0,0,4 / FontWeight Normal） -->
    <span
      v-if="header || $slots.header"
      :id="headerId"
      class="fui-slider__header"
    >
      <slot name="header">{{ header }}</slot>
    </span>

    <RekaSliderRoot
      class="fui-slider"
      :model-value="controlledValue"
      :default-value="rootDefaultValue"
      :min="min"
      :max="max"
      :step="step"
      :disabled="disabled"
      :orientation="orientation"
      :inverted="inverted"
      :dir="dir"
      @update:model-value="onUpdateModelValue"
      @value-commit="onValueCommit"
    >
      <!-- 轨道外侧刻度（TopTickBar / BottomTickBar；纵向时对应 Left / Right） -->
      <span
        v-if="showTopTicks"
        class="fui-slider__ticks fui-slider__ticks--top"
        aria-hidden="true"
      >
        <span
          v-for="(tick, index) in tickPercents"
          :key="`top-${index}`"
          class="fui-slider__tick"
          :style="tickStyle(tick)"
        />
      </span>
      <span
        v-if="showBottomTicks"
        class="fui-slider__ticks fui-slider__ticks--bottom"
        aria-hidden="true"
      >
        <span
          v-for="(tick, index) in tickPercents"
          :key="`bottom-${index}`"
          class="fui-slider__tick"
          :style="tickStyle(tick)"
        />
      </span>

      <RekaSliderTrack class="fui-slider__track">
        <RekaSliderRange class="fui-slider__range" />
        <!-- 轨道内刻度（InlineTickBar）：压在数值填充之上、滑块之下 -->
        <span
          v-if="showInlineTicks"
          class="fui-slider__ticks fui-slider__ticks--inline"
          aria-hidden="true"
        >
          <span
            v-for="(tick, index) in tickPercents"
            :key="`inline-${index}`"
            class="fui-slider__tick"
            :style="tickStyle(tick)"
          />
        </span>
      </RekaSliderTrack>

      <RekaSliderThumb
        class="fui-slider__thumb"
        :aria-label="ariaLabel"
        :aria-labelledby="ariaLabel ? undefined : ariaLabelledby"
      >
        <!-- WinUI Thumb 模板：Border(Margin=-2) + Ellipse(SliderInnerThumb) -->
        <span class="fui-slider__puck">
          <span class="fui-slider__dot" />
        </span>
        <!-- 数值提示（WinUI Disambiguation UI）：跟随滑块 -->
        <span
          v-if="tooltipVisible"
          class="fui-slider__tip"
          aria-hidden="true"
        >
          {{ valueText }}
        </span>
      </RekaSliderThumb>
    </RekaSliderRoot>

    <!-- 表单提交：位于 <form> 内 + name 时补隐藏原生 input（type=hidden，提交 name=value） -->
    <input
      v-if="name"
      class="fui-slider__input"
      type="hidden"
      :name="name"
      :value="currentValue"
      :disabled="disabled"
    />
  </span>
</template>

<style scoped>
/* ------------------------------------------------------------------ */
/* 所有值均引用 Fluent 语义 token（var(--TokenName)），见 fluent-tokens  */
/* 明暗主题由 tokens.css 的 light-dark() + color-scheme 自动切换        */
/*                                                                     */
/* WinUI 3 对照（Windows App SDK，src/controls/dev/CommonStyles/        */
/* Slider_themeresources.xaml）：                                       */
/*   几何     SliderHorizontalHeight 32 = Pre 14 + 轨道 4 + Post 14     */
/*            SliderTrackThemeHeight 4 / SliderTrackCornerRadius 2      */
/*            SliderHorizontalThumbWidth/Height 18                      */
/*            Thumb 模板 Border Margin=-2 → 视觉 22×22                  */
/*            SliderThumbCornerRadius 10 / SliderInnerThumb 12          */
/*  指针      Slider_Partial.cpp：Thumb 之外的按下 → MoveThumbToPoint   */
/*            跳值（居中于指针）；Thumb 自己的按下被 Thumb_Partial.cpp  */
/*            put_Handled(TRUE) 吃掉 → 只抓取、按 DragDelta 位移改值     */
/*   轨道     SliderTrackFill        = ControlStrongFillColorDefault    */
/*              → colorNeutralStrokeAccessible（…PointerOver/Pressed 同值）*/
/*            SliderTrackFillDisabled= ControlStrongFillColorDisabled   */
/*              → colorNeutralStrokeDisabled                            */
/*   填充     SliderTrackValueFill   = AccentFillColorDefault           */
/*              → colorCompoundBrandBackground（hover/pressed 升档）     */
/*            SliderTrackValueFillDisabled = AccentFillColorDisabled    */
/*              → colorNeutralBackgroundDisabled                        */
/*   滑块     SliderThumbBackground  = AccentFillColor Default/Secondary */
/*              /Tertiary → colorCompoundBrandBackground(/Hover/Pressed) */
/*            SliderThumbBackgroundDisabled = AccentFillColorDisabled   */
/*              → colorNeutralBackgroundDisabled                        */
/*            SliderOuterThumbBackground = ControlSolidFillColorDefault */
/*              → colorNeutralBackground1                               */
/*            SliderThumbBorderBrush = ControlElevationBorderBrush      */
/*              （1px 渐变环：上 ControlStrokeColorDefault(#0F000000)   */
/*                → 下 ControlStrokeColorSecondary(#29000000)）         */
/*              → colorNeutralStrokeAlpha → colorNeutralStroke1         */
/*   标题     SliderHeaderForeground = TextFillColorPrimary/…Disabled   */
/*              → colorNeutralForeground1 / colorNeutralForegroundDisabled */
/*   刻度     SliderTickBarFill       = ControlStrongFillColorDefault   */
/*              → colorNeutralStrokeAccessible（…Disabled 取禁用档）     */
/*            SliderInlineTickBarFill = ControlFillColorInputActive     */
/*              → colorNeutralBackground1（在填充色上「挖」出刻度）       */
/*   容器     SliderContainerBackground* = ControlFillColorTransparent  */
/*              → 背景透明，只露轨道                                     */
/*   focus    WinUI 是 FocusVisualMargin=-7,0 的 外深内浅双矩形；        */
/*            本库统一走 Fluent focus ring（strokeWidthThick +          */
/*            colorCompoundBrandStroke，见 docs/design）                 */
/* 动效：ControlFastAnimationDuration 167ms / ControlNormalAnimation     */
/*   Duration 250ms / ControlFastOutSlowInKeySpline 0,0,0,1             */
/*   → durationFast / durationNormal + curveEasyEaseMax                 */
/*                                                                     */
/* Fluent token 集中没有同值项的 WinUI 原值（沿用本库既有映射）：          */
/*   ControlStrongFillColorDisabled #51000000 → colorNeutralStrokeDisabled */
/*   AccentFillColorDisabled        #37000000 → colorNeutralBackgroundDisabled */
/*   ControlElevationBorderBrush 的 #29000000 → colorNeutralStroke1      */
/* ------------------------------------------------------------------ */

/* ---- 宿主：header + 控件本体 ---- */
.fui-slider-host {
  display: inline-flex;
  flex-direction: column;
  align-items: stretch;
  box-sizing: border-box;
  color: var(--colorNeutralForeground1);
  font-family: var(--fontFamilyBase);
  font-size: var(--fontSizeBase300);
  line-height: var(--lineHeightBase300);
  -webkit-tap-highlight-color: transparent;
}
/* 横向：占满可用宽度（WinUI 的 Slider 在 StackPanel 里也是拉伸的） */
.fui-slider-host[data-orientation='horizontal'] {
  width: 100%;
}
/* 纵向：长度由 --fui-slider-length 决定（WinUI 里由布局决定，Web 侧给缺省值） */
.fui-slider-host[data-orientation='vertical'] {
  height: var(--fui-slider-length);
}

/* ---- 顶部标题：SliderHeaderThemeMargin 0,0,0,4 + Normal 字重 ---- */
.fui-slider-host :deep(.fui-slider__header) {
  margin-block-end: var(--spacingVerticalXS);
  font-weight: var(--fontWeightRegular);
  color: inherit;
}
.fui-slider-host[data-disabled] :deep(.fui-slider__header) {
  color: var(--colorNeutralForegroundDisabled); /* SliderHeaderForegroundDisabled */
}

/* ---- 控件本体（reka root = WinUI SliderContainer） ---- */
.fui-slider-host :deep(.fui-slider) {
  position: relative;
  display: block;
  box-sizing: border-box;
  flex: 1 1 auto;
  min-width: 0;
  /* ManipulationMode="None"：拖拽时不让浏览器抢走手势 */
  touch-action: none;
  cursor: pointer;
  outline: none;
  user-select: none;
}
.fui-slider-host[data-orientation='horizontal'] :deep(.fui-slider) {
  height: 32px; /* SliderHorizontalHeight */
}
.fui-slider-host[data-orientation='vertical'] :deep(.fui-slider) {
  width: 32px; /* SliderVerticalWidth */
  /* 高度交给宿主列方向的 flex-grow（宿主高度 = --fui-slider-length） */
}

/* ---- 轨道：4px 厚、2px 圆角，横向居中；同时是滑块的定位上下文 ---- */
.fui-slider-host :deep(.fui-slider__track) {
  position: absolute;
  box-sizing: border-box;
  border-radius: var(--borderRadiusSmall); /* SliderTrackCornerRadius 2 */
  background-color: var(--colorNeutralStrokeAccessible); /* SliderTrackFill */
  transition: background-color var(--durationFast) var(--curveEasyEase);
}
.fui-slider-host[data-orientation='horizontal'] :deep(.fui-slider__track) {
  /* Pre 14 / 轨道 4 / Post 14 → 轨道居中 */
  inset-inline: 0;
  top: calc(50% - 2px);
  height: 4px; /* SliderTrackThemeHeight */
}
.fui-slider-host[data-orientation='vertical'] :deep(.fui-slider__track) {
  inset-block: 0;
  left: calc(50% - 2px);
  width: 4px;
}

/* ---- 数值填充（HorizontalDecreaseRect）：左右/上下位置由 reka 内联样式给出 ---- */
.fui-slider-host :deep(.fui-slider__range) {
  position: absolute;
  border-radius: var(--borderRadiusSmall); /* RadiusX/Y = CornerRadius 2 */
  background-color: var(--colorCompoundBrandBackground); /* SliderTrackValueFill */
  transition: background-color var(--durationFast) var(--curveEasyEase);
}
.fui-slider-host[data-orientation='horizontal'] :deep(.fui-slider__range) {
  top: 0;
  bottom: 0;
}
.fui-slider-host[data-orientation='vertical'] :deep(.fui-slider__range) {
  left: 0;
  right: 0;
}

/* ---- 刻度线（TickBar）：位置由 --fui-slider-tick 给出 ---- */
.fui-slider-host :deep(.fui-slider__ticks) {
  position: absolute;
  pointer-events: none;
}
.fui-slider-host :deep(.fui-slider__tick) {
  position: absolute;
  background-color: var(--colorNeutralStrokeAccessible); /* SliderTickBarFill */
}
.fui-slider-host[data-orientation='horizontal'] :deep(.fui-slider__tick) {
  top: 0;
  bottom: 0;
  width: 1px;
  left: var(--fui-slider-tick);
}
.fui-slider-host[data-orientation='vertical'] :deep(.fui-slider__tick) {
  left: 0;
  right: 0;
  height: 1px;
  top: var(--fui-slider-tick);
}
/* 轨道内刻度：SliderOutsideTickBarThemeHeight 4（与轨道同厚）+ 1px 白线抠出刻度 */
.fui-slider-host[data-orientation='horizontal'] :deep(.fui-slider__ticks--inline) {
  inset-inline: 0;
  top: 0;
  bottom: 0;
  overflow: hidden;
  border-radius: var(--borderRadiusSmall);
}
.fui-slider-host[data-orientation='vertical'] :deep(.fui-slider__ticks--inline) {
  inset-block: 0;
  left: 0;
  right: 0;
  overflow: hidden;
  border-radius: var(--borderRadiusSmall);
}
.fui-slider-host :deep(.fui-slider__ticks--inline .fui-slider__tick) {
  background-color: var(--colorNeutralBackground1); /* SliderInlineTickBarFill */
}
/* 轨道外刻度：距轨道 4px（WinUI Top/BottomTickBar 的 Margin 4 + 条高 4） */
.fui-slider-host[data-orientation='horizontal'] :deep(.fui-slider__ticks--top) {
  inset-inline: 0;
  bottom: calc(50% + 6px);
  height: 4px; /* SliderOutsideTickBarThemeHeight */
}
.fui-slider-host[data-orientation='horizontal'] :deep(.fui-slider__ticks--bottom) {
  inset-inline: 0;
  top: calc(50% + 6px);
  height: 4px;
}
.fui-slider-host[data-orientation='vertical'] :deep(.fui-slider__ticks--top) {
  inset-block: 0;
  right: calc(50% + 6px);
  width: 4px;
}
.fui-slider-host[data-orientation='vertical'] :deep(.fui-slider__ticks--bottom) {
  inset-block: 0;
  left: calc(50% + 6px);
  width: 4px;
}

/* ---- 滑块：18×18 布局盒（reka 的 contain 对齐按它算偏移），视觉 22×22 ---- */
.fui-slider-host :deep(.fui-slider__thumb) {
  display: block;
  box-sizing: border-box;
  width: 18px; /* SliderHorizontalThumbWidth / SliderVerticalThumbHeight */
  height: 18px;
  outline: none;
  cursor: pointer;
}
/* 命中区 = 整个可见外圈（22×22 = 18 + 2×(-2)，与 .fui-slider__puck 的 inset 对齐）：
   按在滑块上只「抓住」不跳值 —— WinUI 里这件事由 Thumb 自己接管
   （Thumb_Partial.cpp：PointerPressed 里 put_Handled(TRUE) + IsDragging，随后按
   DragDelta 的相对位移改值），只有按在 Thumb 之外时 Slider::OnPointerPressed 才会
   走 MoveThumbToPoint 把滑块中心挪到指针处。
   伪元素不产生 DOM 节点：命中它时 event.target 仍是 thumb 本体，正好落进 reka
   SliderImpl 的「target ∈ thumbElements → 只 focus、不 emit slideStart」分支。 */
.fui-slider-host :deep(.fui-slider__thumb)::before {
  content: '';
  position: absolute;
  inset: -2px;
}
/* 居中：reka 只给 left/bottom + transform，且滑块是轨道节点的**兄弟**，
   定位上下文是控件本体（32px），top/left 走静态位置会落在左上角——
   这里用「两侧置 0 + 对向 auto 外边距」把它对到轨道中心（等价 translate(-50%)，
   但不必覆盖 reka 内联的 transform）。 */
.fui-slider-host[data-orientation='horizontal'] :deep(.fui-slider__thumb) {
  /* 18px 盒在 32px 控件里居中 → 中心 y=16，与轨道中心（14+2）重合 */
  top: 0;
  bottom: 0;
  margin-block: auto;
}
.fui-slider-host[data-orientation='vertical'] :deep(.fui-slider__thumb) {
  /* 纵向由 reka 的内联 bottom 定位，这里只管横向居中（中心 x=16 = 轨道中心） */
  width: 18px; /* SliderVerticalThumbWidth */
  left: 0;
  right: 0;
  margin-inline: auto;
}

/* ---- 外圈：Border Margin=-2 → inset -2px 撑到 22×22 ---- */
.fui-slider-host :deep(.fui-slider__puck) {
  position: absolute;
  inset: -2px;
  box-sizing: border-box;
  /* 外圈纯属绘制：命中一律交给 thumb 本体（见上面的 ::before 命中区）。
     不置 none 的话 event.target 会落到这个子元素上，reka 会把它当成
     「点在轨道上」→ 跳值，正是「点滑块非中心区域会改值」的成因 */
  pointer-events: none;
  /* flex 居中内点：块级盒的垂直 auto 外边距会解析为 0，内点会贴外圈内容盒顶部
     （外圈内容盒比内点高 8px → 内点会偏高 4px，同心关系被破坏） */
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--strokeWidthThin); /* BorderThickness 1：环的厚度 */
  /* 真圆：WinUI 的 CornerRadius 是 10，那是 20px 外圈的设计半径；Web 侧外圈按
     Margin=-2 撑到 22px，照抄 10px 会在四边各留 2px 直边（且 1px 环在四角偏厚），
     看起来就不是正圆。borderRadiusCircular 由浏览器按半宽收敛（22 → 11），
     外圈直径与 WinUI 一致（22px），环与内胆保持同心等厚 */
  border-radius: var(--borderRadiusCircular);
  /* 两层背景拼出「1px 渐变环 + 实心内胆」，等价 WinUI 的 BorderBrush + Background：
     上层实心裁到 content-box（= 环内侧），下层渐变铺满 border-box（= 环本体） */
  background-image:
    linear-gradient(var(--colorNeutralBackground1), var(--colorNeutralBackground1)),
    linear-gradient(to bottom, var(--colorNeutralStrokeAlpha), var(--colorNeutralStroke1));
  background-origin: content-box, border-box;
  background-clip: content-box, border-box;
  /* 外圈不随状态变化（WinUI 只改 Thumb 的 Background = 内点），故不加过渡 */
}
.fui-slider-host :deep(.fui-slider__dot) {
  display: block;
  width: 12px; /* SliderInnerThumbWidth / SliderInnerThumbHeight */
  height: 12px;
  border-radius: var(--borderRadiusCircular);
  background-color: var(--colorCompoundBrandBackground); /* SliderThumbBackground */
  /* 内点同样只是绘制：点了它也必须算「抓住滑块」，不能穿透成轨道点击 */
  pointer-events: none;
  /* Normal：0.86（Storyboard 原值，12 × 0.86 ≈ 10.32，与实机一致） */
  transform: scale(0.86);
  transition:
    transform var(--durationNormal) var(--curveEasyEaseMax),
    background-color var(--durationFast) var(--curveEasyEase);
}

/* ---- 数值提示（Disambiguation UI）：ToolTip 表面 + 12px 文本 ---- */
.fui-slider-host :deep(.fui-slider__tip) {
  position: absolute;
  left: 50%;
  bottom: calc(100% + var(--spacingVerticalXS));
  transform: translateX(-50%);
  z-index: 1;
  padding: var(--spacingVerticalXS) var(--spacingHorizontalS);
  border: var(--strokeWidthThin) solid var(--colorNeutralStroke1);
  border-radius: var(--borderRadiusMedium);
  background-color: var(--colorNeutralBackground1);
  box-shadow: var(--shadow4);
  color: var(--colorNeutralForeground1);
  font-size: var(--fontSizeBase200); /* SLIDER_TOOLTIP_DEFAULT_FONT_SIZE 12 */
  line-height: var(--lineHeightBase200);
  white-space: nowrap;
  pointer-events: none;
}
.fui-slider-host[data-orientation='vertical'] :deep(.fui-slider__tip) {
  left: calc(100% + var(--spacingVerticalXS));
  bottom: auto;
  top: 50%;
  transform: translateY(-50%);
}

/* ---- hover（Slider 的 PointerOver：轨道 + 数值填充 + 内点一起换色） ---- */
/* 轨道 SliderTrackFillPointerOver 与 rest 同色，故不变 */
.fui-slider-host :deep(.fui-slider:not([data-disabled]):hover .fui-slider__range) {
  background-color: var(--colorCompoundBrandBackgroundHover); /* …ValueFillPointerOver */
}
.fui-slider-host :deep(.fui-slider:not([data-disabled]):hover .fui-slider__dot) {
  background-color: var(--colorCompoundBrandBackgroundHover); /* ThumbBackgroundPointerOver */
}
/* Thumb 自己的 PointerOver：内点放大到 14px（仅悬停滑块本体时） */
.fui-slider-host :deep(.fui-slider__thumb:not([data-disabled]):hover .fui-slider__dot) {
  transform: scale(1.167); /* 12 → 14 */
}

/* ---- pressed（Slider 的 Pressed：按下轨道任意处都会换色） ---- */
.fui-slider-host[data-pressed] :deep(.fui-slider__range) {
  background-color: var(--colorCompoundBrandBackgroundPressed); /* …ValueFillPressed */
}
.fui-slider-host[data-pressed] :deep(.fui-slider__dot) {
  background-color: var(--colorCompoundBrandBackgroundPressed); /* ThumbBackgroundPressed */
}
/* Thumb 自己被按下：内点缩到 10px（Storyboard 0.71） */
.fui-slider-host :deep(.fui-slider__thumb:not([data-disabled]):active .fui-slider__dot) {
  transform: scale(0.71); /* → 10 */
}

/* ---- disabled：全套 …Disabled 档（置于状态规则之后以赢得平局） ---- */
.fui-slider-host[data-disabled] :deep(.fui-slider__track) {
  background-color: var(--colorNeutralStrokeDisabled); /* SliderTrackFillDisabled */
}
.fui-slider-host[data-disabled] :deep(.fui-slider__range) {
  background-color: var(--colorNeutralBackgroundDisabled); /* …ValueFillDisabled */
}
.fui-slider-host[data-disabled] :deep(.fui-slider__dot) {
  background-color: var(--colorNeutralBackgroundDisabled); /* ThumbBackgroundDisabled */
  transform: scale(1.167); /* Disabled Storyboard：内点停在 hover 尺寸 */
}
.fui-slider-host[data-disabled] :deep(.fui-slider__tick) {
  background-color: var(--colorNeutralStrokeDisabled); /* SliderTickBarFillDisabled */
}
.fui-slider-host[data-disabled] :deep(.fui-slider__ticks--inline .fui-slider__tick) {
  background-color: var(--colorNeutralBackground1);
}
.fui-slider-host[data-disabled] :deep(.fui-slider) {
  cursor: not-allowed;
}
.fui-slider-host[data-disabled] :deep(.fui-slider__thumb) {
  cursor: not-allowed;
}

/* ---- focus：a11y focus ring（本库统一走 Fluent 焦点规范） ---- */
.fui-slider-host :deep(.fui-slider:has(.fui-slider__thumb:focus-visible)) {
  outline: var(--strokeWidthThick) solid var(--colorCompoundBrandStroke);
  outline-offset: 2px;
  border-radius: var(--borderRadiusMedium);
}

/* ---- 动效尊重系统减弱 ---- */
@media (prefers-reduced-motion: reduce) {
  .fui-slider-host :deep(.fui-slider),
  .fui-slider-host :deep(.fui-slider *) {
    transition: none !important;
  }
}
</style>
