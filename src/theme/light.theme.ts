import type { ThemeColor } from '.'

export const getDefaultLightTheme = (): ThemeColor => ({
  text: {
    primary: '#000000cc',
    secondary: '#00000099',
    tertiary: '#00000070',
    disabled: '#0000005b',
    accentPrimary: '#003e92',
    accentSecondary: '#001a68',
    accentTertiary: '#005fbb',
    accentDiabled: '#0000005b',
    onAccentPrimary: '#ffffff',
    onAccentSecondary: '#ffffffb2',
    onAccentDiabled: '#ffffffb2',
    onAccentSelected: '#ffffff',
  },
  fill: {
    ctrlDefault: '#ffffffb2',
    ctrlSecondary: '#f9f9f97f',
    ctrlTertiary: '#f9f9f94c',
    ctrlDisabled: '#f9f9f94c',
    ctrlTransparent: 'transparent',
    ctrlInputActive: '#ffffff',
    ctrlAltTransparent: 'transparent',
    ctrlAltSecondary: '#00000005',
    ctrlAltTertiary: '#0000000c',
    ctrlAltQuarternary: '#00000016',
    ctrlAltDisabled: 'transparent',
    ctrlStrongDefault: '#00000070',
    ctrlStrongDisabled: '#0000004f',
    ctrlSubtleTransparent: 'transparent',
    ctrlSubtleSecondary: '#0000000a',
    ctrlSubtleTertiary: '#00000005',
    ctrlSubtleDisabled: 'transparent',
    ctrlOnImgDefault: '#ffffffc9',
    ctrlOnImgSecondary: '#f3f3f3',
    ctrlOnImgTertiary: '#ebebeb',
    ctrlOnImgDisabled: 'transparent',
    accentDefault: '#005fbb',
    accentSecondary: '#005fbbe5',
    accentTertiary: '#005ffbbcc',
    accentDisabled: '#00000038',
    accentSelectedTextBg: '#0078d4',
  },
  elevation: {
    ctrlBorder: 'linear-gradient(rgba(0, 0, 0, 0.055) 90.576%, rgba(0, 0, 0, 0.161) 100%)',
    circleBorder: 'linear-gradient(rgba(0, 0, 0, 0.055) 50.021%, rgba(0, 0, 0, 0.161) 95.455%)',
    textCtrlBorder: 'linear-gradient(rgba(0, 0, 0, 0.055) 99.988%, rgba(0, 0, 0, 0.443) 100%)',
    textCtrlBorderFocused: 'linear-gradient(rgba(0, 0, 0, 0.055) 96.875%, rgba(0, 103, 192, 1) 96.887%)',
    accentCtrlBorder: 'rgba(255, 255, 255, 0.078) 90.674%, rgba(0, 0, 0, 0.4) 100%',
  },
  stroke: {
    ctrlDefault: '#0000000c',
    ctrlSecondary: '#00000028',
    ctrlOnAccentDefault: '#ffffffcc',
    ctrlOnAccentSecondary: '#000000ff',
    ctrlOnAccentTeriary: '#00000038',
    ctrlOnAccentDisabled: '#0000000c',
    ctrlForStrongOnImage: '#ffffff59',
    cardDefault: '#0000000c',
    cardDefaultSolid: '#ebebeb',
    ctrlStrongDefault: '#00000070',
    ctrlStrongDisabled: '#00000038',
    surfaceDefault: '#75757566',
    surfaceFlyout: '#0000000c',
    dividerDefault: '#00000014',
    focusOuter: '#000000e2',
    focusInner: '#ffffff',
  },
  bg: {
    cardDefault: '#ffffffb2',
    cardSecondary: '#f6f6f67f',
    smokeDefault: '#0000004c',
    layerDefault: '#ffffff7f',
    layerAlt: '#ffffff',
    layerOnAcrylicDefault: '#ffffff3f',
    solidBase: '#f3f3f3',
    solidSecondary: '#eeeeee',
    solidTertiary: '#f9f9f9',
    solidQuarternary: '#f9f9f9',
    micaBase: '#f3f3f3',
    acrylicBase: '#f3f3f3e5',
    acrylicDefault: '#fcfcfcd8',
    accentAcrylicBase: '#99ebff90',
    accentAcrylicDefault: '#99ebffe5',
  },
  system: {
    attention: '#005EB6',
    attentionBg: '#f6f6f67f',
    solidAttentionBg: '#f7f7f7',
    success: '#0f7b0f',
    successBg: '#dff6dd',
    caution: '#9d5d00',
    cautionBg: '#fff4ce',
    critical: '#c42b1c',
    criticalBg: '#fde7e9',
    neutral: '#00000070',
    neutralBg: '#00000005',
    solidNetural: '#8a8a8a',
    solidNeturalBg: '#f3f3f3',
  },
})
