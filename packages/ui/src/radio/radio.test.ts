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
      // 内点不再用子元素：圆内不再有 __dot / __pressed-dot 节点（radial-gradient 绘制）
      expect(item.find('.fui-radio__dot').exists()).toBe(false)
      expect(item.find('.fui-radio__pressed-dot').exists()).toBe(false)
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

  it('圆形：20px 直径 + 全圆圆角，填充/描边走顶层语义变量', () => {
    const circle = rules.get('.fui-radio__circle') ?? ''
    expect(circle).toContain('width: 20px')
    expect(circle).toContain('height: 20px')
    expect(circle).toContain('border-radius: var(--borderRadiusCircular)')
    // 外圆 bg（语义 bg 1）与外圆描边统一从 .fui-radio 的 --fill / --stroke 读取
    expect(circle).toContain('border: var(--strokeWidthThin) solid var(--stroke)')
    expect(circle).toContain('background-color: var(--fill)')
  })

  it('根按钮透明背景 + 主文字色（RadioButtonBackground/BorderBrush = transparent）', () => {
    const root = rules.get('.fui-radio') ?? ''
    expect(root).toContain('background: transparent')
    expect(root).toContain('border: var(--strokeWidthThin) solid transparent')
    expect(root).toContain('color: var(--colorNeutralForeground1)')
  })

  it('语义 bg 合成：（bg1）外圆 +（bg2）单个 radial-gradient 内点层', () => {
    // 语义 bg 1：外圆填充默认中性底
    const root = rules.get('.fui-radio') ?? ''
    expect(root).toContain('--fill: var(--colorNeutralBackground3)')
    // 语义 bg 2：内点经单个 gradient 画在圆上，色值为 transparent 即不绘制
    const circle = rules.get('.fui-radio__circle') ?? ''
    expect(circle).toContain('background-image:')
    expect(circle).toContain('var(--dot-bg)')
    expect(circle).toContain('var(--dot-radius)')
    // 内点默认透明且半径 0（未选/未按下时无点）
    expect(root).toContain('--dot-bg: transparent')
    expect(root).toContain('--dot-radius: 0px')
  })

  it('抗锯齿：点边缘过渡带而非硬切（--dot-fade 0.4px）', () => {
    const root = rules.get('.fui-radio') ?? ''
    expect(root).toContain('--dot-fade: 0.4px')
    // gradient 停止点由「radius」改为「radius - fade → radius」渐隐
    const circle = rules.get('.fui-radio__circle') ?? ''
    expect(circle).toContain('var(--dot-fade)')
    expect(circle).toContain('calc(var(--dot-radius) - var(--dot-fade))')
  })

  it('@property 注册可插值自定义属性，使内点颜色/半径可过渡', () => {
    // 注册为 <color>/<length> 后，transition 才能对它们逐帧插值（否则瞬切）
    expect(radioButtonSfc).toContain('@property --dot-bg')
    expect(radioButtonSfc).toContain("syntax: '<color>'")
    expect(radioButtonSfc).toContain('@property --dot-radius')
    expect(radioButtonSfc).toContain("syntax: '<length>'")
    // 根上声明了对内点自定义属性的过渡
    const root = rules.get('.fui-radio') ?? ''
    expect(root).toContain('transition:')
    expect(root).toContain('--dot-bg')
    expect(root).toContain('--dot-radius')
  })

  it('选中：品牌实心圆 + 同色描边 + 白色内点显现', () => {
    const checked = rules.get(".fui-radio[data-state='checked']") ?? ''
    expect(checked).toContain('--fill: var(--fill-checked)')
    expect(checked).toContain('--stroke: var(--stroke-checked)')
    expect(checked).toContain('--dot-bg: var(--dot-bg-checked)')
    // 内点固有色：TextOnAccentFillColorPrimary → colorNeutralForegroundOnBrand（白色）
    expect(rules.get('.fui-radio') ?? '').toContain(
      '--dot-bg-checked: var(--colorNeutralForegroundOnBrand)',
    )
    // 尺寸：CheckGlyphSize 12px → 半径 6px（缺省半径 0；仅 checked 时放大到 6px）
    expect(checked).toContain('--dot-radius: 6px')
    expect(rules.get('.fui-radio') ?? '').toContain('--dot-radius: 0px')
  })

  it('未选 hover：填充加深一档（Secondary → Tertiary）', () => {
    const hover = rules.get(
      ".fui-radio:hover:not(:disabled):not([data-disabled]):not([data-state='checked'])",
    )
    expect(hover ?? '').toContain('--fill: var(--fill-unchecked-hover)')
  })

  it('选中 hover：品牌色深一档 + 内点放大到 14px（CheckGlyphPointerOverSize）', () => {
    const hover = rules.get(
      ".fui-radio:hover:not(:disabled):not([data-disabled])[data-state='checked']",
    )
    expect(hover ?? '').toContain('--fill: var(--fill-checked-hover)')
    expect(hover ?? '').toContain('--stroke: var(--stroke-checked-hover)')
    expect(hover ?? '').toContain('--dot-radius: var(--dot-radius-checked-hover)') // 12→14
  })

  it('未选 pressed：填充 Quarternary + WinUI 原样载入禁用描边 + 按下预览点显现', () => {
    const pressed = rules.get(
      ".fui-radio:active:not(:disabled):not([data-disabled]):not([data-state='checked'])",
    )
    expect(pressed ?? '').toContain('--fill: var(--fill-unchecked-active)')
    expect(pressed ?? '').toContain('--stroke: var(--stroke-unchecked-active)')
    expect(pressed ?? '').toContain('--dot-bg: var(--dot-bg-checked)') // 按下预览点（白）
    expect(pressed ?? '').toContain('--dot-radius: var(--press-radius)') // 放大到 10px
  })

  it('按下预览点：按住时白色内点放大到 10px（PressedCheckGlyph）', () => {
    const pressed = rules.get(
      ".fui-radio:active:not(:disabled):not([data-disabled])[data-state='checked']",
    )
    expect(pressed ?? '').toContain('--dot-bg: var(--dot-bg-checked)')
    expect(pressed ?? '').toContain('--dot-radius: var(--press-radius)')
    expect(rules.get('.fui-radio') ?? '').toContain('--press-radius: 5px') // 10px 终值
  })

  it('disabled：全套 …Disabled 档（描边/填充/文字 / disabled+checked 内点色）', () => {
    const disabled = rules.get('.fui-radio:disabled') ?? ''
    expect(disabled).toContain('--fill: var(--colorNeutralBackgroundDisabled)')
    expect(disabled).toContain('--stroke: var(--colorNeutralStrokeDisabled)')
    expect(disabled).toContain('color: var(--colorNeutralForegroundDisabled)')
    // 仅 disabled+checked 时才把内点换为禁用文字色（未选禁用仍无点）
    expect(rules.get(".fui-radio:disabled[data-state='checked']") ?? '').toContain(
      '--dot-bg: var(--colorNeutralForegroundDisabled)',
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
