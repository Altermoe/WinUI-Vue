/* oxlint-disable prefer-named-capture-group, no-magic-numbers -- 样式契约测试要读 SFC 源码做文本解析，正则与下标属测试细节 */
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import FluereInput from './input.vue'
import inputSfc from './input.vue?raw'

/**
 * 从 SFC 的 `<style>` 块解析出「选择器 → 声明」，用于断言状态样式。
 *
 * jsdom 不解析 CSS 自定义属性（var()），拿不到可靠的计算样式，所以这里退一步
 * 断言声明本身——守住「focus 只有底边高亮」这类曾经跑偏的 WinUI 还原规则。
 *
 * 对照来源：WinUI 3（Windows App SDK 1.8）
 *   src/controls/dev/CommonStyles/TextBox_themeresources.xaml
 *   src/controls/dev/CommonStyles/Common_themeresources.xaml
 */
const readStyleRules = (): Map<string, string> => {
  const styleBlock = /<style[^>]*>(?<css>[\s\S]*?)<\/style>/.exec(inputSfc)?.groups?.css ?? ''
  const rules = new Map<string, string>()
  for (const block of styleBlock.replace(/\/\*[\s\S]*?\*\//g, '').split('}')) {
    const [selectorText, declarations] = block.split('{')
    if (selectorText !== undefined && declarations !== undefined) {
      for (const selector of selectorText.split(',')) {
        rules.set(selector.trim(), declarations.replace(/\s+/g, ' ').trim())
      }
    }
  }
  return rules
}

describe('FluereInput 渲染契约', () => {
  it('默认渲染 outline / medium', () => {
    const wrapper = mount(FluereInput)
    expect(wrapper.get('input').classes()).toEqual([
      'fui-input',
      'fui-input--medium',
      'fui-input--outline',
    ])
  })

  it('把 size / appearance / disabled / invalid 映射到类名与 aria', () => {
    const wrapper = mount(FluereInput, {
      props: {
        size: 'large',
        appearance: 'underline',
        invalid: true,
        disabled: true,
        placeholder: '姓名',
      },
    })
    const input = wrapper.get('input')
    expect(input.classes()).toContain('fui-input--large')
    expect(input.classes()).toContain('fui-input--underline')
    expect(input.classes()).toContain('fui-input--invalid')
    expect(input.attributes('aria-invalid')).toBe('true')
    expect(input.attributes('disabled')).toBeDefined()
    expect(input.attributes('placeholder')).toBe('姓名')
  })

  it('v-model 双向绑定', async () => {
    const wrapper = mount(FluereInput, { props: { modelValue: '初值' } })
    const input = wrapper.get('input')
    expect((input.element as HTMLInputElement).value).toBe('初值')
    await input.setValue('新值')
    expect(wrapper.emitted('update:modelValue')?.pop()).toEqual(['新值'])
  })
})

describe('FluereInput 状态样式（WinUI 3 TextBox 契约）', () => {
  const rules = readStyleRules()

  it('rest：顶/左/右浅描边，底边控件描边（TextControlElevationBorderBrush）', () => {
    const base = rules.get('.fui-input') ?? ''
    expect(base).toContain('border: var(--strokeWidthThin) solid var(--colorNeutralStrokeAlpha)')
    expect(base).toContain('border-bottom-color: var(--colorNeutralStroke1)')
  })

  it('背景色拆成两个语义变量：真实背景 / 高亮背景', () => {
    const base = rules.get('.fui-input') ?? ''
    expect(base).toContain('--fui-input-background: var(--colorNeutralBackground1)')
    expect(base).toContain('--fui-input-highlight-background: transparent')
    // 合成背景 = 背景色 + 底部 1px 高亮带（同一层里色值在前、渐变在后）
    expect(base).toContain('var(--fui-input-background) linear-gradient(')
    expect(base).toContain('background-clip: padding-box')
  })

  it('高亮带「刀形」：渐变沿水平方向，只有最底 1px 是强调色', () => {
    const base = rules.get('.fui-input') ?? ''
    expect(base).toContain('transparent calc(100% - var(--strokeWidthThin))')
    expect(base).toContain(
      'var(--fui-input-highlight-background) calc(100% - var(--strokeWidthThin))',
    )
    // 不允许再用 inset 阴影：它会沿圆角在两端上翘成月牙形
    expect(base).not.toContain('box-shadow')
  })

  it('高亮色注册为 <color> 并参与缓动（渐变停靠点本身不可过渡）', () => {
    const property = rules.get('@property --fui-input-highlight-background') ?? ''
    expect(property).toContain("syntax: '<color>'")
    expect(property).toContain('inherits: false')
    expect(property).toContain('initial-value: transparent')

    const base = rules.get('.fui-input') ?? ''
    expect(base).toContain(
      '--fui-input-highlight-background var(--durationNormal) var(--curveDecelerateMid)',
    )
  })

  it('hover：只换背景变量，描边不动；Focused 优先于 PointerOver', () => {
    const hover = rules.get('.fui-input:hover:not(:disabled):not(:focus-visible)') ?? ''
    expect(hover).toContain('--fui-input-background: var(--colorNeutralBackground1Hover)')
    expect(hover).not.toContain('border')
  })

  it('focus：只换高亮色与底描边色，四边宽度不变（无重排）', () => {
    const focus = rules.get('.fui-input:focus-visible') ?? ''
    expect(focus).toContain('--fui-input-highlight-background: var(--colorCompoundBrandStroke)')
    expect(focus).toContain('border-color: var(--colorNeutralStrokeAlpha)')
    expect(focus).toContain('border-bottom-color: var(--colorCompoundBrandStroke)')
    // 不许靠改 border-width 加粗：那会重排并挤压输入内容
    expect(focus).not.toContain('border-bottom-width')
    expect(focus).not.toContain('border-bottom:')
  })

  it('disabled：四边同色描边 + 禁用填充（ControlStrokeColorDefaultBrush）', () => {
    const disabled = rules.get('.fui-input:disabled') ?? ''
    expect(disabled).toContain('--fui-input-background: var(--colorNeutralBackgroundDisabled)')
    expect(disabled).toContain('border-color: var(--colorNeutralStrokeDisabled)')
    expect(disabled).toContain('color: var(--colorNeutralForegroundDisabled)')
  })

  it('invalid：danger 描边，聚焦时高亮同样走 danger（库扩展状态）', () => {
    expect(rules.get('.fui-input--invalid') ?? '').toContain(
      'border-color: var(--colorStatusDangerBorder2)',
    )
    expect(rules.get('.fui-input--invalid:focus-visible') ?? '').toContain(
      '--fui-input-highlight-background: var(--colorStatusDangerBorder2)',
    )
  })
})
