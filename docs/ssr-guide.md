# SSR 兼容开发规范（Server-Side Rendering）

> 状态：已落地（`@fluere-vue/utils` 环境探测 + `@fluere-vue/hooks` SSR 安全 composable + 组件 `renderToString` 冒烟测试）
> 背景事故：`FluereScrollView` 在 `setup()` 期直接调用 `globalThis.matchMedia(...)`，服务端渲染时抛错导致 `/components/scroll-view` 整页 500。

## 1. 为什么需要这份规范

Vue SSR 应用里，**同一份组件代码会在服务端（Node）与浏览器各执行一遍**。浏览器专属 API（`window` / `document` / `navigator` / `matchMedia` / `ResizeObserver` …）在 Node 中不存在，**只要在 `setup()` 阶段被直接访问就会抛错**——轻则单个组件 500，重则整页不可用。

`@fluere-vue/ui` 是**框架无关的组件库**，同时被 Nuxt docs 应用（SSR）与潜在的 Vite SPA / 测试消费。因此组件代码必须天生 SSR 安全，不能依赖消费方的补救。随着组件数量增长，需要把"如何写 SSR 安全代码"固化成约定与基础设施。

## 2. 核心原则（心智模型）

> 把浏览器 API 的访问**收敛到客户端才会执行的时机**（`onMounted` / 事件回调）；
> 必须在 `setup()` 期读取时，**先做能力探测**并给服务端一个安全默认值。

- SSR 期间只有 `setup()` 会执行，`onMounted` / `onUpdated` **不会**在服务端调用——这是我们的安全边界。
- 服务端缺省值必须是"无害的默认"（如 `false` / `0` / `''`），不能是 `undefined` 冒泡导致报错。

## 3. 浏览器 API 风险分级

| 等级 | 位置                                         | 风险                              | 处理                                                                                  |
| ---- | -------------------------------------------- | --------------------------------- | ------------------------------------------------------------------------------------- |
| 🔴 A | `setup()` 顶层直接访问                       | **SSR 直接崩溃**（500）           | 移到 `onMounted` / 事件回调，或能力探测 + 默认值                                      |
| 🟠 B | `setup()` 加守卫访问、读到的值**渲染进模板** | **水合不匹配**（警告 + 行为异常） | 挂载后再写入（`v-if="mounted"`）、`<ClientOnly>`、或 `useState` / `useHydration` 同步 |
| 🟢 C | `onMounted` / 事件回调内访问                 | 安全                              | 直接写，注意 `onScopeDispose` 清理                                                    |
| ⚪ D | 仅作为 TS 类型引用（`HTMLElement` 等）       | 安全                              | 无需处理                                                                              |

## 4. 分级应对手段

### Level 0 — 生命周期纪律（首选）

浏览器 API 一律放进 `onMounted` / 事件回调；`setup()` 只声明 `ref` 默认值。

参考实现：`packages/ui/src/scrollview/use-measurement.ts` 把 `ResizeObserver` / `MutationObserver` 建在 `onMounted`，是正确示范。

### Level 1 — 能力探测守卫（setup 期必须读、值不渲染）

只读、**不渲染进模板**的值，可用能力探测 + 服务端默认值。**务必复用 `@fluere-vue/hooks`，不要手搓 `typeof` 判断。**

```ts
const reducedMotion = useReducedMotion() // SSR 恒 false，浏览器按系统实时更新
```

⚠️ **水合陷阱**：若读到的值会渲染进模板（`{{ theme }}`、初始视口尺寸），守卫只保证"不崩溃"，却让服务端渲染默认值、客户端渲染真实值 → 触发水合不匹配。必须升级到 Level 1B / Level 2。

### Level 1B — 挂载后写入（值要渲染时）

```ts
const mounted = ref(false)
onMounted(() => {
  mounted.value = true
})
// 模板：<div v-if="mounted">{{ realValue }}</div>
```

### Level 2 — ClientOnly（消费侧兜底）

Nuxt 的 [`<ClientOnly>`](https://nuxt.com/docs/3.x/api/components/client-only) 让默认插槽**只在客户端渲染**（服务端构建时 tree-shake 掉），用 `#fallback` 给 SSR 占位。

**组件库内部不要写死 `<ClientOnly>`**（依赖 Nuxt，破坏框架无关性）。正确姿势：库组件保证"SSR 不崩溃 + 合理默认标记"，由消费方决定是否包裹。

### Level 3 — 环境标志

- Nuxt / Vite 提供 `import.meta.client` / `import.meta.server`（静态替换 + tree-shake）。
- **通用库代码优先用 `@fluere-vue/utils` 的能力探测**（运行时、框架无关）；`import.meta.*` 留给 docs 应用内代码。

## 5. 项目内基础设施

### `@fluere-vue/utils`（能力探测，调用时求值）

| 导出                                                                                                                             | 含义                                                  |
| -------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| `isClient` / `isServer`                                                                                                          | 平台环境判断（导入时求值，环境不随运行变化）          |
| `hasMatchMedia()` / `hasResizeObserver()` / `hasMutationObserver()` / `hasIntersectionObserver()` / `hasRequestAnimationFrame()` | 具体能力是否存在（**调用时求值**，测试可运行时 stub） |

### `@fluere-vue/hooks`（SSR 安全 composable）

| 导出                   | 行为                                                                        |
| ---------------------- | --------------------------------------------------------------------------- |
| `useMediaQuery(query)` | SSR 返回 `false` 默认；浏览器立即读初始值 + `change` 监听，作用域销毁时清理 |
| `useReducedMotion()`   | `useMediaQuery('(prefers-reduced-motion: reduce)')` 的封装                  |

新增依赖客户端能力时，**优先扩展这两个包**，而不是在组件里手搓探测。

## 6. 决策表

```
新组件要用浏览器 API？
├─ 只读、不渲染、事件驱动型（matchMedia / rAF / 监听器）
│   └─ Level 0：放 onMounted / 事件回调 → 完成
├─ setup 必须读、值不渲染 → Level 1：复用 @fluere-vue/hooks（或扩展它）
├─ setup 必须读、值会渲染   → Level 1B：挂载后写入 / useState / useHydration / <ClientOnly>
├─ 组件根本没法在服务端渲染（canvas / 图表 / 强 DOM）
│   └─ 库内给默认标记，消费方包 <ClientOnly>
└─ 用了 import 即碰 window 的第三方库
    └─ defineAsyncComponent 动态导入 + <ClientOnly>（把加载推迟到客户端）
```

## 7. 测试防线（必做）

每个组件都要有 `renderToString` 冒烟测试：见 `packages/ui/src/__tests__/ssr-smoke.test.ts`。

```ts
const html = await renderToString(createSSRApp({ render: () => h(FluereScrollView) }))
expect(html).toContain('fui-scrollview')
```

新增组件时**同步补上**该测试条目。`renderToString` 走纯服务端渲染路径（jsdom 默认不提供 matchMedia），能真实覆盖"无能力"分支。

## 8. lint / CI 扫描

禁止在 `setup()` 顶层裸写浏览器 API（`window.` / `document.` / `navigator.` / `matchMedia` / `new ResizeObserver` 等）。精确静态分析难，先用简单 grep 扫描兜底（事件回调与 `onMounted` 内除外）；后续可升级为自定义 oxlint 规则。

```sh
# 扫描 setup 顶层裸写浏览器 API 的疑似泄漏（结果需人工复核）
grep -rnE "^\s+(window|document|navigator)\.|new ResizeObserver|globalThis\.matchMedia\(" \
  packages/*/src --include="*.ts" --include="*.vue" | grep -v __tests__
```

## 9. 反例 ↔ 正确写法

| ❌ 反例（SSR 崩溃）                          | ✅ 正确                                                          |
| -------------------------------------------- | ---------------------------------------------------------------- |
| `const w = ref(window.innerWidth)`           | `const w = ref(0); onMounted(() => w.value = window.innerWidth)` |
| `document.title = '…'`（setup）              | `useHead` / `onMounted`                                          |
| `const m = globalThis.matchMedia(q)`         | `useMediaQuery(q)`                                               |
| `new ResizeObserver(...)`（setup）           | `onMounted(() => { obs = new ResizeObserver(...) })`             |
| 模块顶层 `let x = localStorage.getItem('k')` | 函数内 + 能力探测 + 默认值                                       |
| 用 `Math.random()` 生成 a11y id              | Vue 的 `useId()`（SSR 安全）                                     |
