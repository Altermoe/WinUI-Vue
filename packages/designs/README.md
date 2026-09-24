# @fluere-vue/designs

Fluent Design 2 设计语言的**唯一事实源**（语言层）。一切 token **值**都来自这里，其余包只引用 token **名**。

## 内容

- `data/fluent-tokens.json` — 完整 token 集（从 `@fluentui/tokens` 抽取的 `webLightTheme` / `webDarkTheme`，459 个 token，含 315 个明暗差异值）+ `typographyStyles`。
- `scripts/extract-tokens.mjs` — 从 `@fluentui/tokens` 重新抽取完整 token 集。
- `scripts/theme-value.mjs` — 明暗两套取值 → 一条合法 CSS 声明的纯函数（可单测）：
  单值（颜色）走 `light-dark(a, b)`；**多值 token（阴影）逐层把颜色包成 `light-dark()`**，
  几何保持字面量。`light-dark()` 只接受两个 `<color>`，把逗号分隔的多层值整体塞进去会产出
  4 个实参的非法调用，浏览器会把整条 `box-shadow` 丢弃（历史 bug：`--shadow2..64` 全部失效）。
- `scripts/generate.mjs` — 从 JSON 生成适配产物：
  - `generated/tokens.css` — 全部 CSS 变量（明暗差异用 `light-dark()` + `color-scheme`；
    多值 token 逐层合成，见 `theme-value.mjs`）
  - `generated/preset-fluent.ts` — UnoCSS preset（颜色用**精确 token 名**，如 `bg-colorBrandBackground`；spacing/radius/duration 用 `fluent-*` 别名）
  - `generated/token-names.ts` — token 名常量与类型（`FluereTokenName`）

## 命令

```bash
pnpm --filter @fluere-vue/designs extract   # 重新抽取 JSON（跟随 @fluentui/tokens 上游）
pnpm --filter @fluere-vue/designs generate  # 从 JSON 重新生成产物
pnpm --filter @fluere-vue/designs sync      # extract + generate
```

> 说明：fluent-tokens skill 自带的 JSON 只含 184 个核心语义色；本包按 skill 文档化的重建路径抽取了**完整** 459 token（含 `colorStatus*` / `colorPalette*`），保证事实源不丢 token。
