<script lang="ts">
import type { AcceptableValue } from 'reka-ui'

/**
 * FluereCheckbox 组件 Props 契约
 *
 * 设计规范来源：WinUI 3 / Windows App SDK — CheckBox
 * （src/controls/dev/CommonStyles/CheckBox_themeresources.xaml）
 * 交互底座复用 reka-ui 的 CheckboxRoot（键盘、aria-checked、表单隐藏 input）。
 * 取值一律经 Fluent 2 语义 token 落地（fluent-tokens：data/fluent-tokens.json）
 *
 * 状态模型（modelValue，CheckedState）：
 * - true            勾选
 * - false           未勾选
 * - 'indeterminate'  不确定（三态，WinUI 称 Indeterminate；再点一次进勾选）
 *   原生画面上渲染为「横杠」字形（WinUI CheckBoxIndeterminateGlyph E73A）
 *
 * 解剖（anatomy，对应 WinUI ControlTemplate）：
 * - root       CheckboxRoot（渲染 button[role=checkbox] + 表单隐藏 input）
 * - box        20px 圆角方块（WinUI NormalRectangle，CheckBoxSize = 20）
 * - glyph      方块内字形：选中「对勾」/ 不确定「横杠」（CheckGlyph）
 * - content    右侧标签文本（ContentPresenter，Grid.Column=1）
 *
 * 尺寸：固定 20px 方块（CheckBoxSize），不随 size 缩放 —— 与 WinUI 一致
 *
 * 状态配色（对照 WinUI CheckBox 状态，见样式段逐条注释）：
 *   rest / hover / pressed / checked / indeterminate / disabled / focus
 *
 * 无障碍：根元素自带 role=checkbox + aria-checked；点击、Space/Enter 由
 * reka CheckboxRoot 处理；表单内 + name 时自动补隐藏 <input type=checkbox>。
 */
export interface FluereCheckboxProps {
  /**
   * 是否禁用
   * @default false
   */
  disabled?: boolean

  /**
   * 表单提交名（位于表单内时 reka 自动补隐藏原生 checkbox input）
   */
  name?: string

  /**
   * 勾选时提交给后端的值（配合 name 使用）
   * @default 'on'
   */
  value?: AcceptableValue
}
</script>

<script setup lang="ts">
// 不直接从 reka-ui 引 CheckedState 类型：reka-ui 的 index.d.ts 内部同时存在
// 本地 `type CheckedState` 导出与被改名重导出的 `CheckedState`，严格 TS 会报
// TS2460。这里本地等价声明即可，取值一致（boolean | 'indeterminate'）。
import { FluentIconCheckmark12Regular, FluentIconSubtract12Regular } from '@fluere-vue/icons'
import { CheckboxRoot as RekaCheckboxRoot } from 'reka-ui'
import { computed } from 'vue'

type CheckedState = boolean | 'indeterminate'

const props = withDefaults(defineProps<FluereCheckboxProps>(), {
  disabled: false,
  name: undefined,
  value: 'on',
})

const model = defineModel<CheckedState>({ default: false })

const rootClass = computed(() => ['fui-checkbox'])

defineOptions({
  name: 'FluereCheckbox',
})
</script>

<template>
  <RekaCheckboxRoot
    v-model="model"
    :disabled="disabled"
    :name="name"
    :value="value"
    :class="rootClass"
  >
    <template #default="{ state }">
      <span
        class="fui-checkbox__box"
        aria-hidden="true"
      >
        <!-- 选中：对勾（WinUI CheckBoxCheckedGlyph E73E）；字形出现时自左向右缓动 -->
        <FluentIconCheckmark12Regular
          v-if="state === true"
          class="fui-checkbox__glyph"
        />
        <!-- 不确定：横杠（WinUI CheckBoxIndeterminateGlyph E73A）；同出现动效 -->
        <FluentIconSubtract12Regular
          v-else-if="state === 'indeterminate'"
          class="fui-checkbox__glyph"
        />
      </span>

      <span class="fui-checkbox__content">
        <slot />
      </span>
    </template>
  </RekaCheckboxRoot>
</template>

<style scoped>
/* ------------------------------------------------------------------ */
/* 所有值均引用 Fluent 语义 token（var(--TokenName)），见 fluent-tokens  */
/* 明暗主题由 tokens.css 的 light-dark() + color-scheme 自动切换        */
/*                                                                     */
/* WinUI 3 对照（Windows App SDK 1.8，src/controls/dev/CommonStyles/   */
/* CheckBox_themeresources.xaml + Common_themeresources.xaml）：        */
/*   CheckBoxSize                         = 20                          */
/*   CheckBoxBorderThickness             = 1（strokeWidthThin）         */
/*   ControlCornerRadius / 默认 Corner     = 4（borderRadiusMedium）    */
/*   CheckBoxBackgroundUnchecked*         = SubtleFillColorTransparent  */
/*   CheckBoxBorderBrush*                 = SubtleFillColorTransparent  */
/*     → 根标签背景/描边全程透明，只有「方块」可见                       */
/*   CheckBoxCheckBackgroundStrokeUnchecked（未勾选描边）                 */
/*     = ControlStrongStrokeColorDefault  → colorNeutralStrokeAccessible */
/*   CheckBoxCheckBackgroundFillUnchecked  （未勾选填充）                 */
/*     = ControlAltFillColorSecondary     → 中性底（colorNeutralBackground3） */
/*   CheckBoxCheckBackgroundStrokeChecked / Indeterminate               */
/*     = AccentFillColorDefault           → colorCompoundBrandBackground  */
/*   CheckBoxCheckBackgroundFillChecked / Indeterminate                 */
/*     = AccentFillColorDefault           → colorCompoundBrandBackground  */
/*   CheckBoxCheckBackgroundStroke/PointerOver  = AccentFillColorSecond */
/*     → colorCompoundBrandBackgroundHover                              */
/*   CheckBoxCheckBackgroundPressed       = AccentFillColorTertiary     */
/*     → colorCompoundBrandBackgroundPressed                            */
/*   CheckBoxCheckGlyphForegroundChecked   = TextOnAccentFillColorPrimary */
/*     → colorNeutralForegroundOnBrand                                    */
/*   CheckBoxForeground*                  = TextFillColorPrimary         */
/*     → colorNeutralForeground1（标签文字）                              */
/* Disabled：全部落到 …Disabled 档：                                    */
/*   方块 Stroke = ControlStrongStrokeColorDisabled → colorNeutralStrokeDisabled */
/*   方块 Fill   = AccentFillColorDisabled / ControlAltFillColorDisabled */
/*     → colorNeutralBackgroundDisabled                                  */
/*   字形/文字    = TextOnAccentFillColorDisabled / TextFillColorDisabled */
/*     → colorNeutralForegroundDisabled                                  */
/* ------------------------------------------------------------------ */

.fui-checkbox {
  display: inline-flex;
  align-items: center;
  gap: var(--spacingHorizontalM); /* 方块与文字间距 12px（WinUI CheckBox 内容距） */
  box-sizing: border-box;
  background: transparent; /* CheckBoxBackground* = SubtleFillColorTransparent */
  border: var(--strokeWidthThin) solid transparent; /* CheckBoxBorderBrush* = transparent */
  color: var(--colorNeutralForeground1); /* CheckBoxForeground* = TextFillColorPrimary */
  font-family: var(--fontFamilyBase);
  font-size: var(--fontSizeBase300);
  line-height: var(--lineHeightBase300);
  cursor: pointer;
  user-select: none;
  outline: none;
  transition: color var(--durationFast) var(--curveEasyEase);
}

/* ---- 方块：20px 圆角、1px 描边 ---- */
.fui-checkbox__box {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 20px; /* CheckBoxSize */
  height: 20px; /* CheckBoxSize */
  box-sizing: border-box;
  border: var(--strokeWidthThin) solid var(--colorNeutralStrokeAccessible);
  border-radius: var(--borderRadiusMedium); /* ControlCornerRadius = 4 */
  background-color: var(--colorNeutralBackground3); /* ControlAltFillColorSecondary */
  color: var(--colorNeutralForegroundOnBrand);
  transition:
    background-color var(--durationFast) var(--curveEasyEase),
    border-color var(--durationFast) var(--curveEasyEase);
}

/* ---- 字形：居中，12px 视窗 ---- */
/* ---- 字形：图标组件自身即 12×12，随 currentColor 变色 ---- */
.fui-checkbox__glyph {
  display: flex;
  /* 出现动效：字形从 unchecked → checked / indeterminate 时自左向右缓动出现。
     因为字形用 v-if 挂载（unchecked 时不渲染），每次出现都会重触发该动画；
     消失（checked → unchecked）由 v-if 移除 DOM，瞬时完成，不做退出动画 ——
     对应 WinUI CheckGlyph 的 PointerOver/Normal 画入、Off 态瞬时清空。 */
  transform-origin: left center;
  animation: fui-checkbox-glyph-in var(--durationNormal) var(--curveDecelerateMid) both;
}

@keyframes fui-checkbox-glyph-in {
  from {
    transform: translateX(-30%) scaleX(0);
    opacity: 0;
  }
  to {
    transform: translateX(0) scaleX(1);
    opacity: 1;
  }
}

/* ---- hover（InternetCheck visual：PointerOver） ---- */
/* 未勾选 hover：描边不变（WinUI 仍为 ControlStrongStrokeColorDefault），
   填充加深一档（ControlAltFillColorSecondary → Tertiary） */
.fui-checkbox:hover:not(:disabled):not([data-disabled])[data-state='unchecked'] .fui-checkbox__box {
  background-color: var(--colorNeutralBackground4);
}
/* 勾选/不确定 hover：AccentFillColorDefault → Secondary */
.fui-checkbox:hover:not(:disabled):not([data-disabled])[data-state='checked'] .fui-checkbox__box,
.fui-checkbox:hover:not(:disabled):not([data-disabled])[data-state='indeterminate']
  .fui-checkbox__box {
  background-color: var(--colorCompoundBrandBackgroundHover);
  border-color: var(--colorCompoundBrandBackgroundHover);
}

/* ---- pressed（Pressed 态） ---- */
.fui-checkbox:active:not(:disabled):not([data-disabled])[data-state='unchecked']
  .fui-checkbox__box {
  background-color: var(--colorNeutralBackground5); /* ControlAltFillColorQuarternary */
}
.fui-checkbox:active:not(:disabled):not([data-disabled])[data-state='checked'] .fui-checkbox__box,
.fui-checkbox:active:not(:disabled):not([data-disabled])[data-state='indeterminate']
  .fui-checkbox__box {
  background-color: var(--colorCompoundBrandBackgroundPressed);
  border-color: var(--colorCompoundBrandBackgroundPressed);
}

/* ---- 勾选 / 不确定：品牌色填充 + 同色描边 ---- */
.fui-checkbox[data-state='checked'] .fui-checkbox__box,
.fui-checkbox[data-state='indeterminate'] .fui-checkbox__box {
  background-color: var(--colorCompoundBrandBackground); /* AccentFillColorDefault */
  border-color: var(--colorCompoundBrandBackground); /* CheckBoxCheckBackgroundStroke* = 同色 */
}

/* ---- disabled：全套落到 …Disabled 档 ---- */
.fui-checkbox:disabled,
.fui-checkbox[data-disabled] {
  color: var(--colorNeutralForegroundDisabled); /* TextFillColorDisabled */
  cursor: not-allowed;
}
.fui-checkbox:disabled .fui-checkbox__box,
.fui-checkbox[data-disabled] .fui-checkbox__box {
  background-color: var(--colorNeutralBackgroundDisabled); /* AccentFillColorDisabled */
  border-color: var(--colorNeutralStrokeDisabled); /* ControlStrongStrokeColorDisabled */
}
/* 禁用时字形与方块同色（TextOnAccentFillColorDisabled） */
.fui-checkbox:disabled .fui-checkbox__glyph,
.fui-checkbox[data-disabled] .fui-checkbox__glyph {
  color: var(--colorNeutralForegroundDisabled);
}

/* ---- focus（Focused / a11y 硬性约束） ---- */
.fui-checkbox:focus-visible {
  outline: var(--strokeWidthThick) solid var(--colorCompoundBrandStroke);
  outline-offset: 2px;
}
</style>
