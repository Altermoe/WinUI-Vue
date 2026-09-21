import { describe, expect, it } from 'vitest'
/**
 * SSR 兼容性冒烟测试（回归防线）。
 *
 * 组件库代码在服务端渲染时也会执行一遍 `setup()`——若某组件在 setup 阶段
 * 直接访问浏览器专属 API（matchMedia / window / document / ResizeObserver …），
 * 服务端会抛错导致整页 500（历史事故：FluereScrollView 的
 * `globalThis.matchMedia` 崩溃）。这里对每个组件做一次真正的 `renderToString`，
 * 断言「服务端渲染不抛错且产出标记」，把这类回归挡在测试层。
 *
 * 运行在 jsdom 环境，但 `renderToString` 是纯服务端渲染路径：jsdom 默认
 * 不提供 matchMedia 等 API，恰好真实覆盖「无能力」的 SSR 分支。
 */
import { createSSRApp, h } from 'vue'
import type { Component } from 'vue'
import { renderToString } from 'vue/server-renderer'
import FluereButton from '../button/button.vue'
import FluereInput from '../input/input.vue'
import FluereScrollView from '../scrollview/scroll-view.vue'

/** 把单个组件以 SSR 模式渲染为 HTML 字符串 */
const renderServer = async (component: Component, slotText = ''): Promise<string> => {
  const app = createSSRApp({
    render: () => h(component, {}, { default: () => slotText }),
  })
  return renderToString(app)
}

describe('SSR 兼容性冒烟测试', () => {
  it('FluereButton 可服务端渲染', async () => {
    const html = await renderServer(FluereButton, '确定')
    expect(html).toContain('fui-button')
    expect(html).toContain('确定')
  })

  it('FluereInput 可服务端渲染', async () => {
    const html = await renderServer(FluereInput)
    expect(html).toContain('fui-input')
  })

  it('FluereScrollView 可服务端渲染（回归：matchMedia SSR 崩溃）', async () => {
    const html = await renderServer(FluereScrollView, '滚动内容')
    expect(html).toContain('fui-scrollview')
    expect(html).toContain('滚动内容')
  })
})
