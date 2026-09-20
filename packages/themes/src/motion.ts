import { tokens } from '@fluentui/tokens'

/**
 * 动画时长令牌
 */
const duration = {
  'fast': tokens.durationFast,
  'faster': tokens.durationFaster,
  'gentle': tokens.durationGentle,
  'normal': tokens.durationNormal,
  'slow': tokens.durationSlow,
  'slower': tokens.durationSlower,
  'ultra-fast': tokens.durationUltraFast,
  'ultra-slow': tokens.durationUltraSlow,
}

/**
 * 动画缓动曲线令牌
 */
const easing = {
  'accelerate-max': tokens.curveAccelerateMax,
  'accelerate-mid': tokens.curveAccelerateMid,
  'accelerate-min': tokens.curveAccelerateMin,
  'decelerate-max': tokens.curveDecelerateMax,
  'decelerate-mid': tokens.curveDecelerateMid,
  'decelerate-min': tokens.curveDecelerateMin,
  'easy-ease': tokens.curveEasyEase,
  'easy-ease-max': tokens.curveEasyEaseMax,
  'linear': tokens.curveLinear,
}

/**
 * 层级（z-index）令牌
 */
const zIndex = {
  background: tokens.zIndexBackground,
  content: tokens.zIndexContent,
  debug: tokens.zIndexDebug,
  floating: tokens.zIndexFloating,
  messages: tokens.zIndexMessages,
  overlay: tokens.zIndexOverlay,
  popup: tokens.zIndexPopup,
  priority: tokens.zIndexPriority,
}

/**
 * 排版样式预设
 * 对应 Fluent 的 typographyStyles，包含 fontSize / fontWeight / lineHeight / fontFamily 的组合
 * 可在 UnoCSS shortcuts 或组件中直接使用
 */
const typographyStyles = {
  body1: {
    fontFamily: tokens.fontFamilyBase,
    fontSize: tokens.fontSizeBase300,
    fontWeight: tokens.fontWeightRegular,
    lineHeight: tokens.lineHeightBase300,
  },
  body1Strong: {
    fontFamily: tokens.fontFamilyBase,
    fontSize: tokens.fontSizeBase300,
    fontWeight: tokens.fontWeightSemibold,
    lineHeight: tokens.lineHeightBase300,
  },
  body1Stronger: {
    fontFamily: tokens.fontFamilyBase,
    fontSize: tokens.fontSizeBase300,
    fontWeight: tokens.fontWeightBold,
    lineHeight: tokens.lineHeightBase300,
  },
  body2: {
    fontFamily: tokens.fontFamilyBase,
    fontSize: tokens.fontSizeBase400,
    fontWeight: tokens.fontWeightRegular,
    lineHeight: tokens.lineHeightBase400,
  },
  caption1: {
    fontFamily: tokens.fontFamilyBase,
    fontSize: tokens.fontSizeBase200,
    fontWeight: tokens.fontWeightRegular,
    lineHeight: tokens.lineHeightBase200,
  },
  caption1Strong: {
    fontFamily: tokens.fontFamilyBase,
    fontSize: tokens.fontSizeBase200,
    fontWeight: tokens.fontWeightSemibold,
    lineHeight: tokens.lineHeightBase200,
  },
  caption1Stronger: {
    fontFamily: tokens.fontFamilyBase,
    fontSize: tokens.fontSizeBase200,
    fontWeight: tokens.fontWeightBold,
    lineHeight: tokens.lineHeightBase200,
  },
  caption2: {
    fontFamily: tokens.fontFamilyBase,
    fontSize: tokens.fontSizeBase100,
    fontWeight: tokens.fontWeightRegular,
    lineHeight: tokens.lineHeightBase100,
  },
  caption2Strong: {
    fontFamily: tokens.fontFamilyBase,
    fontSize: tokens.fontSizeBase100,
    fontWeight: tokens.fontWeightSemibold,
    lineHeight: tokens.lineHeightBase100,
  },
  display: {
    fontFamily: tokens.fontFamilyBase,
    fontSize: tokens.fontSizeHero1000,
    fontWeight: tokens.fontWeightSemibold,
    lineHeight: tokens.lineHeightHero1000,
  },
  largeTitle: {
    fontFamily: tokens.fontFamilyBase,
    fontSize: tokens.fontSizeHero900,
    fontWeight: tokens.fontWeightSemibold,
    lineHeight: tokens.lineHeightHero900,
  },
  subtitle1: {
    fontFamily: tokens.fontFamilyBase,
    fontSize: tokens.fontSizeBase500,
    fontWeight: tokens.fontWeightSemibold,
    lineHeight: tokens.lineHeightBase500,
  },
  subtitle2: {
    fontFamily: tokens.fontFamilyBase,
    fontSize: tokens.fontSizeBase400,
    fontWeight: tokens.fontWeightSemibold,
    lineHeight: tokens.lineHeightBase400,
  },
  subtitle2Stronger: {
    fontFamily: tokens.fontFamilyBase,
    fontSize: tokens.fontSizeBase400,
    fontWeight: tokens.fontWeightBold,
    lineHeight: tokens.lineHeightBase400,
  },
  title1: {
    fontFamily: tokens.fontFamilyBase,
    fontSize: tokens.fontSizeHero800,
    fontWeight: tokens.fontWeightSemibold,
    lineHeight: tokens.lineHeightHero800,
  },
  title2: {
    fontFamily: tokens.fontFamilyBase,
    fontSize: tokens.fontSizeHero700,
    fontWeight: tokens.fontWeightSemibold,
    lineHeight: tokens.lineHeightHero700,
  },
  title3: {
    fontFamily: tokens.fontFamilyBase,
    fontSize: tokens.fontSizeBase600,
    fontWeight: tokens.fontWeightSemibold,
    lineHeight: tokens.lineHeightBase600,
  },
}

export { duration, easing, zIndex, typographyStyles }
export type FluentTypographyStyles = typeof typographyStyles
