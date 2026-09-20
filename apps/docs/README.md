# @fluentui-vue/docs

Nuxt 4 文档站（应用层，演示"可感知开发"）。

- 页面级样式使用 UnoCSS 工具类，颜色一律用**精确 token 名**（`bg-colorBrandBackground`、`p-fluent-m`、`rounded-fluent-md`），由 `@fluentui-vue/themes` 的 `presetFluent` 注入 token 变量。
- 组件示例页直接消费 `@fluentui-vue/ui`（组件样式自包含）。

## 命令

```bash
pnpm dev          # 本地开发
pnpm build        # 生产构建
pnpm generate     # 静态生成
```
