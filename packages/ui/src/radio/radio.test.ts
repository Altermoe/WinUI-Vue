/* oxlint-disable prefer-named-capture-group, no-magic-numbers -- 样式契约测试要读 SFC 源码做文本解析，正则与下标属测试细节 */
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { nextTick, ref } from 'vue'
import FluereRadioButton from './radio-button.vue'
import radioButtonSfc from './radio-button.vue?raw'
import FluereRadioGroup from './radio-group.vue'
import radioGroupSfc from './radio-group.vue?raw'

/**
 * 从 SFC 的 `<style>` 块解析出「选择器 → 声明」，用于断言状态样式。
 *
 * jsdom 不解析 CSS 自定义属性（var()），拿不到可靠的计算样式，所以这里退一步
 * 断言声明本身——守住曾经跑偏的 WinUI 还原规则。
 *
 * 对照来源：WinUI 3（Windows App SDK 1.8）
 *   src/controls/dev/CommonStyles/RadioButton_themeresources.xaml
 *   src/controls/dev/CommonStyles/Common_themeresources.xaml
 */
const readStyleRules = (sfc: string): Map<string, string> => {
  const styleBlock = /<style[^>]*>(?<css>[\s\S]*?)<\/style>/.exec(sfc)?.groups?.css ?? ''
  const rules = new Map<string, string>()
  for (const block of styleBlock.replace(/\/\*[\s\S]*?\*\//g, '').split('}')) {
    const [selectorText, declarations] = block.split('{')
    if (selectorText !== undefined && declarations !== undefined) {
      for (const selector of selectorText.split(',')) {
        // 选择器和声明都统一空白（多行选择器折叠为单空格），便于精确匹配
        rules.set(selector.replace(/\s+/g, ' ').trim(), declarations.replace(/\s+/g, ' ').trim())
      }
    }
  }
  return rules
}

/** 组 + 两项的宿主，供交互 / v-model 断言 */
const host = (initial?: string) =>
  mount({
    components: { FluereRadioButton, FluereRadioGroup },
    setup() {
      const value = ref(initial)
      return { value }
    },
    template: `
      <FluereRadioGroup v-model="value">
        <FluereRadioButton value="a">苹果</FluereRadioButton>
        <FluereRadioButton value="b" label="B">香蕉</FluereRadioButton>
      </FluereRadioGroup>
    `,
  })

describe('FluereRadioGroup + FluereRadioButton 渲染契约', () => {
  it('组渲染为 role=radiogroup，内含两个 role=radio 项，各项含圆 + 内容', () => {
    const wrapper = host()
    const group = wrapper.get('[role="radiogroup"]')
    expect(group.classes()).toContain('fui-radio-group')
    expect(group.attributes('data-orientation')).toBe('vertical')

    const items = wrapper.findAll('[role="radio"]')
    expect(items).toHaveLength(2)
    for (const item of items) {
      expect(item.classes()).toContain('fui-radio')
      expect(item.find('.fui-radio__circle').exists()).toBe(true)
      expect(item.find('.fui-radio__dot').exists()).toBe(true)
      expect(item.find('.fui-radio__pressed-dot').exists()).toBe(true)
    }
    expect(wrapper.get('.fui-radio__content').text()).toBe('苹果')
  })

  it('默认均 unchecked：data-state=unchecked + aria-checked=false', () => {
    const wrapper = host()
    const items = wrapper.findAll('[role="radio"]')
    for (const item of items) {
      expect(item.attributes('data-state')).toBe('unchecked')
      expect(item.attributes('aria-checked')).toBe('false')
    }
  })

  it('受控选中：modelValue=a 时该项 checked，另一项 unchecked（同组互斥）', () => {
    const wrapper = host('a')
    const items = wrapper.findAll('[role="radio"]')
    expect(items[0].attributes('data-state')).toBe('checked')
    expect(items[0].attributes('aria-checked')).toBe('true')
    expect(items[1].attributes('data-state')).toBe('unchecked')
    expect(items[1].attributes('aria-checked')).toBe('false')
  })

  it('点击另一项：更新 v-model 并切换选中（互斥）', async () => {
    const wrapper = host('a')
    const items = wrapper.findAll('[role="radio"]')
    await items[1].trigger('click')
    expect(wrapper.vm.value).toBe('b')

    await nextTick()
    const after = wrapper.findAll('[role="radio"]')
    expect(after[1].attributes('data-state')).toBe('checked')
    expect(after[0].attributes('data-state')).toBe('unchecked')
  })

  it('disabled 组：全部项禁用 + data-disabled', () => {
    const wrapper = mount({
      components: { FluereRadioButton, FluereRadioGroup },
      template: `
        <FluereRadioGroup disabled>
          <FluereRadioButton value="a">A</FluereRadioButton>
        </FluereRadioGroup>
      `,
    })
    const item = wrapper.get('[role="radio"]')
    expect(item.attributes('disabled')).toBeDefined()
    expect(item.attributes('data-disabled')).toBeDefined()
  })

  it('label 兜底 aria-label：无可见文本时提供可访问名', () => {
    const wrapper = mount({
      components: { FluereRadioButton, FluereRadioGroup },
      template: `
        <FluereRadioGroup>
          <FluereRadioButton value="b" label="B">香蕉</FluereRadioButton>
        </FluereRadioGroup>
      `,
    })
    expect(wrapper.get('[role="radio"]').attributes('aria-label')).toBe('B')
  })

  it('横向组：data-orientation=horizontal 排布', () => {
    const wrapper = mount({
      components: { FluereRadioButton, FluereRadioGroup },
      template: `
        <FluereRadioGroup orientation="horizontal">
          <FluereRadioButton value="a">A</FluereRadioButton>
        </FluereRadioGroup>
      `,
    })
    const group = wrapper.get('[role="radiogroup"]')
    expect(group.attributes('data-orientation')).toBe('horizontal')
    expect(group.attributes('aria-orientation')).toBe('horizontal')
  })
})

describe('FluereRadioButton 状态样式（WinUI 3 RadioButton 契约）', () => {
  const rules = readStyleRules(radioButtonSfc)

  it('圆形：20px 直径 + 全圆圆角 + 1px 描边', () => {
    const circle = rules.get('.fui-radio__circle') ?? ''
    expect(circle).toContain('width: 20px')
    expect(circle).toContain('height: 20px')
    expect(circle).toContain('border-radius: var(--borderRadiusCircular)')
    expect(circle).toContain(
      'border: var(--strokeWidthThin) solid var(--colorNeutralStrokeAccessible)',
    )
  })

  it('根按钮透明背景 + 主文字色（RadioButtonBackground/BorderBrush = transparent）', () => {
    const root = rules.get('.fui-radio') ?? ''
    expect(root).toContain('background: transparent')
    expect(root).toContain('border: var(--strokeWidthThin) solid transparent')
    expect(root).toContain('color: var(--colorNeutralForeground1)')
  })

  it('未选固有色：描边 = ControlStrongStrokeColorDefault，填充 = 中性底', () => {
    const circle = rules.get('.fui-radio__circle') ?? ''
    expect(circle).toContain(
      'border: var(--strokeWidthThin) solid var(--colorNeutralStrokeAccessible)',
    )
    expect(circle).toContain('background-color: var(--colorNeutralBackground3)')
  })

  it('选中：品牌实心圆 + 同色描边（AccentFillColorDefault），内点显现', () => {
    const checked = rules.get(".fui-radio[data-state='checked'] .fui-radio__circle") ?? ''
    expect(checked).toContain('background-color: var(--colorCompoundBrandBackground)')
    expect(checked).toContain('border-color: var(--colorCompoundBrandBackground)')

    const dot = rules.get(".fui-radio[data-state='checked'] .fui-radio__dot") ?? ''
    expect(dot).toContain('opacity: 1')
    expect(dot).toContain('transform: translate(-50%, -50%) scale(1)')
  })

  it('内点固有色：TextOnAccentFillColorPrimary → colorNeutralForegroundOnBrand（白色）', () => {
    const dot = rules.get('.fui-radio__dot') ?? ''
    expect(dot).toContain('background-color: var(--colorNeutralForegroundOnBrand)')
  })

  it('未选 hover：填充加深一档（Secondary → Tertiary）', () => {
    const hover = rules.get(
      ".fui-radio:hover:not(:disabled):not([data-disabled])[data-state='unchecked'] .fui-radio__circle",
    )
    expect(hover).toBeDefined()
    expect(hover ?? '').toContain('background-color: var(--colorNeutralBackground4)')
  })

  it('选中 hover：品牌色深一档 + 内点放大到 14px（CheckGlyphPointerOverSize）', () => {
    const hover = rules.get(
      ".fui-radio:hover:not(:disabled):not([data-disabled])[data-state='checked'] .fui-radio__circle",
    )
    expect(hover ?? '').toContain('background-color: var(--colorCompoundBrandBackgroundHover)')

    const dot = rules.get(
      ".fui-radio:hover:not(:disabled):not([data-disabled])[data-state='checked'] .fui-radio__dot",
    )
    expect(dot ?? '').toContain('scale(1.1667)') // 12→14
  })

  it('未选 pressed：填充 Quarternary + WinUI 原样载入禁用描边', () => {
    const pressed = rules.get(
      ".fui-radio:active:not(:disabled):not([data-disabled])[data-state='unchecked'] .fui-radio__circle",
    )
    expect(pressed ?? '').toContain('background-color: var(--colorNeutralBackground5)')
    expect(pressed ?? '').toContain('border-color: var(--colorNeutralStrokeDisabled)')
  })

  it('按下预览点：按住浅显并放大到 10px（PressedCheckGlyph 4→10）', () => {
    const pressed = rules.get(
      '.fui-radio:active:not(:disabled):not([data-disabled]) .fui-radio__pressed-dot',
    )
    expect(pressed ?? '').toContain('opacity: 1')
    expect(pressed ?? '').toContain('scale(2.5)') // 4→10
  })

  it('disabled：全套 …Disabled 档（描边/填充/文字）', () => {
    const circle = rules.get('.fui-radio:disabled .fui-radio__circle') ?? ''
    expect(circle).toContain('background-color: var(--colorNeutralBackgroundDisabled)')
    expect(circle).toContain('border-color: var(--colorNeutralStrokeDisabled)')
    expect(rules.get('.fui-radio:disabled') ?? '').toContain(
      'color: var(--colorNeutralForegroundDisabled)',
    )
  })

  it('focus：a11y focus ring（strokeWidthThick + colorCompoundBrandStroke）', () => {
    const focus = rules.get('.fui-radio:focus-visible') ?? ''
    expect(focus).toContain(
      'outline: var(--strokeWidthThick) solid var(--colorCompoundBrandStroke)',
    )
  })
})

describe('FluereRadioGroup 布局样式', () => {
  const rules = readStyleRules(radioGroupSfc)

  it('默认纵向堆叠，横向时水平排开', () => {
    const vertical = rules.get('.fui-radio-group') ?? ''
    expect(vertical).toContain('flex-direction: column')
    const horizontal = rules.get(".fui-radio-group[data-orientation='horizontal']") ?? ''
    expect(horizontal).toContain('flex-direction: row')
  })
})
