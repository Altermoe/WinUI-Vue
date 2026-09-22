---
title: Input 输入框
description: 输入框组件，用于获取用户文本输入。
nav:
  title: Input 输入框
---

# Input 输入框

输入框组件，用于获取用户文本输入。

## 基础用法

::demo-block{title="基础用法"}
#preview
:InputBasicDemo
#code

```vue
<FluereInput v-model="value" placeholder="请输入内容" />
<FluereInput placeholder="禁用状态" disabled />
```

::

## 尺寸

::demo-block{title="尺寸"}
#preview
:InputSizeDemo
#code

```vue
<FluereInput size="small" placeholder="Small (24px)" />
<FluereInput size="medium" placeholder="Medium (32px)" />
<FluereInput size="large" placeholder="Large (40px)" />
```

::

## 外观

::demo-block{title="外观"}
#preview
:InputAppearanceDemo
#code

```vue
<FluereInput appearance="outline" placeholder="Outline（默认）" />
<FluereInput appearance="underline" placeholder="Underline（下划线）" />
```

::

## 错误状态

::demo-block{title="错误状态"}
#preview
:InputInvalidDemo
#code

```vue
<FluereInput invalid placeholder="错误输入" aria-describedby="input-error-hint" />
<p id="input-error-hint">请输入有效的内容。</p>
```

::
