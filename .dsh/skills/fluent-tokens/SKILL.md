---
name: fluent-tokens
description: The Fluent 2 design-token reference — real semantic values for color, typography, spacing, radius, stroke, duration, and motion extracted from @fluentui/tokens. Framework-agnostic source of truth; pair with a fluent-adapter-* to emit concrete code.
whenToUse: Any time you must pick a concrete color/spacing/typography/radius/duration value that conforms to Fluent 2, or emit framework code (CSS/Tailwind/React/Flutter) using Fluent semantic tokens.
---

# Fluent 2 Design Tokens

本 skill 提供 Fluent 2 语义 token 的**真实值引用**（来自官方 `@fluentui/tokens` 包）。token 是框架无关的设计语言事实来源：**任何 adapater/框架代码都应引用 token 名称，再翻译成目标表达**。

## 数据文件

完整数据在本技能目录 `data/fluent-tokens.json`。结构：

- `color.globalPalette` — 全局色板（grey 标度、whiteAlpha/blackAlpha、全部命名色）
- `color.brandWeb` / `brandTeams` / `brandOffice` / `brandTeamsV21` — 品牌色 10..160 档
- `typography.fontSizes / lineHeights / fontWeights / fontFamilies / styles` — 排版
- `spacing.horizontal / vertical` — 间距标度
- `radius` — 圆角 · `strokeWidths` — 描边 · `durations` — 动画时长 · `curves` — 缓动曲线
- `alias.lightWeb` / `alias.darkWeb` — **184 个语义 token** 的解析后取值（默认 web 品牌）

### 这份数据怎么来 / 如何重建

`data/fluent-tokens.json` 是从官方 `@fluentui/tokens` **抽取生成**的，不是手写值。若文件缺失或需跟随上游更新，按下面重建（需要真实网络 + 可写的临时目录）：

```bash
# 1. 在临时目录安装官方 token 包
mkdir -p /tmp/fluent && cd /tmp/fluent
npm i @fluentui/tokens --cache "$PWD/.npmcache"

# 2. 抽取 global/alias 语义值（把下面的路径换成你实际 handle 到的包位置）
#    参考仓库最初生成脚本 extract.mjs 的做法：
#    - global/*.js 读全局 token
#    - alias/{lightColor,darkColor}.js 的 generateColorTokens(brandWeb) 得到解析后的语义值
#    输出合并为 { color, typography, spacing, radius, strokeWidths, durations, curves, alias:{lightWeb,darkWeb} }
# 3. 把它写到本技能 data/fluent-tokens.json
```

重建要点：
- **路径不写死**：抽取脚本里的包位置、临时目录、输出路径都应来自实际环境——AI 先 `pwd` 定位、用 glob 确认 `node_modules/@fluentui/tokens/lib/*.js` 真实存在，再填路径；拿不准就**询问人类**要路径或授权安装。
- 语义值来自 `generateColorTokens(brand)`（正是其它 adapter 消费的 `alias.lightWeb/darkWeb`）。
- 生成的 adapter 产物（`fluent.css`、`preset-fluent.ts`、`fluent_tokens.dart`）都只依赖这份 JSON；改 JSON 后重跑各自的 `gen-*` 脚本即可。

## 语义 token 命名规律

- 前缀 `color-`、`font-`、`spacing-`、`borderRadius-`、`strokeWidth-`、`duration-`、`curve-`。
- `Neutral`=中性，`Brand`=品牌，`CompoundBrand`=品牌高亮混合（hover/selected 用）。
- `Background`/`Foreground` + 数字（1 最靠前/重要，越大越靠后/次要）；后缀 `Hover/Pressed/Selected/Focused` 表状态。
- `Disabled`/`Static`/`Inverted` 表特殊状态。

## 关键语义 token（light 默认值示例，请以数据文件为准）

### 前景色（Foreground）
```
colorNeutralForeground1   #242424  (主文字/最高层)
colorNeutralForeground2   #424242  (次级文字)
colorNeutralForeground3   #616161  (三级/说明)
colorNeutralForeground4   #707070
colorNeutralForegroundDisabled  (禁用态)
colorBrandForegroundLink  (链接色)
colorCompoundBrandForeground1  (品牌高亮主前景)
colorNeutralForegroundInverted / Static (反白场景写白字用)
```

### 背景色（Background）
```
colorNeutralBackground1   #ffffff  (图层基底1)
colorNeutralBackground2 / 3 / 4 / 5   (逐层加深，用于容器层级)
colorBrandBackground / colorBrandBackgroundHover  (品牌底)
colorNeutralBackgroundDisabled
colorTransparentBackground
```

### 边框 / 分割
```
colorNeutralStroke1 / 2 / 3 ...  colorNeutralStrokeDisabled  colorNeutralStrokeSubtle
colorBrandStroke1 / 2  colorCompoundBrandStroke(1..)
colorTransparentStroke
```

### 尺寸 / 动效
```
borderRadiusMedium       4px · borderRadiusLarge 6px
strokeWidthThin 1px · strokeWidthThick 2px
spacingHorizontalS 8px · M 12px · L 16px · XL 20px
durationNormal 200ms · durationFast 150ms
curveEasyEase  cubic-bezier(0.33,0,0.67,1)  · curveDecelerateMax/AccelerateMin 等
```

> 以上为**示例**——生成代码时**务必查阅 `data/fluent-tokens.json` 取准确值**，不要凭记忆硬编码。深色主题用 `alias.darkWeb`。

## 使用规则

1. **语义优先**：输出代码引用 token 名（如 `colorNeutralBackground2`），不直接写 `#fafafa` 这类 magic value（除非该框架只能输出静态值，此时先从语义 token 查值再输出，并保留注释）。
2. **跨框架一致性**：一份设计，多套表达式——React 用 CSS-in-JS token、CSS 用 `var(--...)`、Tailwind 用主题扩展、Flutter 用 ThemeData。都在 `alias` / global 层对齐同一数值。
3. **换主题**：切换 `alias.lightWeb` ↔ `alias.darkWeb` 即可获得同一套语义的反向主题；品牌换用 `brandTeams` 等重建 alias。值来自同一个 token 系统。
4. **不要自创 token**：用户需要的值不在 token 集里时，先选最接近的语义 token + 说明偏差；不要随手发明 `colorNeutralForegroundXxx`。

## 相关 skill

- 想生成代码 → 选对应 `fluent-adapter-*`。
- 想查组件该用哪些 token → `fluent-components`。
- 想查设计原则 → `fluent-foundations`。