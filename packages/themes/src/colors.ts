import { tokens } from '@fluentui/tokens'

/**
 * 语义化颜色令牌
 * 对应 Fluent Design 中的 Neutral / Brand / Status / Palette 等色彩体系
 * 值均为 CSS 变量引用 (var(--xxx))，天然支持主题切换
 */
export const colors = {
  /* -------------------------------------------------------------------------- */
  /*                               Neutral - 中性色                              */
  /* -------------------------------------------------------------------------- */

  neutral: {
    // 前景色（文字/图标）
    foreground1: tokens.colorNeutralForeground1,
    foreground1Hover: tokens.colorNeutralForeground1Hover,
    foreground1Pressed: tokens.colorNeutralForeground1Pressed,
    foreground1Selected: tokens.colorNeutralForeground1Selected,
    foreground2: tokens.colorNeutralForeground2,
    foreground2Hover: tokens.colorNeutralForeground2Hover,
    foreground2Pressed: tokens.colorNeutralForeground2Pressed,
    foreground2Selected: tokens.colorNeutralForeground2Selected,
    foreground2BrandHover: tokens.colorNeutralForeground2BrandHover,
    foreground2BrandPressed: tokens.colorNeutralForeground2BrandPressed,
    foreground2BrandSelected: tokens.colorNeutralForeground2BrandSelected,
    foreground3: tokens.colorNeutralForeground3,
    foreground3Hover: tokens.colorNeutralForeground3Hover,
    foreground3Pressed: tokens.colorNeutralForeground3Pressed,
    foreground3Selected: tokens.colorNeutralForeground3Selected,
    foreground3BrandHover: tokens.colorNeutralForeground3BrandHover,
    foreground3BrandPressed: tokens.colorNeutralForeground3BrandPressed,
    foreground3BrandSelected: tokens.colorNeutralForeground3BrandSelected,
    foreground4: tokens.colorNeutralForeground4,
    foreground5: tokens.colorNeutralForeground5,
    foreground5Hover: tokens.colorNeutralForeground5Hover,
    foreground5Pressed: tokens.colorNeutralForeground5Pressed,
    foreground5Selected: tokens.colorNeutralForeground5Selected,
    foregroundDisabled: tokens.colorNeutralForegroundDisabled,
    foregroundOnBrand: tokens.colorNeutralForegroundOnBrand,
    foregroundInverted: tokens.colorNeutralForegroundInverted,
    foregroundInvertedHover: tokens.colorNeutralForegroundInvertedHover,
    foregroundInvertedPressed: tokens.colorNeutralForegroundInvertedPressed,
    foregroundInvertedSelected: tokens.colorNeutralForegroundInvertedSelected,
    foregroundInverted2: tokens.colorNeutralForegroundInverted2,
    foregroundStaticInverted: tokens.colorNeutralForegroundStaticInverted,
    foregroundInvertedLink: tokens.colorNeutralForegroundInvertedLink,
    foregroundInvertedLinkHover: tokens.colorNeutralForegroundInvertedLinkHover,
    foregroundInvertedLinkPressed: tokens.colorNeutralForegroundInvertedLinkPressed,
    foregroundInvertedLinkSelected: tokens.colorNeutralForegroundInvertedLinkSelected,
    foregroundInvertedDisabled: tokens.colorNeutralForegroundInvertedDisabled,
    foreground1Static: tokens.colorNeutralForeground1Static,
    foreground2Link: tokens.colorNeutralForeground2Link,
    foreground2LinkHover: tokens.colorNeutralForeground2LinkHover,
    foreground2LinkPressed: tokens.colorNeutralForeground2LinkPressed,
    foreground2LinkSelected: tokens.colorNeutralForeground2LinkSelected,

    // 背景色
    background1: tokens.colorNeutralBackground1,
    background1Hover: tokens.colorNeutralBackground1Hover,
    background1Pressed: tokens.colorNeutralBackground1Pressed,
    background1Selected: tokens.colorNeutralBackground1Selected,
    background2: tokens.colorNeutralBackground2,
    background2Hover: tokens.colorNeutralBackground2Hover,
    background2Pressed: tokens.colorNeutralBackground2Pressed,
    background2Selected: tokens.colorNeutralBackground2Selected,
    background3: tokens.colorNeutralBackground3,
    background3Hover: tokens.colorNeutralBackground3Hover,
    background3Pressed: tokens.colorNeutralBackground3Pressed,
    background3Selected: tokens.colorNeutralBackground3Selected,
    background4: tokens.colorNeutralBackground4,
    background4Hover: tokens.colorNeutralBackground4Hover,
    background4Pressed: tokens.colorNeutralBackground4Pressed,
    background4Selected: tokens.colorNeutralBackground4Selected,
    background5: tokens.colorNeutralBackground5,
    background5Hover: tokens.colorNeutralBackground5Hover,
    background5Pressed: tokens.colorNeutralBackground5Pressed,
    background5Selected: tokens.colorNeutralBackground5Selected,
    background6: tokens.colorNeutralBackground6,
    background7: tokens.colorNeutralBackground7,
    background7Hover: tokens.colorNeutralBackground7Hover,
    background7Pressed: tokens.colorNeutralBackground7Pressed,
    background7Selected: tokens.colorNeutralBackground7Selected,
    background8: tokens.colorNeutralBackground8,
    backgroundInverted: tokens.colorNeutralBackgroundInverted,
    backgroundInvertedHover: tokens.colorNeutralBackgroundInvertedHover,
    backgroundInvertedPressed: tokens.colorNeutralBackgroundInvertedPressed,
    backgroundInvertedSelected: tokens.colorNeutralBackgroundInvertedSelected,
    backgroundStatic: tokens.colorNeutralBackgroundStatic,
    backgroundAlpha: tokens.colorNeutralBackgroundAlpha,
    backgroundAlpha2: tokens.colorNeutralBackgroundAlpha2,
    backgroundDisabled: tokens.colorNeutralBackgroundDisabled,
    backgroundDisabled2: tokens.colorNeutralBackgroundDisabled2,
    backgroundInvertedDisabled: tokens.colorNeutralBackgroundInvertedDisabled,

    // 描边色
    strokeAccessible: tokens.colorNeutralStrokeAccessible,
    strokeAccessibleHover: tokens.colorNeutralStrokeAccessibleHover,
    strokeAccessiblePressed: tokens.colorNeutralStrokeAccessiblePressed,
    strokeAccessibleSelected: tokens.colorNeutralStrokeAccessibleSelected,
    stroke1: tokens.colorNeutralStroke1,
    stroke1Hover: tokens.colorNeutralStroke1Hover,
    stroke1Pressed: tokens.colorNeutralStroke1Pressed,
    stroke1Selected: tokens.colorNeutralStroke1Selected,
    stroke2: tokens.colorNeutralStroke2,
    stroke3: tokens.colorNeutralStroke3,
    stroke4: tokens.colorNeutralStroke4,
    stroke4Hover: tokens.colorNeutralStroke4Hover,
    stroke4Pressed: tokens.colorNeutralStroke4Pressed,
    stroke4Selected: tokens.colorNeutralStroke4Selected,
    strokeSubtle: tokens.colorNeutralStrokeSubtle,
    strokeOnBrand: tokens.colorNeutralStrokeOnBrand,
    strokeOnBrand2: tokens.colorNeutralStrokeOnBrand2,
    strokeOnBrand2Hover: tokens.colorNeutralStrokeOnBrand2Hover,
    strokeOnBrand2Pressed: tokens.colorNeutralStrokeOnBrand2Pressed,
    strokeOnBrand2Selected: tokens.colorNeutralStrokeOnBrand2Selected,
    strokeDisabled: tokens.colorNeutralStrokeDisabled,
    strokeDisabled2: tokens.colorNeutralStrokeDisabled2,
    strokeInvertedDisabled: tokens.colorNeutralStrokeInvertedDisabled,
    strokeAlpha: tokens.colorNeutralStrokeAlpha,
    strokeAlpha2: tokens.colorNeutralStrokeAlpha2,

    // 阴影色
    shadowAmbient: tokens.colorNeutralShadowAmbient,
    shadowKey: tokens.colorNeutralShadowKey,
    shadowAmbientLighter: tokens.colorNeutralShadowAmbientLighter,
    shadowKeyLighter: tokens.colorNeutralShadowKeyLighter,
    shadowAmbientDarker: tokens.colorNeutralShadowAmbientDarker,
    shadowKeyDarker: tokens.colorNeutralShadowKeyDarker,

    // 其他
    stencil1: tokens.colorNeutralStencil1,
    stencil2: tokens.colorNeutralStencil2,
    stencil1Alpha: tokens.colorNeutralStencil1Alpha,
    stencil2Alpha: tokens.colorNeutralStencil2Alpha,

    // 卡片
    cardBackground: tokens.colorNeutralCardBackground,
    cardBackgroundHover: tokens.colorNeutralCardBackgroundHover,
    cardBackgroundPressed: tokens.colorNeutralCardBackgroundPressed,
    cardBackgroundSelected: tokens.colorNeutralCardBackgroundSelected,
    cardBackgroundDisabled: tokens.colorNeutralCardBackgroundDisabled,
  },

  /* -------------------------------------------------------------------------- */
  /*                                Brand - 品牌色                               */
  /* -------------------------------------------------------------------------- */

  brand: {
    background: tokens.colorBrandBackground,
    background2: tokens.colorBrandBackground2,
    background2Hover: tokens.colorBrandBackground2Hover,
    background2Pressed: tokens.colorBrandBackground2Pressed,
    background3Static: tokens.colorBrandBackground3Static,
    background4Static: tokens.colorBrandBackground4Static,
    backgroundHover: tokens.colorBrandBackgroundHover,
    backgroundInverted: tokens.colorBrandBackgroundInverted,
    backgroundInvertedHover: tokens.colorBrandBackgroundInvertedHover,
    backgroundInvertedPressed: tokens.colorBrandBackgroundInvertedPressed,
    backgroundInvertedSelected: tokens.colorBrandBackgroundInvertedSelected,
    backgroundPressed: tokens.colorBrandBackgroundPressed,
    backgroundSelected: tokens.colorBrandBackgroundSelected,
    backgroundStatic: tokens.colorBrandBackgroundStatic,
    foreground1: tokens.colorBrandForeground1,
    foreground2: tokens.colorBrandForeground2,
    foreground2Hover: tokens.colorBrandForeground2Hover,
    foreground2Pressed: tokens.colorBrandForeground2Pressed,
    foregroundInverted: tokens.colorBrandForegroundInverted,
    foregroundInvertedHover: tokens.colorBrandForegroundInvertedHover,
    foregroundInvertedPressed: tokens.colorBrandForegroundInvertedPressed,
    foregroundLink: tokens.colorBrandForegroundLink,
    foregroundLinkHover: tokens.colorBrandForegroundLinkHover,
    foregroundLinkPressed: tokens.colorBrandForegroundLinkPressed,
    foregroundLinkSelected: tokens.colorBrandForegroundLinkSelected,
    foregroundOnLight: tokens.colorBrandForegroundOnLight,
    foregroundOnLightHover: tokens.colorBrandForegroundOnLightHover,
    foregroundOnLightPressed: tokens.colorBrandForegroundOnLightPressed,
    foregroundOnLightSelected: tokens.colorBrandForegroundOnLightSelected,
    shadowAmbient: tokens.colorBrandShadowAmbient,
    shadowKey: tokens.colorBrandShadowKey,
    stroke1: tokens.colorBrandStroke1,
    stroke2: tokens.colorBrandStroke2,
    stroke2Contrast: tokens.colorBrandStroke2Contrast,
    stroke2Hover: tokens.colorBrandStroke2Hover,
    stroke2Pressed: tokens.colorBrandStroke2Pressed,
  },

  /* -------------------------------------------------------------------------- */
  /*                          Compound Brand - 复合品牌色                         */
  /* -------------------------------------------------------------------------- */

  compoundBrand: {
    background: tokens.colorCompoundBrandBackground,
    backgroundHover: tokens.colorCompoundBrandBackgroundHover,
    backgroundPressed: tokens.colorCompoundBrandBackgroundPressed,
    foreground1: tokens.colorCompoundBrandForeground1,
    foreground1Hover: tokens.colorCompoundBrandForeground1Hover,
    foreground1Pressed: tokens.colorCompoundBrandForeground1Pressed,
    stroke: tokens.colorCompoundBrandStroke,
    strokeHover: tokens.colorCompoundBrandStrokeHover,
    strokePressed: tokens.colorCompoundBrandStrokePressed,
  },

  /* -------------------------------------------------------------------------- */
  /*                            Subtle - 微妙背景色                              */
  /* -------------------------------------------------------------------------- */

  subtle: {
    background: tokens.colorSubtleBackground,
    backgroundHover: tokens.colorSubtleBackgroundHover,
    backgroundInverted: tokens.colorSubtleBackgroundInverted,
    backgroundInvertedHover: tokens.colorSubtleBackgroundInvertedHover,
    backgroundInvertedPressed: tokens.colorSubtleBackgroundInvertedPressed,
    backgroundInvertedSelected: tokens.colorSubtleBackgroundInvertedSelected,
    backgroundLightAlphaHover: tokens.colorSubtleBackgroundLightAlphaHover,
    backgroundLightAlphaPressed: tokens.colorSubtleBackgroundLightAlphaPressed,
    backgroundLightAlphaSelected: tokens.colorSubtleBackgroundLightAlphaSelected,
    backgroundPressed: tokens.colorSubtleBackgroundPressed,
    backgroundSelected: tokens.colorSubtleBackgroundSelected,
  },

  /* -------------------------------------------------------------------------- */
  /*                           Transparent - 透明背景色                           */
  /* -------------------------------------------------------------------------- */

  transparent: {
    background: tokens.colorTransparentBackground,
    backgroundHover: tokens.colorTransparentBackgroundHover,
    backgroundPressed: tokens.colorTransparentBackgroundPressed,
    backgroundSelected: tokens.colorTransparentBackgroundSelected,
    stroke: tokens.colorTransparentStroke,
    strokeDisabled: tokens.colorTransparentStrokeDisabled,
    strokeInteractive: tokens.colorTransparentStrokeInteractive,
  },

  /* -------------------------------------------------------------------------- */
  /*                            Focus - 焦点描边色                               */
  /* -------------------------------------------------------------------------- */

  strokeFocus: {
    1: tokens.colorStrokeFocus1,
    2: tokens.colorStrokeFocus2,
  },

  /* -------------------------------------------------------------------------- */
  /*                                 其他全局色                                  */
  /* -------------------------------------------------------------------------- */

  backgroundOverlay: tokens.colorBackgroundOverlay,
  scrollbarOverlay: tokens.colorScrollbarOverlay,

  /* -------------------------------------------------------------------------- */
  /*                            Status - 状态色（语义）                           */
  /* -------------------------------------------------------------------------- */

  status: {
    danger: {
      background1: tokens.colorStatusDangerBackground1,
      background2: tokens.colorStatusDangerBackground2,
      background3: tokens.colorStatusDangerBackground3,
      background3Hover: tokens.colorStatusDangerBackground3Hover,
      background3Pressed: tokens.colorStatusDangerBackground3Pressed,
      border1: tokens.colorStatusDangerBorder1,
      border2: tokens.colorStatusDangerBorder2,
      borderActive: tokens.colorStatusDangerBorderActive,
      foreground1: tokens.colorStatusDangerForeground1,
      foreground2: tokens.colorStatusDangerForeground2,
      foreground3: tokens.colorStatusDangerForeground3,
      foregroundInverted: tokens.colorStatusDangerForegroundInverted,
    },
    success: {
      background1: tokens.colorStatusSuccessBackground1,
      background2: tokens.colorStatusSuccessBackground2,
      background3: tokens.colorStatusSuccessBackground3,
      border1: tokens.colorStatusSuccessBorder1,
      border2: tokens.colorStatusSuccessBorder2,
      borderActive: tokens.colorStatusSuccessBorderActive,
      foreground1: tokens.colorStatusSuccessForeground1,
      foreground2: tokens.colorStatusSuccessForeground2,
      foreground3: tokens.colorStatusSuccessForeground3,
      foregroundInverted: tokens.colorStatusSuccessForegroundInverted,
    },
    warning: {
      background1: tokens.colorStatusWarningBackground1,
      background2: tokens.colorStatusWarningBackground2,
      background3: tokens.colorStatusWarningBackground3,
      border1: tokens.colorStatusWarningBorder1,
      border2: tokens.colorStatusWarningBorder2,
      borderActive: tokens.colorStatusWarningBorderActive,
      foreground1: tokens.colorStatusWarningForeground1,
      foreground2: tokens.colorStatusWarningForeground2,
      foreground3: tokens.colorStatusWarningForeground3,
      foregroundInverted: tokens.colorStatusWarningForegroundInverted,
    },
  },

  /* -------------------------------------------------------------------------- */
  /*                            Palette - 调色板色                                */
  /* -------------------------------------------------------------------------- */

  palette: {
    anchor: {
      background2: tokens.colorPaletteAnchorBackground2,
      borderActive: tokens.colorPaletteAnchorBorderActive,
      foreground2: tokens.colorPaletteAnchorForeground2,
    },
    beige: {
      background2: tokens.colorPaletteBeigeBackground2,
      borderActive: tokens.colorPaletteBeigeBorderActive,
      foreground2: tokens.colorPaletteBeigeForeground2,
    },
    berry: {
      background1: tokens.colorPaletteBerryBackground1,
      background2: tokens.colorPaletteBerryBackground2,
      background3: tokens.colorPaletteBerryBackground3,
      border1: tokens.colorPaletteBerryBorder1,
      border2: tokens.colorPaletteBerryBorder2,
      borderActive: tokens.colorPaletteBerryBorderActive,
      foreground1: tokens.colorPaletteBerryForeground1,
      foreground2: tokens.colorPaletteBerryForeground2,
      foreground3: tokens.colorPaletteBerryForeground3,
    },
    blue: {
      background2: tokens.colorPaletteBlueBackground2,
      borderActive: tokens.colorPaletteBlueBorderActive,
      foreground2: tokens.colorPaletteBlueForeground2,
    },
    brass: {
      background2: tokens.colorPaletteBrassBackground2,
      borderActive: tokens.colorPaletteBrassBorderActive,
      foreground2: tokens.colorPaletteBrassForeground2,
    },
    brown: {
      background2: tokens.colorPaletteBrownBackground2,
      borderActive: tokens.colorPaletteBrownBorderActive,
      foreground2: tokens.colorPaletteBrownForeground2,
    },
    cornflower: {
      background2: tokens.colorPaletteCornflowerBackground2,
      borderActive: tokens.colorPaletteCornflowerBorderActive,
      foreground2: tokens.colorPaletteCornflowerForeground2,
    },
    cranberry: {
      background2: tokens.colorPaletteCranberryBackground2,
      borderActive: tokens.colorPaletteCranberryBorderActive,
      foreground2: tokens.colorPaletteCranberryForeground2,
    },
    darkGreen: {
      background2: tokens.colorPaletteDarkGreenBackground2,
      borderActive: tokens.colorPaletteDarkGreenBorderActive,
      foreground2: tokens.colorPaletteDarkGreenForeground2,
    },
    darkOrange: {
      background1: tokens.colorPaletteDarkOrangeBackground1,
      background2: tokens.colorPaletteDarkOrangeBackground2,
      background3: tokens.colorPaletteDarkOrangeBackground3,
      border1: tokens.colorPaletteDarkOrangeBorder1,
      border2: tokens.colorPaletteDarkOrangeBorder2,
      borderActive: tokens.colorPaletteDarkOrangeBorderActive,
      foreground1: tokens.colorPaletteDarkOrangeForeground1,
      foreground2: tokens.colorPaletteDarkOrangeForeground2,
      foreground3: tokens.colorPaletteDarkOrangeForeground3,
    },
    darkRed: {
      background2: tokens.colorPaletteDarkRedBackground2,
      borderActive: tokens.colorPaletteDarkRedBorderActive,
      foreground2: tokens.colorPaletteDarkRedForeground2,
    },
    forest: {
      background2: tokens.colorPaletteForestBackground2,
      borderActive: tokens.colorPaletteForestBorderActive,
      foreground2: tokens.colorPaletteForestForeground2,
    },
    gold: {
      background2: tokens.colorPaletteGoldBackground2,
      borderActive: tokens.colorPaletteGoldBorderActive,
      foreground2: tokens.colorPaletteGoldForeground2,
    },
    grape: {
      background2: tokens.colorPaletteGrapeBackground2,
      borderActive: tokens.colorPaletteGrapeBorderActive,
      foreground2: tokens.colorPaletteGrapeForeground2,
    },
    green: {
      background1: tokens.colorPaletteGreenBackground1,
      background2: tokens.colorPaletteGreenBackground2,
      background3: tokens.colorPaletteGreenBackground3,
      border1: tokens.colorPaletteGreenBorder1,
      border2: tokens.colorPaletteGreenBorder2,
      borderActive: tokens.colorPaletteGreenBorderActive,
      foreground1: tokens.colorPaletteGreenForeground1,
      foreground2: tokens.colorPaletteGreenForeground2,
      foreground3: tokens.colorPaletteGreenForeground3,
      foregroundInverted: tokens.colorPaletteGreenForegroundInverted,
    },
    lavender: {
      background2: tokens.colorPaletteLavenderBackground2,
      borderActive: tokens.colorPaletteLavenderBorderActive,
      foreground2: tokens.colorPaletteLavenderForeground2,
    },
    lightGreen: {
      background1: tokens.colorPaletteLightGreenBackground1,
      background2: tokens.colorPaletteLightGreenBackground2,
      background3: tokens.colorPaletteLightGreenBackground3,
      border1: tokens.colorPaletteLightGreenBorder1,
      border2: tokens.colorPaletteLightGreenBorder2,
      borderActive: tokens.colorPaletteLightGreenBorderActive,
      foreground1: tokens.colorPaletteLightGreenForeground1,
      foreground2: tokens.colorPaletteLightGreenForeground2,
      foreground3: tokens.colorPaletteLightGreenForeground3,
    },
    lightTeal: {
      background2: tokens.colorPaletteLightTealBackground2,
      borderActive: tokens.colorPaletteLightTealBorderActive,
      foreground2: tokens.colorPaletteLightTealForeground2,
    },
    lilac: {
      background2: tokens.colorPaletteLilacBackground2,
      borderActive: tokens.colorPaletteLilacBorderActive,
      foreground2: tokens.colorPaletteLilacForeground2,
    },
    magenta: {
      background2: tokens.colorPaletteMagentaBackground2,
      borderActive: tokens.colorPaletteMagentaBorderActive,
      foreground2: tokens.colorPaletteMagentaForeground2,
    },
    marigold: {
      background1: tokens.colorPaletteMarigoldBackground1,
      background2: tokens.colorPaletteMarigoldBackground2,
      background3: tokens.colorPaletteMarigoldBackground3,
      border1: tokens.colorPaletteMarigoldBorder1,
      border2: tokens.colorPaletteMarigoldBorder2,
      borderActive: tokens.colorPaletteMarigoldBorderActive,
      foreground1: tokens.colorPaletteMarigoldForeground1,
      foreground2: tokens.colorPaletteMarigoldForeground2,
      foreground3: tokens.colorPaletteMarigoldForeground3,
    },
    mink: {
      background2: tokens.colorPaletteMinkBackground2,
      borderActive: tokens.colorPaletteMinkBorderActive,
      foreground2: tokens.colorPaletteMinkForeground2,
    },
    navy: {
      background2: tokens.colorPaletteNavyBackground2,
      borderActive: tokens.colorPaletteNavyBorderActive,
      foreground2: tokens.colorPaletteNavyForeground2,
    },
    peach: {
      background2: tokens.colorPalettePeachBackground2,
      borderActive: tokens.colorPalettePeachBorderActive,
      foreground2: tokens.colorPalettePeachForeground2,
    },
    pink: {
      background2: tokens.colorPalettePinkBackground2,
      borderActive: tokens.colorPalettePinkBorderActive,
      foreground2: tokens.colorPalettePinkForeground2,
    },
    platinum: {
      background2: tokens.colorPalettePlatinumBackground2,
      borderActive: tokens.colorPalettePlatinumBorderActive,
      foreground2: tokens.colorPalettePlatinumForeground2,
    },
    plum: {
      background2: tokens.colorPalettePlumBackground2,
      borderActive: tokens.colorPalettePlumBorderActive,
      foreground2: tokens.colorPalettePlumForeground2,
    },
    pumpkin: {
      background2: tokens.colorPalettePumpkinBackground2,
      borderActive: tokens.colorPalettePumpkinBorderActive,
      foreground2: tokens.colorPalettePumpkinForeground2,
    },
    purple: {
      background2: tokens.colorPalettePurpleBackground2,
      borderActive: tokens.colorPalettePurpleBorderActive,
      foreground2: tokens.colorPalettePurpleForeground2,
    },
    red: {
      background1: tokens.colorPaletteRedBackground1,
      background2: tokens.colorPaletteRedBackground2,
      background3: tokens.colorPaletteRedBackground3,
      border1: tokens.colorPaletteRedBorder1,
      border2: tokens.colorPaletteRedBorder2,
      borderActive: tokens.colorPaletteRedBorderActive,
      foreground1: tokens.colorPaletteRedForeground1,
      foreground2: tokens.colorPaletteRedForeground2,
      foreground3: tokens.colorPaletteRedForeground3,
      foregroundInverted: tokens.colorPaletteRedForegroundInverted,
    },
    royalBlue: {
      background2: tokens.colorPaletteRoyalBlueBackground2,
      borderActive: tokens.colorPaletteRoyalBlueBorderActive,
      foreground2: tokens.colorPaletteRoyalBlueForeground2,
    },
    seafoam: {
      background2: tokens.colorPaletteSeafoamBackground2,
      borderActive: tokens.colorPaletteSeafoamBorderActive,
      foreground2: tokens.colorPaletteSeafoamForeground2,
    },
    steel: {
      background2: tokens.colorPaletteSteelBackground2,
      borderActive: tokens.colorPaletteSteelBorderActive,
      foreground2: tokens.colorPaletteSteelForeground2,
    },
    teal: {
      background2: tokens.colorPaletteTealBackground2,
      borderActive: tokens.colorPaletteTealBorderActive,
      foreground2: tokens.colorPaletteTealForeground2,
    },
    yellow: {
      background1: tokens.colorPaletteYellowBackground1,
      background2: tokens.colorPaletteYellowBackground2,
      background3: tokens.colorPaletteYellowBackground3,
      border1: tokens.colorPaletteYellowBorder1,
      border2: tokens.colorPaletteYellowBorder2,
      borderActive: tokens.colorPaletteYellowBorderActive,
      foreground1: tokens.colorPaletteYellowForeground1,
      foreground2: tokens.colorPaletteYellowForeground2,
      foreground3: tokens.colorPaletteYellowForeground3,
      foregroundInverted: tokens.colorPaletteYellowForegroundInverted,
    },
  },
}

export type FluentColors = typeof colors
