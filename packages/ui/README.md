# @fluere-vue/ui

基于 Fluent Design 2 设计语言的 Vue 3 组件实现（组件层）。

## 设计原则

- **组件自包含**：内部用 `<style scoped>` + `var(--TokenName)` 实现样式，**不要求消费方配置 UnoCSS**；入口自动引入 `@fluere-vue/designs/tokens.css`（token CSS 变量）。
- **语义优先**：所有颜色/间距/圆角/动效都引用语义 token 名，杜绝硬编码 magic value。
- **明暗主题**：由 `tokens.css` 的 `light-dark()` + `color-scheme` 自动切换。

## 已实现

- `FluereButton` — 5 种外观（primary / secondary / outline / subtle / transparent）× 3 尺寸（24 / 32 / 40px）× 3 形状（rounded / circular / square）+ 禁用 / 选中（toggle）/ 图标 / 块级。
- `FluereInput` — 3 尺寸（24 / 32 / 40px）× 2 外观（outline / underline）+ 禁用 / 错误态（invalid，`aria-invalid`）+ `v-model`。

## 使用

```ts
import { FluereButton, FluereInput } from '@fluere-vue/ui' // 自动带上 token 变量
```

```vue
<FluereButton appearance="primary">Save</FluereButton>
<FluereInput v-model="text" placeholder="Name" />
```

> 页面级组合布局用 UnoCSS 工具类（精确 token 名）请搭配 `@fluere-vue/themes` 的 `presetFluere`。
