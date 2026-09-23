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
 *                         合并为一个随 data-state 走 background/border 过渡的圆形，
 *                         比 WinUI 双椭圆叠 opacity 更省绘制，视觉等价
 * - dot                   选中态内圆点 = WinUI CheckGlyph（12px，TextOnAccentFillColorPrimary）
 * - pressed-dot           按下预览圆点 = WinUI PressedCheckGlyph（4→10px，按下浅显）
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
    >
      <!-- 选中态内点：WinUI CheckGlyph（白色 12px，hover 放大）
           单独元素可随 hover/active/选中态做尺寸过渡 -->
      <span class="fui-radio__dot" />
      <!-- 按下预览点：WinUI PressedCheckGlyph（4→10px），按住时浅显预览选中 -->
      <span class="fui-radio__pressed-dot" />
    </span>

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
/*     PressedOverSize = 10（KeyFrame 取 14/10，这里用 scale 近似）。    */
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
/* 动效：WinUI 用 ControlNormal/FastAnimationDuration + FastOutSlowIn */
/*   → transition(durationFast / durationNormal) + curveEasyEase(Max)  */
/*                                                                     */
/* 与参考的一处刻意偏差：参考把 CheckGlyphFillDisabled 指到               */
/* TextOnAccentFillColorPrimary（白色），而禁用态选中的实心圆用           */
/* AccentFillColorDisabled（近白浅灰），两者叠加会得到「白点+浅灰圆」的   */
/* 近不可见结果。这里禁用态内点改用 colorNeutralForegroundDisabled，     */
/* 与 CheckBox 禁用字形一致，保证可读性（还原语义而非还原一个显示 bug）。 */
/* ------------------------------------------------------------------ */

/* ---- 根按钮 ---- */
.fui-radio {
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
  transition: color var(--durationFast) var(--curveEasyEase);
}

/* ---- 圆：20px 圆形，未选实线和中性底；选中品牌实心圆 = WinUI 双椭圆合并 ---- */
.fui-radio__circle {
  position: relative;
  flex-shrink: 0;
  width: 20px; /* RadioButton 圆直径 */
  height: 20px; /* RadioButton 圆直径 */
  box-sizing: border-box;
  border-radius: var(--borderRadiusCircular); /* 全圆：20/2=10 */
  border: var(--strokeWidthThin) solid var(--colorNeutralStrokeAccessible);
  /* OuterEllipseFill = ControlAltFillColorSecondary（未选中性底） */
  background-color: var(--colorNeutralBackground3);
  transition:
    background-color var(--durationFast) var(--curveEasyEase),
    border-color var(--durationFast) var(--curveEasyEase);
}

/* ---- 内点：选中态白色圆点（WinUI CheckGlyph 12px），随 hover 放大 ---- */
.fui-radio__dot {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 12px; /* RadioButtonCheckGlyphSize */
  height: 12px; /* RadioButtonCheckGlyphSize */
  box-sizing: border-box;
  border-radius: var(--borderRadiusCircular);
  /* CheckGlyphFill = TextOnAccentFillColorPrimary（白色内点） */
  background-color: var(--colorNeutralForegroundOnBrand);
  transform: translate(-50%, -50%) scale(0);
  opacity: 0;
  transition:
    opacity var(--durationFast) var(--curveEasyEase),
    transform var(--durationFast) var(--curveEasyEaseMax);
}

/* ---- 按下预览点：WinUI PressedCheckGlyph（4→10px），按住浅显，预感选中 ---- */
.fui-radio__pressed-dot {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 4px;
  height: 4px;
  box-sizing: border-box;
  border-radius: var(--borderRadiusCircular);
  /* PressedCheckGlyph Background = CheckGlyphFill（白色预览点） */
  background-color: var(--colorNeutralForegroundOnBrand);
  transform: translate(-50%, -50%) scale(0);
  opacity: 0;
  transition:
    opacity var(--durationFast) var(--curveEasyEase),
    transform var(--durationFast) var(--curveEasyEaseMax);
}

/* ---- 选中：品牌实心圆 + 同色描边 + 白色内点显现（data-state 交换） ---- */
.fui-radio[data-state='checked'] .fui-radio__circle {
  /* CheckedFill/CheckedStroke = AccentFillColorDefault */
  background-color: var(--colorCompoundBrandBackground);
  border-color: var(--colorCompoundBrandBackground);
}
.fui-radio[data-state='checked'] .fui-radio__dot {
  opacity: 1;
  transform: translate(-50%, -50%) scale(1);
}

/* ---- hover -- */
/* 未选 hover：填充加深一档（ControlAltFillColorSecondary→Tertiary），描边不变 */
.fui-radio:hover:not(:disabled):not([data-disabled])[data-state='unchecked'] .fui-radio__circle {
  background-color: var(--colorNeutralBackground4);
}
/* 选中 hover：品牌色深一档（AccentFillColorSecondary）+ 内点放大到 14px */
.fui-radio:hover:not(:disabled):not([data-disabled])[data-state='checked'] .fui-radio__circle {
  background-color: var(--colorCompoundBrandBackgroundHover);
  border-color: var(--colorCompoundBrandBackgroundHover);
}
.fui-radio:hover:not(:disabled):not([data-disabled])[data-state='checked'] .fui-radio__dot {
  transform: translate(-50%, -50%) scale(1.1667); /* 12→14 = CheckGlyphPointerOverSize */
}

/* ---- pressed -- */
/* 未选 pressed：填充 Quarternary + WinUI 原样载入「禁用描边」（外圈按下的特殊表现） */
.fui-radio:active:not(:disabled):not([data-disabled])[data-state='unchecked'] .fui-radio__circle {
  background-color: var(--colorNeutralBackground5); /* ControlAltFillColorQuarternary */
  border-color: var(--colorNeutralStrokeDisabled); /* OuterEllipseStrokePressed（WinUI 原样） */
}
/* 选中 pressed：品牌色再深一档；内点收缩到 10px 并让位给按下预览点 */
.fui-radio:active:not(:disabled):not([data-disabled])[data-state='checked'] .fui-radio__circle {
  background-color: var(--colorCompoundBrandBackgroundPressed);
  border-color: var(--colorCompoundBrandBackgroundPressed);
}
.fui-radio:active:not(:disabled):not([data-disabled]) .fui-radio__dot {
  opacity: 0;
  transform: translate(-50%, -50%) scale(0.8333); /* 12→10 = CheckGlyphPressedOverSize */
}
/* 按下预览点：按住时渐显并放大到 10px（WinUI PressedCheckGlyph 4→10） */
.fui-radio:active:not(:disabled):not([data-disabled]) .fui-radio__pressed-dot {
  opacity: 1;
  transform: translate(-50%, -50%) scale(2.5); /* 4→10 */
}

/* ---- disabled：全套 …Disabled 档（置于状态规则之后以赢得同权重平局） ---- */
.fui-radio:disabled {
  color: var(--colorNeutralForegroundDisabled); /* RadioButtonForegroundDisabled */
  cursor: not-allowed;
}
.fui-radio:disabled .fui-radio__circle {
  /* Outer/CheckedFillDisabled = AccentFillColorDisabled */
  background-color: var(--colorNeutralBackgroundDisabled);
  /* OuterEllipseStrokeDisabled = ControlStrongStrokeColorDisabled */
  border-color: var(--colorNeutralStrokeDisabled);
}
.fui-radio:disabled .fui-radio__dot {
  background-color: var(--colorNeutralForegroundDisabled); /* 见文件头注释：可读性修正 */
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
