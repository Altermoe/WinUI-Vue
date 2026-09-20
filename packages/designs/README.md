# @fluentui-vue/designs

Fluent Design 2 设计语言的**唯一事实源**（语言层）。一切 token **值**都来自这里，其余包只引用 token **名**。

## 内容

- `data/fluent-tokens.json` — 完整 token 集（从 `@fluentui/tokens` 抽取的 `webLightTheme` / `webDarkTheme`，459 个 token，含 315 个明暗差异值）+ `typographyStyles`。
- `scripts/extract-tokens.mjs` — 从 `@fluentui/tokens` 重新抽取完整 token 集。
- `scripts/generate.mjs` — 从 JSON 生成适配产物：
  - `generated/tokens.css` — 全部 CSS 变量（明暗差异用 `light-dark()` + `color-scheme`）
  - `generated/preset-fluent.ts` — UnoCSS preset（颜色用**精确 token 名**，如 `bg-colorBrandBackground`；spacing/radius/duration 用 `fluent-*` 别名）
  - `generated/token-names.ts` — token 名常量与类型（`FluentTokenName`）

## 命令

```bash
pnpm --filter @fluentui-vue/designs extract   # 重新抽取 JSON（跟随 @fluentui/tokens 上游）
pnpm --filter @fluentui-vue/designs generate  # 从 JSON 重新生成产物
pnpm --filter @fluentui-vue/designs sync      # extract + generate
```

> 说明：fluent-tokens skill 自带的 JSON 只含 184 个核心语义色；本包按 skill 文档化的重建路径抽取了**完整** 459 token（含 `colorStatus*` / `colorPalette*`），保证事实源不丢 token。
