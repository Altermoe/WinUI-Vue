/* oxlint-disable prefer-named-capture-group, no-magic-numbers -- 样式契约测试要读 SFC 源码做文本解析，正则与下标属测试细节 */
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import FluereCheckbox from './checkbox.vue'
import checkboxSfc from './checkbox.vue?raw'

/**
 * 从 SFC 的 `<style>` 块解析出「选择器 → 声明」，用于断言状态样式。
 *
 * jsdom 不解析 CSS 自定义属性（var()），拿不到可靠的计算样式，所以这里退一步
 * 断言声明本身——守住曾经跑偏的 WinUI 还原规则。
 *
 * 对照来源：WinUI 3（Windows App SDK 1.8）
 *   src/controls/dev/CommonStyles/CheckBox_themeresources.xaml
 *   src/controls/dev/CommonStyles/Common_themeresources.xaml
 */
const readStyleRules = (): Map<string, string> => {
  const styleBlock = /<style[^>]*>(?<css>[\s\S]*?)<\/style>/.exec(checkboxSfc)?.groups?.css ?? ''
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

describe('FluereCheckbox 渲染契约', () => {
  it('渲染为 role=checkbox 的可交互根节点，并包含方块与内容插槽', () => {
    const wrapper = mount(FluereCheckbox, { slots: { default: '接收通知' } })
    const root = wrapper.get('[role="checkbox"]')
    expect(root.classes()).toContain('fui-checkbox')
    expect(wrapper.find('.fui-checkbox__box').exists()).toBe(true)
    expect(wrapper.get('.fui-checkbox__content').text()).toBe('接收通知')
  })

  it('默认 unchecked：data-state=unchecked，不渲染字形', () => {
    const wrapper = mount(FluereCheckbox)
    const root = wrapper.get('[role="checkbox"]')
    expect(root.attributes('data-state')).toBe('unchecked')
    expect(root.attributes('aria-checked')).toBe('false')
    expect(wrapper.find('.fui-checkbox__glyph').exists()).toBe(false)
  })

  it('checked：data-state=checked + aria-checked=true，渲染对勾字形（winUI CheckBoxCheckedGlyph）', () => {
    const wrapper = mount(FluereCheckbox, { props: { modelValue: true } })
    const root = wrapper.get('[role="checkbox"]')
    expect(root.attributes('data-state')).toBe('checked')
    expect(root.attributes('aria-checked')).toBe('true')
    const glyph = wrapper.get('.fui-checkbox__glyph')
    expect(glyph.attributes('data-icon-name')).toBe('checkmark')
  })

  it('indeterminate：data-state=indeterminate + aria-checked=mixed，渲染横杠字形（Subtract 图标）', () => {
    const wrapper = mount(FluereCheckbox, { props: { modelValue: 'indeterminate' } })
    const root = wrapper.get('[role="checkbox"]')
    expect(root.attributes('data-state')).toBe('indeterminate')
    expect(root.attributes('aria-checked')).toBe('mixed')
    const glyph = wrapper.get('.fui-checkbox__glyph')
    expect(glyph.attributes('data-icon-name')).toBe('subtract')
  })

  it('点击触发 update:modelValue（true ↔ false）', async () => {
    const wrapper = mount(FluereCheckbox, { props: { modelValue: false } })
    await wrapper.get('[role="checkbox"]').trigger('click')
    expect(wrapper.emitted('update:modelValue')?.pop()).toEqual([true])
  })

  it('disabled：根节点禁用 + data-disabled', () => {
    const wrapper = mount(FluereCheckbox, { props: { disabled: true } })
    const root = wrapper.get('[role="checkbox"]')
    expect(root.attributes('disabled')).toBeDefined()
    expect(root.attributes('data-disabled')).toBeDefined()
  })

  it('在表单内 + name 时，补原生隐藏 checkbox input（可被表单提交）', () => {
    const wrapper = mount({
      components: { FluereCheckbox },
      template: '<form><FluereCheckbox name="opt-in" :model-value="true" /></form>',
    })
    const input = wrapper.get('input[type="checkbox"]')
    expect(input.attributes('name')).toBe('opt-in')
    expect((input.element as HTMLInputElement).checked).toBe(true)
  })
})

describe('FluereCheckbox 状态样式（WinUI 3 CheckBox 契约）', () => {
  const rules = readStyleRules()

  it('方块：20px（CheckBoxSize）+ 4px 圆角（ControlCornerRadius）+ 1px 描边', () => {
    const box = rules.get('.fui-checkbox__box') ?? ''
    expect(box).toContain('width: 20px')
    expect(box).toContain('height: 20px')
    expect(box).toContain('border-radius: var(--borderRadiusMedium)')
    expect(box).toContain(
      'border: var(--strokeWidthThin) solid var(--colorNeutralStrokeAccessible)',
    )
  })

  it('未勾选固有色：描边 = ControlStrongStrokeColorDefault，填充 = 中性底', () => {
    const box = rules.get('.fui-checkbox__box') ?? ''
    expect(box).toContain(
      'border: var(--strokeWidthThin) solid var(--colorNeutralStrokeAccessible)',
    )
    expect(box).toContain('background-color: var(--colorNeutralBackground3)')
  })

  it('根标签透明背景 + 主文字色（CheckBoxBackground/BorderBrush = transparent）', () => {
    const root = rules.get('.fui-checkbox') ?? ''
    expect(root).toContain('background: transparent')
    expect(root).toContain('border: var(--strokeWidthThin) solid transparent')
    expect(root).toContain('color: var(--colorNeutralForeground1)')
  })

  it('勾选/不确定：品牌色填充 + 同色描边（AccentFillColorDefault）', () => {
    const checked = rules.get(".fui-checkbox[data-state='checked'] .fui-checkbox__box") ?? ''
    const indeterminate =
      rules.get(".fui-checkbox[data-state='indeterminate'] .fui-checkbox__box") ?? ''
    expect(checked).toContain('background-color: var(--colorCompoundBrandBackground)')
    expect(checked).toContain('border-color: var(--colorCompoundBrandBackground)')
    expect(indeterminate).toContain('background-color: var(--colorCompoundBrandBackground)')
  })

  it('勾选 hover：品牌色深一档（AccentFillColorSecondary → …BackgroundHover）', () => {
    const hover = rules.get(
      ".fui-checkbox:hover:not(:disabled):not([data-disabled])[data-state='checked'] .fui-checkbox__box",
    )
    expect(hover).toBeDefined()
    expect(hover ?? '').toContain('background-color: var(--colorCompoundBrandBackgroundHover)')
  })

  it('disabled：全套 …Disabled 档（描边/填充/字形/文字）', () => {
    const boxDisabled = rules.get('.fui-checkbox:disabled .fui-checkbox__box') ?? ''
    expect(boxDisabled).toContain('background-color: var(--colorNeutralBackgroundDisabled)')
    expect(boxDisabled).toContain('border-color: var(--colorNeutralStrokeDisabled)')
    expect(rules.get('.fui-checkbox:disabled') ?? '').toContain(
      'color: var(--colorNeutralForegroundDisabled)',
    )
    expect(rules.get('.fui-checkbox:disabled .fui-checkbox__glyph') ?? '').toContain(
      'color: var(--colorNeutralForegroundDisabled)',
    )
  })

  it('focus：a11y focus ring（strokeWidthThick + colorCompoundBrandStroke）', () => {
    const focus = rules.get('.fui-checkbox:focus-visible') ?? ''
    expect(focus).toContain(
      'outline: var(--strokeWidthThick) solid var(--colorCompoundBrandStroke)',
    )
  })

  it('字形出现动效：自左向右缓动画入（left-center 原点 + translateX/scaleX 渐显）', () => {
    const glyph = rules.get('.fui-checkbox__glyph') ?? ''
    expect(glyph).toContain('transform-origin: left center')
    expect(glyph).toContain(
      'animation: fui-checkbox-glyph-in var(--durationNormal) var(--curveDecelerateMid) both',
    )

    // @keyframes 内部的多层花括号会被 readStyleRules 摊平，这里直接从源码断言关键帧内容
    const keyframes =
      /@keyframes\s+fui-checkbox-glyph-in\s*\{([\s\S]*?)\}\s*\}/.exec(checkboxSfc)?.[1] ?? ''
    expect(keyframes).toContain('translateX(-30%) scaleX(0)')
    expect(keyframes).toContain('opacity: 0')
  })
})
