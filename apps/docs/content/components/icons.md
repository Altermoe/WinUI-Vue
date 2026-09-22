---
title: Icons 图标库
description: WinUI 3 / Fluent System Icons 的 Vue3 图标组件。
nav:
  title: Icons 图标库
---

# Icons 图标库

WinUI 3 / Fluent System Icons 的 Vue3 图标组件，生成自官方开源包 `@fluentui/svg-icons`
（MIT，即 Segoe Fluent Icons 字体的矢量源）。共 2953 个图标名 × 10 / 12 / 16 / 20 / 24 / 28 / 32 / 48 尺寸 × regular / filled 风格。

## 用法

::demo-block{title="用法"}
#preview
:IconsUsageDemo
#code

```vue
import { FluentIconAdd20Filled } from '@fluere-vue/icons'

<FluentIconAdd20Filled />
<FluentIconAdd20Filled size="24" title="添加" />
```

::

## 图标浏览器

支持按图标名搜索、按尺寸与风格筛选，点击任意图标复制组件名。

:IconsBrowserDemo
