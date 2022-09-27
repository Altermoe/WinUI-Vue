/**
 * 颜色为应用程序中的用户提供了一种直观的信息交流方式：
 *
 * 它可以用于指示交互性，为用户操作提供反馈，并使界面具有视觉连续性。
 **/
export interface ThemeColor {
  /** 用于UI标签和静态文本。 */
  text: {
    /** 文本填充颜色基本笔刷 */
    primary: string
    /** 文本填充颜色辅助笔刷 */
    secondary: string
    /** 文本填充颜色第三代笔刷 */
    tertiary: string
    /** 文本填充颜色禁用笔刷 */
    disabled: string
    /** 强调文字填充颜色基本笔刷，建议用于链接 */
    accentPrimary: string
    /** 强调文字填充颜色辅助笔刷，建议用于链接 */
    accentSecondary: string
    /** 强调文字填充颜色第三种笔刷，建议用于链接 */
    accentTertiary: string
    /** 强调文字填充颜色禁用笔刷，建议用于链接 */
    accentDiabled: string
    /** 强调文字填充颜色基本笔刷 */
    onAccentPrimary: string
    /** 强调文字，辅助填充色 */
    onAccentSecondary: string
    /** 强调文字，禁用填充色 */
    onAccentDiabled: string
    /** 强调文字，突出文本颜色 */
    onAccentSelected: string
  }
  /**
   * 用于标准控件的填充，例如：按钮下拉搜索
   */
  fill: {
    /** 用于标准控件的填充，示例：按钮下拉搜索 */
    ctrlDefault: string
    /** 用于标准控件的填充，示例：按钮下拉搜索 */
    ctrlSecondary: string
    /** 用于标准控件的填充，示例：按钮下拉搜索 */
    ctrlTertiary: string
    /** 用于标准控件的填充，示例：按钮下拉搜索 */
    ctrlDisabled: string
    /** 用于标准控件的填充，示例：按钮下拉搜索 */
    ctrlTransparent: string
    /** 用于标准控件的填充，示例：按钮下拉搜索 */
    ctrlInputActive: string
    /** 用于切换类型控件的“关闭”状态的填充。示例：切换单选复选框分级控制 */
    ctrlAltTransparent: string
    /** 用于切换类型控件的“关闭”状态的填充。示例：切换单选复选框分级控制 */
    ctrlAltSecondary: string
    /** 用于切换类型控件的“关闭”状态的填充。示例：切换单选复选框分级控制 */
    ctrlAltTertiary: string
    /** 用于切换类型控件的“关闭”状态的填充。示例：切换单选复选框分级控制 */
    ctrlAltQuarternary: string
    /** 用于切换类型控件的“关闭”状态的填充。示例：切换单选复选框分级控制 */
    ctrlAltDisabled: string
    /** 用于必须满足 3:1 对比度要求的控制填充。示例：滚动条滑块翻转视图 */
    ctrlStrongDefault: string
    /** 用于必须满足 3:1 对比度要求的控制填充。示例：滚动条滑块翻转视图 */
    ctrlStrongDisabled: string
    /** 用于静态透明的列表项和填充，并在交互时显示。 */
    ctrlSubtleTransparent: string
    /** 用于静态透明的列表项和填充，并在交互时显示。 */
    ctrlSubtleSecondary: string
    /** 用于静态透明的列表项和填充，并在交互时显示。 */
    ctrlSubtleTertiary: string
    /** 用于静态透明的列表项和填充，并在交互时显示。 */
    ctrlSubtleDisabled: string
    /** 用于图像顶部的控件。当前，仅用于网格视图复选框。 */
    ctrlOnImgDefault: string
    /** 用于图像顶部的控件。当前，仅用于网格视图复选框。 */
    ctrlOnImgSecondary: string
    /** 用于图像顶部的控件。当前，仅用于网格视图复选框。 */
    ctrlOnImgTertiary: string
    /** 用于图像顶部的控件。当前，仅用于网格视图复选框。 */
    ctrlOnImgDisabled: string
    /** 用于控件上的强调符号填充。示例：主按钮、选定切换控制、药丸选定指示灯 */
    accentDefault: string
    /** 用于控件上的强调符号填充。示例：主按钮、选定切换控制、药丸选定指示灯 */
    accentSecondary: string
    /** 用于控件上的强调符号填充。示例：主按钮、选定切换控制、药丸选定指示灯 */
    accentTertiary: string
    /** 用于控件上的强调符号填充。示例：主按钮、选定切换控制、药丸选定指示灯 */
    accentDisabled: string
    /** 用于控件上的强调符号填充。示例：主按钮、选定切换控制、药丸选定指示灯 */
    accentSelectedTextBg: string
  }
  /** 渐变笔划 */
  elevation: {
    /** 用于标准控制冲程和冲程状态。示例：按钮、下拉、搜索 */
    ctrlBorder: string
    /** 用于标准控制冲程和冲程状态。示例：按钮、下拉、搜索 */
    circleBorder: string
    /** 用于标准控制冲程和冲程状态。示例：按钮、下拉、搜索 */
    textCtrlBorder: string
    /** 用于标准控制冲程和冲程状态。示例：按钮、下拉、搜索 */
    textCtrlBorderFocused: string
    /** 用于标准控制冲程和冲程状态。示例：按钮、下拉、搜索 */
    accentCtrlBorder: string
  }
  stroke: {
    /** 用于立面边界中的渐变止点和控制状态。示例：按钮、下拉、搜索 */
    ctrlDefault: string
    /** 用于立面边界中的渐变止点和控制状态。示例：按钮、下拉、搜索 */
    ctrlSecondary: string
    /** 用于立面边界中的渐变止点和控制状态。示例：按钮、下拉、搜索 */
    ctrlOnAccentDefault: string
    /** 用于立面边界中的渐变止点和控制状态。示例：按钮、下拉、搜索 */
    ctrlOnAccentSecondary: string
    /** 用于立面边界中的渐变止点和控制状态。示例：按钮、下拉、搜索 */
    ctrlOnAccentTeriary: string
    /** 用于立面边界中的渐变止点和控制状态。示例：按钮、下拉、搜索 */
    ctrlOnAccentDisabled: string
    /** 用于立面边界中的渐变止点和控制状态。示例：按钮、下拉、搜索 */
    ctrlForStrongOnImage: string
    /** 用于卡片和图层笔划颜色。 */
    cardDefault: string
    /** 用于卡片和图层笔划颜色。 */
    cardDefaultSolid: string
    /** 用于必须满足3:1对比度要求的控制笔划。例子：单选按钮、切换开关、复选框 */
    ctrlStrongDefault: string
    /** 用于必须满足3:1对比度要求的控制笔划。例子：单选按钮、切换开关、复选框 */
    ctrlStrongDisabled: string
    /** 用于背景表面上的笔划，例如：弹出按钮、窗口、对话框。 */
    surfaceDefault: string
    /** 用于背景表面上的笔划，例如：弹出按钮、窗口、对话框。 */
    surfaceFlyout: string
    /** 用于分隔线和图形线。主题反转；光明中的黑暗主题和黑暗中的光明主题。 */
    dividerDefault: string
    /** 用于分隔线和图形线。主题反转；光明中的黑暗主题和黑暗中的光明主题。 */
    focusOuter: string
    /** 用于分隔线和图形线。主题反转；光明中的黑暗主题和黑暗中的光明主题。 */
    focusInner: string
  }
  background: {
    /** 用于创建“卡片”-位于页面和层背景上的内容块。 */
    cardDefault: string
    /** 用于创建“卡片”-位于页面和层背景上的内容块。 */
    cardSecondary: string
    /** 在窗口和桌面上使用，以阻止它们无法访问。 */
    smokeDefault: string
    /** 用于任何材质的背景色以创建分层。 */
    layerDefault: string
    /** 用于任何材质的背景色以创建分层。 */
    layerAlt: string
    /** 用于任何材质的背景色以创建分层。 */
    layerOnAcrylicDefault: string
    /** 用于放置层、卡片或控件的纯色背景。 */
    solidBase: string
    /** 用于放置层、卡片或控件的纯色背景。 */
    solidSecondary: string
    /** 用于放置层、卡片或控件的纯色背景。 */
    solidTertiary: string
    /** 用于放置图层、卡片或控件的云母背景色。 */
    micaBase: string
    /** 亚克力背景色，用于放置层、卡片或控件。 */
    acrylicBase: string
    /** 亚克力背景色，用于放置层、卡片或控件。 */
    acrylicDefault: string
    /** 亚克力背景色，用于放置层、卡片或控件。 */
    accentAcrylicBase: string
    /** 亚克力背景色，用于放置层、卡片或控件。 */
    accentAcrylicDefault: string
  }
  system: {
    attention: string
    attentionBg: string
    solidAttentionBg: string
    success: string
    successBg: string
    caution: string
    cautionBg: string
    critical: string
    criticalBg: string
    neutral: string
    neutralBg: string
    solidNetural: string
    solidNeturalBg: string
  }
}
