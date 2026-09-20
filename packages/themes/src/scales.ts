import { tokens } from '@fluentui/tokens'

/**
 * 圆角令牌
 */
const borderRadius = {
  '2xlarge': tokens.borderRadius2XLarge,
  '3xlarge': tokens.borderRadius3XLarge,
  '4xlarge': tokens.borderRadius4XLarge,
  '5xlarge': tokens.borderRadius5XLarge,
  '6xlarge': tokens.borderRadius6XLarge,
  'circular': tokens.borderRadiusCircular,
  'large': tokens.borderRadiusLarge,
  'medium': tokens.borderRadiusMedium,
  'none': tokens.borderRadiusNone,
  'small': tokens.borderRadiusSmall,
  'xlarge': tokens.borderRadiusXLarge,
}

/**
 * 字体族令牌
 */
const fontFamily = {
  base: tokens.fontFamilyBase,
  mono: tokens.fontFamilyMonospace,
  numeric: tokens.fontFamilyNumeric,
}

/**
 * 字号令牌
 * Base 系列用于正文，Hero 系列用于标题
 */
const fontSize = {
  'base-100': tokens.fontSizeBase100,
  'base-200': tokens.fontSizeBase200,
  'base-300': tokens.fontSizeBase300,
  'base-400': tokens.fontSizeBase400,
  'base-500': tokens.fontSizeBase500,
  'base-600': tokens.fontSizeBase600,
  'hero-1000': tokens.fontSizeHero1000,
  'hero-700': tokens.fontSizeHero700,
  'hero-800': tokens.fontSizeHero800,
  'hero-900': tokens.fontSizeHero900,
}

/**
 * 字重令牌
 */
const fontWeight = {
  bold: tokens.fontWeightBold,
  medium: tokens.fontWeightMedium,
  regular: tokens.fontWeightRegular,
  semibold: tokens.fontWeightSemibold,
}

/**
 * 行高令牌
 */
const lineHeight = {
  'base-100': tokens.lineHeightBase100,
  'base-200': tokens.lineHeightBase200,
  'base-300': tokens.lineHeightBase300,
  'base-400': tokens.lineHeightBase400,
  'base-500': tokens.lineHeightBase500,
  'base-600': tokens.lineHeightBase600,
  'hero-1000': tokens.lineHeightHero1000,
  'hero-700': tokens.lineHeightHero700,
  'hero-800': tokens.lineHeightHero800,
  'hero-900': tokens.lineHeightHero900,
}

/**
 * 阴影令牌
 * 数字表示阴影深度（2 / 4 / 8 / 16 / 28 / 64）
 */
const boxShadow = {
  '16': tokens.shadow16,
  '16-brand': tokens.shadow16Brand,
  '2': tokens.shadow2,
  '2-brand': tokens.shadow2Brand,
  '28': tokens.shadow28,
  '28-brand': tokens.shadow28Brand,
  '4': tokens.shadow4,
  '4-brand': tokens.shadow4Brand,
  '64': tokens.shadow64,
  '64-brand': tokens.shadow64Brand,
  '8': tokens.shadow8,
  '8-brand': tokens.shadow8Brand,
}

/**
 * 描边宽度令牌
 */
const borderWidth = {
  thick: tokens.strokeWidthThick,
  thicker: tokens.strokeWidthThicker,
  thickest: tokens.strokeWidthThickest,
  thin: tokens.strokeWidthThin,
}

/**
 * 水平间距令牌
 * 命名规则：s (small), m (medium), l (large), xl (extra large) ...
 */
const spacingHorizontal = {
  'l': tokens.spacingHorizontalL,
  'm': tokens.spacingHorizontalM,
  'm-nudge': tokens.spacingHorizontalMNudge,
  'none': tokens.spacingHorizontalNone,
  's': tokens.spacingHorizontalS,
  's-nudge': tokens.spacingHorizontalSNudge,
  'xl': tokens.spacingHorizontalXL,
  'xs': tokens.spacingHorizontalXS,
  'xxl': tokens.spacingHorizontalXXL,
  'xxs': tokens.spacingHorizontalXXS,
  'xxxl': tokens.spacingHorizontalXXXL,
}

/**
 * 垂直间距令牌
 */
const spacingVertical = {
  'l': tokens.spacingVerticalL,
  'm': tokens.spacingVerticalM,
  'm-nudge': tokens.spacingVerticalMNudge,
  'none': tokens.spacingVerticalNone,
  's': tokens.spacingVerticalS,
  's-nudge': tokens.spacingVerticalSNudge,
  'xl': tokens.spacingVerticalXL,
  'xs': tokens.spacingVerticalXS,
  'xxl': tokens.spacingVerticalXXL,
  'xxs': tokens.spacingVerticalXXS,
  'xxxl': tokens.spacingVerticalXXXL,
}

/**
 * 统一间距（同时用于水平和垂直）
 * UnoCSS 的 spacing 同时用于 padding/margin/gap 等
 */
const spacing = {
  'l': tokens.spacingHorizontalL,
  'm': tokens.spacingHorizontalM,
  'm-nudge': tokens.spacingHorizontalMNudge,
  'none': tokens.spacingHorizontalNone,
  's': tokens.spacingHorizontalS,
  's-nudge': tokens.spacingHorizontalSNudge,
  'xl': tokens.spacingHorizontalXL,
  'xs': tokens.spacingHorizontalXS,
  'xxl': tokens.spacingHorizontalXXL,
  'xxs': tokens.spacingHorizontalXXS,
  'xxxl': tokens.spacingHorizontalXXXL,
}

export {
  borderRadius,
  fontFamily,
  fontSize,
  fontWeight,
  lineHeight,
  boxShadow,
  borderWidth,
  spacingHorizontal,
  spacingVertical,
  spacing,
}
