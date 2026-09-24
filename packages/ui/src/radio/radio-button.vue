<script lang="ts">
import type { AcceptableValue } from 'reka-ui'

/**
 * FluereRadioButton 组件 Props 契约
 *
 * 设计规范来源：WinUI 3 / Windows App SDK — RadioButton
 * （src/controls/dev/CommonStyles/RadioButton_themeresources.xaml）
 * 交互底座复用 reka-ui 的 RadioGroupItem（roving focus 方向键导航、role=radio、
 * aria-checked、选中态互斥）。必须置于 <FluereRadioGroup> 内使用（reka 通过
 * provide/inject 注入组上下文）。
 * 取值一律经 Fluent 2 语义 token 落地（fluent-tokens：data/fluent-tokens.json）
 *
 * 状态模型：value 为该单选项的值；是否选中由所属 <FluereRadioGroup> 的
 * modelValue 决定（同一组内互斥）。
 *
 * 解剖（anatomy，对照 WinUI ControlTemplate）：
 * - root                  button[role=radio]（reka RadioGroupItem 渲染），整行可点
 * - circle                20px 圆形 = WinUI OuterEllipse（未选）/ CheckOuterEllipse（选中）
 *                         合并为一个随 data-state 走 background 过渡的圆形，
 *                         比 WinUI 双椭圆叠 opacity 更省绘制，视觉等价
 * - circle 内的内点       WinUI CheckGlyph（白色 12px 内点）/ PressedCheckGlyph
 *                         （按下预览点）不再用独立元素，而是作为单个 radial-gradient
 *                         直接画在圆上：同一圆点经状态变量在「隐藏 / 选中 / 按下
 *                         预览」间缩放显隐，减少 DOM 节点
 * - content               右侧标签文本（ContentPresenter，Grid.Column=1）
 *
 * WinUI 里选中态是「品牌色实心圆 + 白色内点」；按下列表预览选中（PressedCheckGlyph
 * 渐显放大）是 RadioButton 的标志性手感，这里完整还原。
 *
 * 状态配色（对照 RadioButton_themeresources.xaml，见样式段逐条注释）：
 *   rest / hover / pressed / checked / disabled / focus
 *
 * 无障碍：根元素自带 role=radio + aria-checked，方向键导航由 reka RadioGroup 处理；
 * 可见文本位在按钮内部即作为可访问名；内容为纯图标时可用 label 提供 aria-label。
 */
export interface FluereRadioButtonProps {
  /**
   * 该单选项的值（随组提交 / 决定选中态）
   * @default undefined
   */
  value?: AcceptableValue

  /**
   * 是否禁用该单选项（叠加在组 disabled 之上）
   * @default false
   */
  disabled?: boolean

  /**
   * 表单提交名（配合 name 时 reka 自动补隐藏原生 radio input）
   */
  name?: string

  /**
   * 组内必选约束（配合 reka 表单校验）
   * @default false
   */
  required?: boolean

  /**
   * 原生 id（可与外部 label 的 for 关联）
   */
  id?: string

  /**
   * 可访问名称（无障碍）。可见文本已位在按钮内会自动作为可访问名；仅在
   * 内容为纯图标（无可读文本）时，用此提供 aria-label。
   */
  label?: string
}
</script>

<script setup lang="ts">
import { RadioGroupItem as RekaRadioGroupItem } from 'reka-ui'
import { computed } from 'vue'

const props = withDefaults(defineProps<FluereRadioButtonProps>(), {
  value: undefined,
  disabled: false,
  name: undefined,
  required: false,
  id: undefined,
  label: undefined,
})

/** 可见文本在按钮内部即作为可访问名；label 仅兜底（纯图标场景） */
const ariaLabel = computed(() => props.label || undefined)
const rootClass = computed(() => ['fui-radio'])

defineOptions({ name: 'FluereRadioButton' })
</script>

<template>
  <RekaRadioGroupItem
    :class="rootClass"
    :value="value"
    :disabled="disabled"
    :name="name"
    :required="required"
    :id="id"
    :aria-label="ariaLabel"
  >
    <span
      class="fui-radio__circle"
      aria-hidden="true"
    />

    <span class="fui-radio__content">
      <slot />
    </span>
  </RekaRadioGroupItem>
</template>

<style scoped>
/* ------------------------------------------------------------------ */
/* 所有值均引用 Fluent 语义 token（var(--TokenName)），见 fluent-tokens  */
/* 明暗主题由 tokens.css 的 light-dark() + color-scheme 自动切换        */
/*                                                                     */
/* WinUI 3 对照（Windows App SDK 1.8，src/controls/dev/CommonStyles/   */
/* RadioButton_themeresources.xaml + Common_themeresources.xaml）：     */
/*   RadioButtonBorderThemeThickness     = 1（strokeWidthThin）         */
/*   RadioButton CheckGlyphSize = 12 / PointerOverSize = 14 /          */
/*     PressedOverSize = 10。                                           */
/*   RadioButtonBackground/BorderBrush*  = ControlFillColorTransparent */
/*     → 根按钮背景/描边全程透明，只露「圆 + 文本」                       */
/*   RadioButtonOuterEllipseStroke        = ControlStrongStrokeColorDefault */
/*     → colorNeutralStrokeAccessible（未选描边）                        */
/*   RadioButtonOuterEllipseFill*         = ControlAltFillColorSec..Quar */
/*     → colorNeutralBackground3/4/5（未选填充 rest/hover/pressed）     */
/*   RadioButtonOuterEllipseStrokePressed = ControlStrongStrokeColorDisabled */
/*     → colorNeutralStrokeDisabled（未选按下载入禁用描边 —— WinUI 原样） */
/*   RadioButtonOuterEllipse*Checked*     = AccentFillColor Default..Ter */
/*     → colorCompoundBrandBackground(/Hover/Pressed)（选中实心圆+描边） */
/*   RadioButtonOuterEllipseFill*Disabled = AccentFillColorDisabled      */
/*     → colorNeutralBackgroundDisabled                                  */
/*   RadioButtonCheckGlyphFill            = TextOnAccentFillColorPrimary */
/*     → colorNeutralForegroundOnBrand（内点白色）                       */
/*   RadioButtonCheckGlyphPointerOver/Pressed = TextOnAccentFillColorPri */
/*     → 内点随 hover/active 缩放（12→14 / →10）                         */
/*   RadioButtonCheckStatus* = 选中交换：OuterEllipse 隐藏 /              */
/*     CheckOuterEllipse + CheckGlyph 显示（用 data-state + CSS 过渡）   */
/*   RadioButtonForeground* = TextFillColorPrimary / …Disabled           */
/*     → colorNeutralForeground1 / colorNeutralForegroundDisabled        */
/*                                                                     */
/* 内点绘制方案：不再用子元素，而是作为单个 radial-gradient 直接画在圆的       */
/*   background 上（双语义 bg 合成）：                                       */
/*   语义 bg 1 = 外圆 background-color（续 var(--fill)，随交互态过渡）；      */
/*   语义 bg 2 = 内圆点 gradient 的色（var(--dot-bg)）与半径（var(--dot-radius)）。 */
/*   圆点缺省 radius=0（隐藏），选中 / 按下态放大到对应直径；色值 transparent    */
/*   则不绘制。各交互态只需改写这几个语义变量即可，声明式、等权重，无深层子级    */
/*   选择器。点边缘的抗锯齿过渡带由 --dot-fade 控制（radius - fade → radius     */
/*   渐隐）。内点颜色 / 半径经下方 <style> 的 @property 注册为可插值属性，       */
/*   可在 .fui-radio 上的 transition 中逐帧过渡。                              */
/*   另：内点以「硬边 gradient 精确 12px」绘制（radius 即直径一半），           */
/*   不受 transform scale 插值影响，视觉上不再显得比模型偏大。                */
/*                                                                     */
/* 动效：WinUI 用 ControlNormal/FastAnimationDuration + FastOutSlowIn   */
/*   → transition(durationFast / durationNormal) + curveEasyEase(Max)  */
/*                                                                     */
/* 与参考的一处刻意偏差：参考把 CheckGlyphFillDisabled 指到               */
/* TextOnAccentFillColorPrimary（白色），而禁用态选中的实心圆用           */
/* AccentFillColorDisabled（近白浅灰），两者叠加会得到「白点+浅灰圆」的   */
/* 近不可见结果。这里禁用态内点改用 colorNeutralForegroundDisabled，     */
/* 与 CheckBox 禁用字形一致，保证可读性（还原语义而非还原一个显示 bug）。 */
/* ------------------------------------------------------------------ */

/* ---- 根按钮 ---- */
/* 状态建模：以「抽象状态值」声明式表达。具体属性（外圆填充/描边、内点显隐与
   直径）只在一处读取这些变量；各交互状态用等权重的根级选择器改写变量。
   相比在每个深层选择器里直接设具体属性，避免了 checked/hover/active
   组合时特异性与覆盖顺序的脆弱性。明暗主题仍由 tokens.css 的 light-dark() 切换。
  * ------------------------------------------------------------ */
.fui-radio {
  /* 语义 bg 1：外圆填充 + 描边（不同交互态下的圆形背景） */
  --fill: var(--colorNeutralBackground3); /* 圆填充：未选 rest */
  --stroke: var(--colorNeutralStrokeAccessible); /* 圆描边：未选 rest */

  /* 语义 bg 2：内圆点 —— 单个 radial-gradient 绘制。
     transparent = 不绘制；色值 = 实点显现。
     radius 即点直径的一半（直径 = 2 × radius）；缺省 0 = 隐藏。
     fade = 点边缘抗锯齿过渡带宽度：从 (radius - fade) 起由点色渐变为透明，
     而非硬切，消除圆点与底色交界处的锯齿。 */
  --dot-bg: transparent; /* 内点颜色 = 选中/按下预览点颜色（CheckGlyph） */
  --dot-radius: 0px; /* 0 = 未选/未按下时内点隐藏；选中 12px / 按下预览 10px */
  --press-radius: 5px; /* 按下态内点半径（PressedOverSize 10/2） */
  --dot-fade: 0.4px; /* 圆点边缘抗锯齿过渡带宽度（≈ 6px 半径的 ~7%） */

  /* 各状态的具体取值（对照 WinUI token，集中于此便于核对） */
  --fill-unchecked-hover: var(--colorNeutralBackground4); /* controlAltFill*Tertiary */
  --fill-unchecked-active: var(--colorNeutralBackground5); /* controlAltFill*Quarternary */
  --stroke-unchecked-active: var(
    --colorNeutralStrokeDisabled
  ); /* OuterEllipseStrokePressed（原样） */
  --fill-checked: var(--colorCompoundBrandBackground); /* accentFill Default */
  --fill-checked-hover: var(--colorCompoundBrandBackgroundHover); /* accentFill Secondary */
  --fill-checked-active: var(--colorCompoundBrandBackgroundPressed); /* accentFill Tertiary */
  --stroke-checked: var(--colorCompoundBrandBackground);
  --stroke-checked-hover: var(--colorCompoundBrandBackgroundHover);
  --stroke-checked-active: var(--colorCompoundBrandBackgroundPressed);
  --dot-bg-checked: var(--colorNeutralForegroundOnBrand); /* TextOnAccentFillColorPrimary */
  --dot-radius-checked-hover: 7px; /* CheckGlyphPointerOverSize 14/2 */

  display: inline-flex;
  align-items: center;
  gap: var(--spacingHorizontalS); /* 圆与文本间距 8px（WinUI content Margin-left 8） */
  box-sizing: border-box;
  padding: 0;
  background: transparent; /* RadioButtonBackground* = ControlFillColorTransparent */
  border: var(--strokeWidthThin) solid transparent; /* RadioButtonBorderBrush* = transparent */
  color: var(--colorNeutralForeground1); /* RadioButtonForeground = TextFillColorPrimary */
  font-family: var(--fontFamilyBase);
  font-size: var(--fontSizeBase300);
  line-height: var(--lineHeightBase300);
  text-align: left;
  cursor: pointer;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  outline: none;
  /* 内点相关自定义属性经下方 <style> 里的 @property 注册后即可过渡/插值；
     声明在设置它们的根上，中间色逐帧下传到 __circle 的 gradient 重绘。 */
  transition:
    color var(--durationFast) var(--curveEasyEase),
    --dot-bg var(--durationFast) var(--curveEasyEase),
    --dot-radius var(--durationFaster) var(--curveEasyEase);
}

/* ---- 圆：20px 圆形，未选实线和中性底；选中品牌实心圆 = WinUI 双椭圆合并 ----
     内点经单个 radial-gradient 画在其上（见下） */
.fui-radio__circle {
  flex-shrink: 0;
  width: 20px; /* RadioButton 圆直径 */
  height: 20px; /* RadioButton 圆直径 */
  box-sizing: border-box;
  border-radius: var(--borderRadiusCircular); /* 全圆：20/2=10 */
  /* 填充 / 描边取值统一来自顶层抽象变量（见 .fui-radio） */
  border: var(--strokeWidthThin) solid var(--stroke);
  /* 语义 bg 1：外圆背景 */
  background-color: var(--fill);
  /* 语义 bg 2：内圆点 —— 单个 gradient，经 transparent / 色值隐藏或显现，
     半径控制点径（0 = 隐藏；选中/按下态放大）。
     在 (radius - fade) → radius 处留 --dot-fade 宽过渡带做抗锯齿，
     避免点与底色交界硬切出现锯齿。
     radial-gradient(circle) 且不写 center 即默认 50% 50%，恰在圆心。 */
  background-image: radial-gradient(
    circle,
    var(--dot-bg) calc(var(--dot-radius) - var(--dot-fade)),
    transparent var(--dot-radius)
  );
  transition:
    background-color var(--durationFast) var(--curveEasyEase),
    border-color var(--durationFast) var(--curveEasyEase);
}

/* ---- 选中：品牌实心圆 + 白色内点（governed by 顶层抽象变量的 checked 规则，
       见下方状态机；此处不再写直接样式，避免覆盖 --fill/--dot-bg） ---- */

/* ------------------------------------------------------------
 * 状态机：全部为 .fui-radio 根级、等权重选择器，只改写抽象变量。
 * 覆盖优先级仅由书写顺序决定，不再受深层子级特异性牵制。
 * 说明：按下时 hover 必然同时命中；active 规则书写在后，等权重下
 * 赢得平局，故按住时内点取按下档（10px）而非 hover 档（14px），
 * 避免卡死 hover 的「先放大再缩小」尺寸跳变。
 * ---------------------------------------------------------- */

/* ---- checked：品牌实心圆 + 白色内点显现 ---- */
.fui-radio[data-state='checked'] {
  --fill: var(--fill-checked);
  --stroke: var(--stroke-checked);
  --dot-bg: var(--dot-bg-checked);
  --dot-radius: 6px; /* 12px = RadioButtonCheckGlyphSize → 半径 6 */
}

/* ---- hover -- */
/* 未选 hover：填充加深一档（Secondary→Tertiary），描边不变 */
.fui-radio:hover:not(:disabled):not([data-disabled]):not([data-state='checked']) {
  --fill: var(--fill-unchecked-hover);
}
/* 选中 hover：品牌色深一档 + 内点放大到 14px */
.fui-radio:hover:not(:disabled):not([data-disabled])[data-state='checked'] {
  --fill: var(--fill-checked-hover);
  --stroke: var(--stroke-checked-hover);
  --dot-radius: var(--dot-radius-checked-hover); /* 12→14 = CheckGlyphPointerOverSize */
}

/* ---- pressed -- */
/* 未选 pressed：填充最深档 + WinUI 原样载入禁用描边 + 内点作按下预览出现 */
.fui-radio:active:not(:disabled):not([data-disabled]):not([data-state='checked']) {
  --fill: var(--fill-unchecked-active); /* ControlAltFillColorQuarternary */
  --stroke: var(--stroke-unchecked-active); /* OuterEllipseStrokePressed（原样） */
  --dot-bg: var(--dot-bg-checked); /* 按下预览点，白色 */
  --dot-radius: var(--press-radius); /* 内点放大到 10px = PressedOverSize 终值 */
}
/* 选中 pressed：品牌色 pressed 档；内点收缩到 10px，呈现按下预览手感 */
.fui-radio:active:not(:disabled):not([data-disabled])[data-state='checked'] {
  --fill: var(--fill-checked-active);
  --stroke: var(--stroke-checked-active);
  --dot-bg: var(--dot-bg-checked); /* 仍为白色内点 */
  --dot-radius: var(--press-radius); /* 12 → 10 = PressedOverSize 终值 */
}

/* ---- disabled：全套 …Disabled 档（置于所有交互规则之后） ---- */
.fui-radio:disabled {
  --fill: var(--colorNeutralBackgroundDisabled); /* Outer/CheckedFillDisabled */
  --stroke: var(--colorNeutralStrokeDisabled); /* OuterEllipseStrokeDisabled */
  color: var(--colorNeutralForegroundDisabled); /* RadioButtonForegroundDisabled */
  cursor: not-allowed;
}
/* disabled + checked：内点改用禁用文字色，保证白点+浅灰圆的可读性（见文件头注释） */
.fui-radio:disabled[data-state='checked'] {
  --dot-bg: var(--colorNeutralForegroundDisabled);
}

/* ---- 内容区（ContentPresenter） ---- */
.fui-radio__content {
  min-width: 0;
  color: inherit;
}

/* ---- focus（Focused / a11y 硬性约束） ---- */
.fui-radio:focus-visible {
  outline: var(--strokeWidthThick) solid var(--colorCompoundBrandStroke);
  outline-offset: 2px;
}

/* ---- 动效尊重系统减弱 -- */
@media (prefers-reduced-motion: reduce) {
  .fui-radio,
  .fui-radio * {
    transition: none !important;
  }
}
</style>

<!-- ------------------------------------------------------------------ -->
<!-- @property 注册：把内点用到的自定义属性注册为可插值的 <color>/<length>，   -->
<!-- 使它们在 .fui-radio 上的 transition 真正逐帧过渡（未注册的自定义属性     -->
<!-- 默认不被动画插值，只会瞬切）。@property 是对属性名的全局注册，须放         -->
<!-- 非 scoped 的独立 <style>，避免被 scoped 选择器重写。                      -->
<!-- ------------------------------------------------------------------ -->
<style>
@property --dot-bg {
  syntax: '<color>';
  inherits: true;
  initial-value: transparent;
}
@property --dot-radius {
  syntax: '<length>';
  inherits: true;
  initial-value: 0px;
}
</style>
