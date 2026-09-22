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
 *             Web 侧不改 border-width（避免重排挤压内容）：底边 1px 描边 + 合成背景里的
 *             1px 高亮带拼成 2px，高亮带两端呈「刀形」（上平下弧）
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
/*       保持 1px：底边由「1px 底描边 + 合成背景里的 1px 高亮带」拼成  */
/*       2px。高亮带两端是「刀形」（上平下弧），与 WinUI 底边一致       */
/*   ControlFillColorDefault / Secondary / InputActive / Disabled       */
/*       分别对应 rest / hover / focus / disabled 的填充                */
/*       （WinUI 用半透明填充给 Mica 透底；Web 侧落到不透明的           */
/*        colorNeutralBackground1 / …Hover / …Disabled，纯色底上等价）  */
/*                                                                     */
/* 三处 WinUI 原值在 Fluent web token 集中没有同值项，取语义最近者：    */
/*   ControlStrokeColorDefault       #0F000000（6% 黑）                 */
/*     → colorNeutralStrokeAlpha     rgba(0,0,0,.05)（5% 黑）/ 白 10%   */
/*   ControlStrongStrokeColorDefault #72000000（45% 黑）                */
/*     → colorNeutralStroke1 #d1d1d1（偏轻，取 Fluent 的控件描边档）    */
/*   focus 底边 SystemAccentColorDark1（Light）/ Light2（Dark）         */
/*     → colorCompoundBrandStroke（库品牌色，随 BrandVariants 走）      */
/* ------------------------------------------------------------------ */

/* 高亮色是渐变里的颜色停靠点，而 background-image 本身不可过渡；
   注册成 <color> 后，--fui-input-highlight-background 才能参与缓动 */
@property --fui-input-highlight-background {
  syntax: '<color>';
  inherits: false;
  initial-value: transparent;
}

/* ---- Base：抬升描边（顶/左/右浅、底边重）+ 底部高亮带 ---- */
.fui-input {
  /* 两个语义背景变量，换色只需覆写这两个（用更高优先级选择器，如 .my-field .fui-input）：
     - --fui-input-background           真正的背景色
     - --fui-input-highlight-background 用于显示高亮的背景色（rest 为 transparent） */
  --fui-input-background: var(--colorNeutralBackground1);
  --fui-input-highlight-background: transparent;
  /* --fui-input-highlight-background: var(--colorCompoundBrandStroke); */

  box-sizing: border-box;
  width: 100%;
  font-family: var(--fontFamilyBase);
  color: var(--colorNeutralForeground1);
  /* 合成背景 = 背景色 + 底部 1px 高亮带，与 1px 底描边拼成 WinUI focus 的 2px。
     渐变沿水平方向铺开，高亮带两端因此是「刀形」：上沿是直线，下沿随圆角收进去。
     （inset 阴影会沿 padding box 圆角把两端往上翘，呈月牙形，故不用） */
  background: var(--fui-input-background)
    linear-gradient(
      to bottom,
      transparent,
      transparent calc(100% - var(--strokeWidthThin)),
      var(--fui-input-highlight-background) calc(100% - var(--strokeWidthThin)),
      var(--fui-input-highlight-background)
    );
  background-repeat: no-repeat;
  /* BackgroundSizing="InnerBorderEdge"：填充止于描边内侧 —— 高亮带正好贴在底描边上方，
     半透明描边也叠在父级底上。background 简写会把 background-clip 重置回 border-box，
     故这条必须写在 background 之后 */
  /* background-clip: padding-box; */
  border: var(--strokeWidthThin) solid var(--colorNeutralStrokeAlpha);
  border-bottom-color: var(--colorNeutralStroke1);
  border-radius: var(--borderRadiusMedium);
  outline: none;
  transition:
    background-color var(--durationFast) var(--curveEasyEase),
    border-color var(--durationNormal) var(--curveDecelerateMid),
    --fui-input-highlight-background var(--durationNormal) var(--curveDecelerateMid);
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

/* ---- 外观：underline 只留底边（库扩展；底边用控件描边档 colorNeutralStroke1） ---- */
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
  --fui-input-background: var(--colorNeutralBackground1Hover);
}

/* ---- 状态：focus（Focused）—— 只有底边高亮 ---- */
/* 只换两个颜色：底描边 + 合成背景里的高亮带同时变强调色，拼成 2px。
   四边 border-width 全程不变，故无重排、不挤压内容；
   border-color 与高亮带色都走 durationNormal + curveDecelerateMid 缓动 */
.fui-input:focus-visible {
  --fui-input-highlight-background: var(--colorCompoundBrandStroke);
  border-color: var(--colorNeutralStrokeAlpha);
  border-bottom-color: var(--colorCompoundBrandStroke);
}

/* ---- 状态：invalid（库扩展：WinUI TextBox 无内建错误态，走 status danger） ---- */
.fui-input--invalid,
.fui-input--underline.fui-input--invalid {
  border-color: var(--colorStatusDangerBorder2);
}
.fui-input--invalid:focus-visible {
  --fui-input-highlight-background: var(--colorStatusDangerBorder2);
  border-color: var(--colorStatusDangerBorder2);
}

/* ---- 状态：disabled ---- */
/* 禁用态换成单色 ControlStrokeColorDefaultBrush：四边同色、没有抬升描边与高亮 */
.fui-input:disabled {
  --fui-input-background: var(--colorNeutralBackgroundDisabled);
  color: var(--colorNeutralForegroundDisabled);
  border-color: var(--colorNeutralStrokeDisabled);
  cursor: not-allowed;
}
.fui-input:disabled::placeholder {
  color: var(--colorNeutralForegroundDisabled);
}
</style>
