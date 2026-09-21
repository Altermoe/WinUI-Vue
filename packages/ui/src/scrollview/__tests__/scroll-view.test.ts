/* oxlint-disable capitalized-comments, consistent-function-scoping, max-statements, no-magic-numbers --
 * 测试代码：文件头注释为被测契约说明，挂载工具按用例就地定义更直观，
 * 断言步骤数与窗口部件数量属测试表达，豁免结构风格规则。 */
/**
 * FluereScrollView 组件：滚动条「滑块 / 轨道 / 双轴角落」三层可见性的模板装配。
 *
 * 可见性本身由 CSS 过渡驱动，JS 只切换状态类，这里断言类名与窗口部件结构，
 * 把「指针进入容器显示滑块 → 进入命中区展开轨道 → 离开收起」的契约钉住。
 */
import { mount } from '@vue/test-utils'
import { beforeAll, describe, expect, it, vi } from 'vitest'
import FluereScrollView from '../scroll-view.vue'

/** jsdom 无 ResizeObserver：测量层只依赖其回调，空实现替身即可 */
class ResizeObserverStub {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}

beforeAll(() => {
  vi.stubGlobal('ResizeObserver', ResizeObserverStub)
})

describe('FluereScrollView · 滚动条装配', () => {
  it('渲染轨道与两端步进按钮，并带有可访问名称', () => {
    const wrapper = mount(FluereScrollView, {
      props: { verticalScrollBarVisibility: 'visible' },
    })

    const bar = wrapper.get('.fui-scrollview__scrollbar--vertical')
    expect(bar.find('.fui-scrollview__track').exists()).toBe(true)
    expect(bar.find('.fui-scrollview__thumb--vertical').exists()).toBe(true)

    const buttons = bar.findAll('.fui-scrollview__track-button')
    expect(buttons).toHaveLength(2)
    expect(buttons.map((button) => button.attributes('aria-label'))).toEqual([
      'Scroll up',
      'Scroll down',
    ])
    // 步进按钮不出现在 Tab 序列中（与 WinUI ScrollBar 一致）
    expect(buttons.every((button) => button.attributes('tabindex') === '-1')).toBe(true)
    wrapper.unmount()
  })

  it('指针进入容器只显示滑块，进入命中区才展开轨道', async () => {
    const wrapper = mount(FluereScrollView, {
      props: { verticalScrollBarVisibility: 'visible' },
    })
    const root = wrapper.get('.fui-scrollview')
    const bar = wrapper.get('.fui-scrollview__scrollbar--vertical')

    expect(root.classes()).not.toContain('fui-scrollview--bars-visible')
    expect(root.classes()).not.toContain('fui-scrollview--bars-expanded')

    await root.trigger('pointerenter')
    expect(root.classes()).toContain('fui-scrollview--bars-visible')
    expect(root.classes()).not.toContain('fui-scrollview--bars-expanded')

    await bar.trigger('pointerenter')
    expect(root.classes()).toContain('fui-scrollview--bars-expanded')

    await bar.trigger('pointerleave')
    expect(root.classes()).not.toContain('fui-scrollview--bars-expanded')
    // 指针仍在容器内：滑块保持显示
    expect(root.classes()).toContain('fui-scrollview--bars-visible')
    wrapper.unmount()
  })

  it('双轴滚动条同时可见时标记角落让位', () => {
    const wrapper = mount(FluereScrollView, {
      props: {
        horizontalScrollBarVisibility: 'visible',
        verticalScrollBarVisibility: 'visible',
      },
    })
    expect(wrapper.get('.fui-scrollview').classes()).toContain('fui-scrollview--both-bars')
    expect(wrapper.find('.fui-scrollview__separator').exists()).toBe(true)
    wrapper.unmount()
  })
})
