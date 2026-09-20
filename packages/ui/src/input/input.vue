<script lang="ts">
/**
 * FluereInput 组件 Props 契约
 *
 * 设计规范来源：Fluent Design 2 — TextField / Input
 * （fluent-components / fluent-tokens：data/fluent-tokens.json）
 *
 * 尺寸 (size)：small (24) / medium (32，默认) / large (40)（px 高度）
 *
 * 外观 (appearance)：
 * - outline   描边（默认）：colorNeutralStroke1 边框，hover 变 Hover，focus 变 compound brand
 * - underline 下划线：仅底部描边
 *
 * 状态：rest / hover / focus / disabled / invalid
 * - focus 用 box-shadow 模拟 2px 描边，避免 1px→2px 撑大布局
 * - invalid 用 status danger 描边 + aria-invalid
 */
export interface FluereInputProps {
  /**
   * 尺寸
   * @default 'medium'
   */
  size?: 'small' | 'medium' | 'large'

  /**
   * 外观
   * @default 'outline'
   */
  appearance?: 'outline' | 'underline'

  /**
   * 是否禁用
   * @default false
   */
  disabled?: boolean

  /**
   * 是否为无效/错误状态
   * @default false
   */
  invalid?: boolean

  /**
   * 原生 input type
   * @default 'text'
   */
  type?: 'text' | 'password' | 'email' | 'number' | 'search' | 'tel' | 'url'

  /**
   * 占位符
   */
  placeholder?: string
}
</script>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<FluereInputProps>(), {
  size: 'medium',
  appearance: 'outline',
  disabled: false,
  invalid: false,
  type: 'text',
  placeholder: undefined,
})

const model = defineModel<string>()

const rootClass = computed(() => [
  'fui-input',
  `fui-input--${props.size}`,
  `fui-input--${props.appearance}`,
  { 'fui-input--invalid': props.invalid },
])

defineOptions({
  name: 'FluereInput',
})
</script>

<template>
  <input
    v-model="model"
    :type="type"
    :placeholder="placeholder"
    :disabled="disabled"
    :aria-invalid="invalid || undefined"
    :class="rootClass"
  />
</template>

<style scoped>
/* ------------------------------------------------------------------ */
/* 所有值均引用 Fluent 语义 token（var(--TokenName)），见 fluent-tokens  */
/* 明暗主题由 tokens.css 的 light-dark() + color-scheme 自动切换        */
/* ------------------------------------------------------------------ */

/* ---- Base ---- */
.fui-input {
  box-sizing: border-box;
  width: 100%;
  font-family: var(--fontFamilyBase);
  color: var(--colorNeutralForeground1);
  background-color: var(--colorNeutralBackground1);
  border: var(--strokeWidthThin) solid var(--colorNeutralStroke1);
  border-radius: var(--borderRadiusMedium);
  outline: none;
  transition:
    border-color var(--durationFast) var(--curveEasyEase),
    box-shadow var(--durationFast) var(--curveEasyEase);
}

/* ---- 尺寸（Fluent 高度 24/32/40） ---- */
.fui-input--small {
  height: 24px;
  padding-inline: var(--spacingHorizontalS);
  font-size: var(--fontSizeBase200);
  line-height: var(--lineHeightBase200);
}
.fui-input--medium {
  height: 32px;
  padding-inline: var(--spacingHorizontalM);
  font-size: var(--fontSizeBase300);
  line-height: var(--lineHeightBase300);
}
.fui-input--large {
  height: 40px;
  padding-inline: var(--spacingHorizontalL);
  font-size: var(--fontSizeBase400);
  line-height: var(--lineHeightBase400);
}

/* ---- 外观：underline 仅底部描边 ---- */
.fui-input--underline {
  border: none;
  border-bottom: var(--strokeWidthThin) solid var(--colorNeutralStroke1);
  border-radius: 0;
}

/* ---- 占位符 ---- */
.fui-input::placeholder {
  color: var(--colorNeutralForeground4);
}

/* ---- 状态：hover ---- */
.fui-input:hover:not(:disabled) {
  border-color: var(--colorNeutralStroke1Hover);
}
.fui-input--underline:hover:not(:disabled) {
  border-bottom-color: var(--colorNeutralStroke1Hover);
}

/* ---- 状态：focus（box-shadow 模拟 2px 描边，避免撑大布局） ---- */
.fui-input:focus-visible {
  border-color: var(--colorCompoundBrandStroke);
  box-shadow: inset 0 0 0 var(--strokeWidthThin) var(--colorCompoundBrandStroke);
}
.fui-input--underline:focus-visible {
  border-bottom-color: var(--colorCompoundBrandStroke);
  box-shadow: inset 0 calc(-1 * var(--strokeWidthThin)) 0 var(--colorCompoundBrandStroke);
}

/* ---- 状态：invalid（status danger 双通道） ---- */
.fui-input--invalid,
.fui-input--invalid:hover:not(:disabled) {
  border-color: var(--colorStatusDangerBorder2);
}
.fui-input--invalid:focus-visible {
  border-color: var(--colorStatusDangerBorder2);
  box-shadow: inset 0 0 0 var(--strokeWidthThin) var(--colorStatusDangerBorder2);
}
.fui-input--invalid.fui-input--underline,
.fui-input--invalid.fui-input--underline:hover:not(:disabled) {
  border-bottom-color: var(--colorStatusDangerBorder2);
}
.fui-input--invalid.fui-input--underline:focus-visible {
  box-shadow: inset 0 calc(-1 * var(--strokeWidthThin)) 0 var(--colorStatusDangerBorder2);
}

/* ---- 状态：disabled ---- */
.fui-input:disabled {
  background-color: var(--colorNeutralBackgroundDisabled);
  color: var(--colorNeutralForegroundDisabled);
  border-color: var(--colorNeutralStrokeDisabled);
  cursor: not-allowed;
}
.fui-input:disabled::placeholder {
  color: var(--colorNeutralForegroundDisabled);
}
.fui-input--underline:disabled {
  border-bottom-color: var(--colorNeutralStrokeDisabled);
}
</style>
