# @fluentui-vue/icons

WinUI 3 / **Fluent System Icons** 的 Vue 3 图标库。

图标路径数据**生成自微软官方开源包 [`@fluentui/svg-icons`](https://github.com/microsoft/fluentui-system-icons)（MIT 许可）**，即 Segoe Fluent Icons 字体图标的官方矢量源——可在 Web 端获得与 WinUI 一致的外观，且**可自由发布**（字体本体为专有许可，本库不含任何字体字形提取物）。

- 覆盖：**2,953 个图标名 × 8 种尺寸（10 / 12 / 16 / 20 / 24 / 28 / 32 / 48）× 2 种风格（regular / filled）**，共 19,483 个组件
- 形态：每个「尺寸 × 风格」一个生成模块，导出该组合下全部图标组件，**按需 tree-shaking**
- 主题：`fill="currentColor"`，随文本/主题色变色；默认尺寸为图标原生设计尺寸
- 无障碍：无 `aria-label`/`title` 时自动 `aria-hidden`；提供后渲染 `<title>` 并设 `role="img"`

## 安装

```bash
pnpm add @fluentui-vue/icons
```

## 用法

### 按组件引入（推荐，tree-shakeable）

```vue
<script setup lang="ts">
import { FluentIconAdd20Filled } from '@fluentui-vue/icons'
import { FluentButton } from '@fluentui-vue/ui'
</script>

<template>
  <!-- 与 WinUI Button + FontIcon 等价 -->
  <FluentButton :icon="FluentIconAdd20Filled">Add</FluentButton>
  <!-- 单独使用 -->
  <FluentIconAdd20Filled class="text-colorBrandForeground1" />
</template>
```

### 通用属性

| Prop       | 说明                                                         |
| ---------- | ------------------------------------------------------------ |
| `size`     | 渲染尺寸 px，默认等于图标原生设计尺寸（放大建议按 2 的倍数） |
| `title`    | 无障碍标题；提供后渲染 `<title>` 并设 `role="img"`           |
| 其它 attrs | 透传到根 `<svg>`（`class` / `style` / `aria-label` 等）      |

> 图标名为「下划线小写」语义名（如 `access_time`），组件名为 `FluentIcon{Name}{Size}{Style}`（PascalCase，如 `FluentIconAccessTime20Filled`）。

### 元数据

- `import { fluentIconNames } from '@fluentui-vue/icons'` — 全部图标名
- `import iconsData from '@fluentui-vue/icons/data'` — 元数据注册表（图标名 × 可用尺寸 × 风格，无 path 数据），供图标浏览器/工具使用

## 生成管线

```bash
pnpm --filter @fluentui-vue/icons sync
```

`scripts/sync-icons.mjs` 从本包 devDependency `@fluentui/svg-icons`（或其 `FLUENT_SVG_ICONS_DIR` 指定目录 / pnpm store）解析优化 SVG，抽取 `<path d>` 生成：

```
generated/
  <size>-<style>.ts   每个尺寸×风格一个模块，导出全部图标组件
  index.ts            聚合导出
  names.ts            图标名/尺寸/风格的类型与常量
  icons.json          元数据注册表（无 path 数据）
```

生成物为**提交产物**，重建后应一并提交（保持确定性与可 diff）。

## 覆盖范围与取舍

- 只生成 `regular` / `filled` 两套官方风格；`color`（已废弃，不可主题化）、`light`（新增细线风格）、LTR/RTL 方向变体、`ar` 本地化变体**默认不生成**——如需可在 `sync-icons.mjs` 的解析正则中放开。
- 字体（Segoe Fluent Icons.ttf）中部分旧/专有字形不在开源 SVG 集内，故本库未收录；若需与字体 PUA 码点一一对齐的映射，需另以字体 cmap 或微软文档码点表建映射（本库按官方 SVG 语义命名）。
- RTL 场景：方向型图标可自行用 CSS `transform: scaleX(-1)` 镜像，或按需放开生成 `RTL/` 变体。

## License

图标数据来自 [microsoft/fluentui-system-icons](https://github.com/microsoft/fluentui-system-icons)（MIT，Copyright (c) 2020 Microsoft Corporation）；本包代码 MIT。
