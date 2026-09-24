# Fluent 2 样式体系重构设计（Token-Driven Style）

> 状态：Button 试点已完成（P1–P3），待 P4 全量推广
> 关联 skills：`fluent-foundations` / `fluent-tokens` / `fluent-adapter-css` / `fluent-adapter-vue`

## 1. 目标

1. **单一事实源**：`data/fluent-tokens.json`（来自 fluent-tokens skill）成为唯一持有 token **值**的文件；其余一切（CSS 变量、UnoCSS 主题、组件样式）都从它生成或引用 token **名**。
2. **可感知开发**：代码里可见的永远是语义 token 名（`var(--colorBrandBackground)` 或 `bg-colorBrandBackground`），杜绝硬编码 magic value 与第二套手写词汇。
3. **组件库自包含**：`@fluere-vue/ui` 不要求消费方配置 UnoCSS；组件内部用 `<style scoped>` + `var(--TokenName)`。
4. **UnoCSS 定位调整**：从组件库的**必要依赖**降级为**应用/页面层的可选 DX 增强**（docs、演示、消费方页面）。

## 2. 已确认决策

| 决策     | 选择                                                                                                       |
| -------- | ---------------------------------------------------------------------------------------------------------- |
| 命名方向 | **精确 token 名**：`bg-colorBrandBackground`、`var(--colorBrandBackground)`（scales 用 `fluent-*` 短别名） |
| 主题切换 | **`light-dark()` + `color-scheme`**：单一 `:root`，自动跟随系统/`color-scheme`                             |
| 实施范围 | **Button 试点先行**，验证完整管线后再推广                                                                  |

## 3. 目标架构

```
┌────────────────────────────────────────────────────────────┐
│  事实源 data/fluent-tokens.json      (designs 包持有)        │
│  · 完整 459 token（含明暗两套取值）                          │
│  · 原 skill JSON 仅 184，已按重建路径补全 status/palette    │
└───────────────────────────┬────────────────────────────────┘
                            │ 构建期生成 (designs/scripts/generate.mjs)
        ┌───────────────────┴────────────────────┐
        ▼                                        ▼
  tokens.css (CSS 变量)                  preset-fluent.ts
  --colorBrandBackground …               UnoCSS preset/主题
  （明暗用 light-dark()）                  → bg-colorBrandBackground
        │                                        │
        ├───────────────┐                        │
        ▼               ▼                        ▼
  组件库 ui            （适配层导出）        应用/页面层
  <style scoped>       @fluere-vue/themes   docs / 演示
  var(--TokenName)      re-export 生成产物      bg-colorBrandBackground
  自包含                                         可感知开发
```

### 包职责

| 包                       | 层     | 职责                                                                                                                                                 |
| ------------------------ | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@fluere-vue/designs`    | 语言层 | 持有 `data/fluent-tokens.json`（唯一事实源）+ `scripts/generate.mjs`（JSON → 适配产物）+ `scripts/sync-tokens.mjs`（从 `@fluentui/tokens` 重新抽取） |
| `@fluere-vue/themes`     | 适配层 | 消费 designs 生成产物，对外导出 `presetFluere`（UnoCSS preset）与 `tokens.css` 路径；`@fluentui/tokens` 降为 devDependency                           |
| `@fluere-vue/ui`         | 组件层 | SFC + `<style scoped>` 引用 `var(--TokenName)`；入口导入 `tokens.css`                                                                                |
| `apps/docs` / playground | 应用层 | 页面级 UnoCSS 工具类（精确 token 名）；禁止 `gray-*`/`white` 硬编码                                                                                  |

## 4. 生成管线

`packages/designs/scripts/generate.mjs` 输入 `data/fluent-tokens.json`，输出：

1. **`tokens.css`** — 全部 `--TokenName`：
   - 全局标度（spacing/radius/stroke/duration/curve/font）→ `:root { ... }` 固定值；
   - 语义色（明暗不同、单值）→ `:root { ... light-dark(<light>, <dark>) ...; color-scheme: light dark; }`；
   - **多值 token（阴影 `--shadow2..64`）** → `light-dark()` 只接受两个 `<color>`，不能把逗号分隔的
     多层值整体塞进去（会变成 4 个实参的非法调用 → 整条 `box-shadow` 被浏览器丢弃）。
     由 `scripts/theme-value.mjs` **逐层**把颜色包成 `light-dark()`，几何保持字面量：
     `--shadow16: 0 0 2px light-dark(A1, A2), 0 8px 16px light-dark(B1, B2);`（有单测兜底；
     无法表达的结构直接抛错，不产出会被丢弃的 CSS）。
2. **`preset-fluent.ts`** — UnoCSS preset：
   - `preflights`：注入 `tokens.css` 变量（供未显式引入 CSS 的场景）；
   - `theme.colors`：精确 token 名 → `var(--TokenName)`（`bg-colorBrandBackground` 等）；
   - `theme.spacing/borderRadius/duration`：`fluent-*` 别名（`p-fluent-m`、`rounded-fluent-md`、`duration-fluent-fast`）；
   - `theme.shadow`：`shadow-4` / `shadow-16` → `var(--shadowN)`（presetWind4 读 `theme.shadow`）。
3. **`token-names.ts`** — 从 JSON 生成 token 名常量/类型，供 TS 侧引用，杜绝拼写漂移。

**事实源完整性**：fluent-tokens skill 自带的 `data/tokens/fluent-tokens.json` 只含 184 个核心语义色，缺 `colorStatus*`/`colorPalette*`（现有 `colors.ts` 与 docs 在用）。因此按 skill 文档化的重建路径，用 `scripts/extract-tokens.mjs` 从 `@fluentui/tokens` 抽取**完整** `webLightTheme`/`webDarkTheme`（459 token，315 个明暗差异）+ `typographyStyles`，重写为 `data/fluent-tokens.json`。

删除的手写文件：`themes/src/{colors,scales,motion,kebabify,css-vars}.ts` 的手写映射由生成产物取代。

## 5. 组件样式形态（Button 试点）

```vue
<template>
  <button
    :class="[`fui-button`, `fui-button--${appearance}`, `fui-button--${size}`]"
    :aria-pressed="..."
  >
    <slot />
  </button>
</template>

<style scoped>
.fui-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacingHorizontalXS);
  font-family: var(--fontFamilyBase);
  border-radius: var(--borderRadiusMedium);
  outline: none;
  cursor: pointer;
}
.fui-button--primary {
  background: var(--colorBrandBackground);
  color: var(--colorNeutralForegroundOnBrand);
  border: 1px solid transparent;
}
.fui-button--primary:hover {
  background: var(--colorBrandBackgroundHover);
}
.fui-button--primary:active {
  background: var(--colorBrandBackgroundPressed);
}
.fui-button--primary[aria-pressed='true'] {
  background: var(--colorBrandBackgroundSelected);
}
.fui-button:disabled {
  background: var(--colorNeutralBackgroundDisabled);
  color: var(--colorNeutralForegroundDisabled);
  cursor: not-allowed;
}
.fui-button:focus-visible {
  outline: 2px solid var(--colorCompoundBrandStroke);
  outline-offset: 2px;
}
</style>
```

- 所有值 = `var(--TokenName)`，token 名即 CSS 变量名，`grep colorBrandBackground` 全链路命中。
- 状态用原生 CSS（`:hover` / `:active` / `[aria-pressed]` / `:disabled` / `:focus-visible`），替换原 `button.uno.ts` 的 200+ 行变体字符串。

## 6. 无障碍约束（fluent-foundations / fluent-verify）

- 对比度走 token 已保证的语义组合（`colorNeutralForeground1` 等在对应背景上满足 WCAG AA）。
- `:focus-visible` 必须有可见 focus ring：`strokeWidthThick` + `colorCompoundBrandStroke`。
- icon 按钮 `aria-label`；状态不只靠颜色（配 `aria-pressed` / 文本）。
- 动效尊重 `prefers-reduced-motion`。

## 7. 分阶段实施

| 阶段 | 内容                                                                                                                      | 验证                                       |
| ---- | ------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| P0   | `pnpm install` 基线                                                                                                       | docs dev 可运行                            |
| P1   | `fluent-tokens.json` → `designs/data`；写 `generate.mjs` 产出 `tokens.css`/`preset-fluent.ts`；重构 `themes` 消费生成产物 | 生成产物与现主题逐值比对一致               |
| P2   | docs 类名对齐精确 token 名；清除 `gray-*`/`white` 硬编码                                                                  | wind4 build 通过、无漂移                   |
| P3   | Button → scoped style；`ui` 入口导入 `tokens.css`                                                                         | 5 外观/3 尺寸/3 形状/禁用/选中/图标 全正确 |
| P4   | 其余组件同法迁移；`fluent-verify` 审计                                                                                    | tsc + lint + build + 主题切换              |

## 8. 风险与对策

- **wind4 主题键差异**（`duration` 等）：实施时跑 dev/build 验证；必要时用 `theme.transitionDuration` 或 `@theme` CSS-first。
- **`tokens.css` 引入成本**：`ui` 入口统一导入一次；文档站同时经 preset preflight 注入，双保险。
- **命名长度**：精确 token 名略长，scales 用 `fluent-*` 短别名缓解；组件内部直接用 CSS 变量名（本来就长），无额外成本。
