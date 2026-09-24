/* oxlint-disable no-magic-numbers -- 解析 CSS 值列表的 0/1 下标与层级计数，同 generate.mjs 的工具脚本豁免 */
/**
 * 明暗两套取值 → 一条合法 CSS 声明（generate.mjs 的纯函数内核，便于单测）。
 *
 * 背景：`light-dark()` 只接受 **两个 `<color>` 参数**。把所有「明暗不同」的 token 一律
 * 写成 `light-dark(light, dark)` 会在多值 token 上翻车 —— 阴影是一串逗号分隔的层
 * （`0 0 2px A, 0 8px 16px B`），拼进去就变成 4 个实参的非法调用，浏览器
 * 会把**整条 `box-shadow` 声明丢弃**（历史 bug：`--shadow2..64` 全部失效）。
 *
 * 因此这里按值的形态分两条路径：
 *   - 单值（颜色）→ `light-dark(light, dark)`
 *   - 多值（层列表）→ 逐层把颜色包成 `light-dark()`，几何字面量保持原样：
 *     `0 0 2px light-dark(A1, A2), 0 8px 16px light-dark(B1, B2)`
 *
 * 无法表达的结构（层数不一致、几何不同、既不是颜色也不是「几何 + 颜色」）**直接抛错**：
 * 宁可让生成流程失败并报出 token 名，也不要静默产出会被浏览器整条丢弃的 CSS。
 */

/** 颜色字面量：hex / 各种颜色函数 / CSS 关键字 / var() / 已经包好的 light-dark() */
const COLOR_PATTERN =
  /^(?:#[\da-f]{3,8}|rgba?\(|hsla?\(|hwb\(|lab\(|lch\(|oklab\(|oklch\(|color\(|color-mix\(|light-dark\(|var\(|transparent$|currentcolor$)/i

/**
 * 把单个阴影层拆成「几何 + 颜色」（颜色固定是最后一个 token）。
 * 结构不符合预期时返回 null。
 */
const splitLayer = (layer) => {
  const segments = layer.split(/\s+/)
  const color = segments[segments.length - 1]
  if (segments.length < 2 || color === undefined || !COLOR_PATTERN.test(color)) {
    return null
  }
  return { geometry: segments.slice(0, -1).join(' '), color }
}

/**
 * 按顶层逗号切分 CSS 值列表（跳过括号内的逗号，如 `rgba(0,0,0,0.12)`）。
 *
 * @param {string} value
 * @returns {string[]}
 */
export const splitTopLevel = (value) => {
  const parts = []
  let depth = 0
  let current = ''
  for (const char of value) {
    if (char === '(') {
      depth += 1
    } else if (char === ')') {
      depth -= 1
    }
    if (char === ',' && depth === 0) {
      parts.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }
  parts.push(current.trim())
  return parts
}

/**
 * 把明暗两个取值合成一条合法 CSS 声明值。
 *
 * @param {string} name token 名（仅用于报错）
 * @param {unknown} light 亮色取值
 * @param {unknown} dark 暗色取值
 * @returns {string}
 */
export const mergeThemedValue = (name, light, dark) => {
  const lightText = String(light)
  const darkText = String(dark)
  const lightLayers = splitTopLevel(lightText)
  const darkLayers = splitTopLevel(darkText)

  // 单值且确实是颜色：直接交给 light-dark()
  if (
    lightLayers.length === 1 &&
    darkLayers.length === 1 &&
    COLOR_PATTERN.test(lightText) &&
    COLOR_PATTERN.test(darkText)
  ) {
    return `light-dark(${lightText}, ${darkText})`
  }

  if (lightLayers.length !== darkLayers.length) {
    throw new Error(
      `[designs] token "${name}" 的明暗值层数不一致（${lightLayers.length} vs ${darkLayers.length}），无法逐层合成`,
    )
  }

  const merged = lightLayers.map((layer, index) => {
    const lightLayer = splitLayer(layer)
    const darkLayer = splitLayer(darkLayers[index])
    if (lightLayer === null || darkLayer === null || lightLayer.geometry !== darkLayer.geometry) {
      throw new Error(
        `[designs] token "${name}" 第 ${index + 1} 层不是「相同几何 + 颜色」结构，无法合成：` +
          `${layer} / ${darkLayers[index]}（多值 token 必须逐层同构，light-dark() 只接受颜色）`,
      )
    }
    return `${lightLayer.geometry} light-dark(${lightLayer.color}, ${darkLayer.color})`
  })

  return merged.join(', ')
}
