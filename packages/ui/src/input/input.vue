<script lang="ts">
/**
 * FluereInput 组件 Props 契约
 *
 * 设计规范来源：WinUI 3 / Windows App SDK — TextBox
 * （src/controls/dev/CommonStyles/TextBox_themeresources.xaml + Common_themeresources.xaml）
 * 取值一律经 Fluent 2 语义 token 落地（fluent-tokens：data/fluent-tokens.json）
 *
 * 尺寸 (size)：small (24) / medium (32，默认) / large (40)（px 高度；WinUI 默认 32）
 *
 * 外观 (appearance)：
 * - outline   描边（默认）：WinUI 的「抬升描边」TextControlElevationBorderBrush ——
 *             顶/左/右 ControlStrokeColorDefault，底边 ControlStrongStrokeColorDefault
 * - underline 下划线：只保留底边（库扩展，WinUI 无此形态）
 *
 * 交互态（对照 WinUI VisualState）：
 * - rest      ControlFillColorDefault 填充 + 抬升描边
 * - hover     PointerOver 只换填充（ControlFillColorSecondary），描边保持不变
 * - focus     Focused 底边换强调色并加粗到 2px（TextControlBorderThemeThicknessFocused = 1,1,1,2），
 *             其余三边仍是 ControlStrokeColorDefault —— 即「底部高亮」，不是四面描边。
 *             Web 侧不改 border-width（避免重排挤压内容），改用常驻的零偏移 inset 阴影
 *             在底边叠出那 1px，并给高亮加缓动
 * - invalid   库扩展（WinUI TextBox 无内建错误态）：status danger 描边 + aria-invalid
 * - disabled  ControlFillColorDisabled 填充 + 四边同色的 ControlStrokeColorDefaultBrush
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
/*                                                                     */
/* WinUI 3 对照（Windows App SDK 1.8，src/controls/dev/CommonStyles）： */
/*   TextControlElevationBorderBrush         rest / hover 描边：        */
/*       顶/左/右 ControlStrokeColorDefault（#0F000000，6% 黑）         */
/*       底      ControlStrongStrokeColorDefault（#72000000，45% 黑）   */
/*       （渐变笔刷 ScaleY=-1，故重色落在底边 —— WinUI 的「抬升描边」） */
/*   TextControlElevationBorderFocusedBrush  focus 描边：底边换强调色， */
/*       其余三边回落到 ControlStrokeColorDefault                      */
/*   TextControlBorderThemeThickness         1（四边 1px）              */
/*   TextControlBorderThemeThicknessFocused  1,1,1,2（只加粗底边）      */
/*       Web 侧不跟着改 border-width（会重排并挤压内容），四边宽度全程 */
/*       保持 1px：底边由「1px 描边 + 常驻零偏移 inset 阴影补的 1px」   */
/*       拼成 2px，focus 只改阴影偏移与颜色，纯 paint、可缓动           */
/*   ControlFillColorDefault / Secondary / InputActive / Disabled       */
/*       分别对应 rest / hover / focus / disabled 的填充                */
/*       （WinUI 用半透明填充给 Mica 透底；Web 侧落到不透明的           */
/*        colorNeutralBackground1 / …Hover / …Disabled，纯色底上等价）  */
/*                                                                     */
/* 三处 WinUI 原值在 Fluent web token 集中没有同值项，取语义最近者：    */
/*   ControlStrokeColorDefault       #0F000000（6% 黑）                 */
/*     → colorNeutralStrokeAlpha     rgba(0,0,0,.05)（5% 黑）/ 白 10%   */
/*   ControlStrongStrokeColorDefault #72000000（45% 黑）                */
/*     → colorNeutralStrokeAccessible #616161（偏重，但同为「重描边」） */
/*   focus 底边 SystemAccentColorDark1（Light）/ Light2（Dark）         */
/*     → colorCompoundBrandStroke（库品牌色，随 BrandVariants 走）      */
/* ------------------------------------------------------------------ */

/* ---- Base：抬升描边（顶/左/右浅、底边重） ---- */
.fui-input {
  box-sizing: border-box;
  width: 100%;
  font-family: var(--fontFamilyBase);
  color: var(--colorNeutralForeground1);
  background-color: var(--colorNeutralBackground1);
  /* BackgroundSizing="InnerBorderEdge"：填充止于描边内侧，
     半透明描边叠在父级底上（否则 CSS 会把描边叠在自己的填充上） */
  background-clip: padding-box;
  border: var(--strokeWidthThin) solid var(--colorNeutralStrokeAlpha);
  border-bottom-color: var(--colorNeutralStroke1);
  border-radius: var(--borderRadiusMedium);
  outline: none;
  /* 高亮层：底边常驻再叠 1px，与 1px 底描边合成 WinUI focus 的 2px。
     零偏移 inset 阴影不可见，且 box-shadow 不参与布局 —— focus 只改偏移与颜色，
     既不重排、不挤压内容，也不需要伪元素 / 额外 DOM。
     顶/左/右描边始终 1px，四边宽度全程不变。 */
  box-shadow: inset 0 0 0 0 var(--colorCompoundBrandStroke);
  transition:
    background-color var(--durationFast) var(--curveEasyEase),
    border-color var(--durationNormal) var(--curveDecelerateMid),
    box-shadow var(--durationNormal) var(--curveDecelerateMid);
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

/* ---- 外观：underline 只留底边（库扩展；底边同样用「重描边」色） ---- */
.fui-input--underline {
  border: none;
  border-bottom: var(--strokeWidthThin) solid var(--colorNeutralStroke1);
  border-radius: 0;
}

/* ---- 占位符：TextFillColorSecondary（#9E000000，62% 黑 → #616161） ---- */
.fui-input::placeholder {
  color: var(--colorNeutralForeground3);
}

/* ---- 选中文本：TextControlSelectionHighlightColor（= SystemAccentColor） ---- */
/* WinUI 只暴露高亮底色；选中文字的前景由系统挑，Web 侧取 onBrand 保证对比度 */
.fui-input::selection {
  background-color: var(--colorCompoundBrandBackground);
  color: var(--colorNeutralForegroundOnBrand);
}

/* ---- 状态：hover（PointerOver） ---- */
/* PointerOver 不改描边 —— BorderBrush 与 rest 是同一把 elevation 笔刷，
   只把填充换成 ControlFillColorSecondary。
   用 :not(:focus-visible) 还原 WinUI 的 VisualState 优先级：Focused 压过 PointerOver */
.fui-input:hover:not(:disabled):not(:focus-visible) {
  background-color: var(--colorNeutralBackground1Hover);
}

/* ---- 状态：focus（Focused）—— 只有底边高亮 ---- */
/* 底边由「1px 描边 + 1px 高亮层」拼成 2px，四边宽度不变：
   不动 border-width，故无重排、无内容挤压；高亮层是 paint-only 的 inset 阴影。
   border-color 与 box-shadow 走 durationNormal + curveDecelerateMid 缓动 */
.fui-input:focus-visible {
  border-color: var(--colorNeutralStrokeAlpha);
  border-bottom-color: var(--colorCompoundBrandStroke);
  box-shadow: inset 0 calc(-1 * var(--strokeWidthThin)) 0 0 var(--colorCompoundBrandStroke);
}

/* ---- 状态：invalid（库扩展：WinUI TextBox 无内建错误态，走 status danger） ---- */
.fui-input--invalid,
.fui-input--underline.fui-input--invalid {
  border-color: var(--colorStatusDangerBorder2);
  box-shadow: inset 0 0 0 0 var(--colorStatusDangerBorder2);
}
.fui-input--invalid:focus-visible {
  border-color: var(--colorStatusDangerBorder2);
  box-shadow: inset 0 calc(-1 * var(--strokeWidthThin)) 0 0 var(--colorStatusDangerBorder2);
}

/* ---- 状态：disabled ---- */
/* 禁用态换成单色 ControlStrokeColorDefaultBrush：四边同色、没有抬升描边与高亮层 */
.fui-input:disabled {
  background-color: var(--colorNeutralBackgroundDisabled);
  color: var(--colorNeutralForegroundDisabled);
  border-color: var(--colorNeutralStrokeDisabled);
  box-shadow: none;
  cursor: not-allowed;
}
.fui-input:disabled::placeholder {
  color: var(--colorNeutralForegroundDisabled);
}
</style>
