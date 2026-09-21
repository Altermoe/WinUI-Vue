import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import FluereButton from './button.vue'

describe('FluereButton', () => {
  it('renders the default secondary / medium / rounded button', () => {
    const wrapper = mount(FluereButton, { slots: { default: '确定' } })
    const button = wrapper.get('button')
    expect(button.classes()).toContain('fui-button--secondary')
    expect(button.classes()).toContain('fui-button--medium')
    expect(button.classes()).toContain('fui-button--rounded')
    expect(button.text()).toBe('确定')
  })

  it('applies the primary appearance and block modifier', () => {
    const wrapper = mount(FluereButton, {
      props: { appearance: 'primary', block: true },
      slots: { default: '提交' },
    })
    const button = wrapper.get('button')
    expect(button.classes()).toContain('fui-button--primary')
    expect(button.classes()).toContain('fui-button--block')
  })

  it('maps disabled and selected state onto the native button', () => {
    const wrapper = mount(FluereButton, {
      props: { disabled: true, selected: true },
    })
    const button = wrapper.get('button')
    expect(button.attributes('disabled')).toBeDefined()
    expect(button.attributes('aria-pressed')).toBe('true')
  })

  it('hides the content slot in icon-only mode', () => {
    const wrapper = mount(FluereButton, {
      props: { iconOnly: true },
      slots: { default: '不可见' },
    })
    expect(wrapper.find('.fui-button__content').exists()).toBe(false)
  })
})
