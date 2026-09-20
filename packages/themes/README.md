# @fluentui-vue/themes

基于 Fluent Design 2 的 UnoCSS 主题**适配层**，全部生成自 `@fluentui-vue/designs` 的 token 事实源（`data/fluent-tokens.json`），无手写映射。

## 导出

- `presetFluent()` — UnoCSS preset：
  - preflight 注入全部 token CSS 变量（`light-dark()` + `color-scheme`，单一 `:root` 自动切换明暗）；
  - `theme.colors` 用**精确 token 名**：`bg-colorBrandBackground`、`text-colorNeutralForeground1` …；
  - `theme.spacing / borderRadius / duration` 用 `fluent-*` 别名：`p-fluent-m`、`rounded-fluent-md`、`duration-fluent-fast`。
- `tokensCssText` — token CSS 变量文本（程序化注入用）。
- 类型：`Theme`、`BrandVariants`、`FluentTokenName`。

## 用法

```ts
// uno.config.ts
import { defineConfig, presetWind4 } from 'unocss'
import { presetFluent } from '@fluentui-vue/themes'

export default defineConfig({
  presets: [presetWind4(), presetFluent()],
})
```

## 重建

产物由 `designs` 生成（见 `@fluentui-vue/designs` 的 `sync`），本包只负责 re-export。
