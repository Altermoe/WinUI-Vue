import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { createFluentIcon } from './factory'

const ADD_PATHS = ['M10 4v12', 'M4 10h12']

const AddIcon = createFluentIcon({
  name: 'add',
  size: 20,
  style: 'regular',
  paths: ADD_PATHS,
})

describe('createFluentIcon', () => {
  it('renders an inline svg sized to the native design size', () => {
    const wrapper = mount(AddIcon)
    const svg = wrapper.get('svg')
    expect(svg.attributes('data-icon-name')).toBe('add')
    expect(svg.attributes('width')).toBe('20')
    expect(svg.attributes('height')).toBe('20')
    expect(svg.attributes('fill')).toBe('currentColor')
    expect(svg.attributes('aria-hidden')).toBe('true')
  })

  it('renders every icon path', () => {
    const wrapper = mount(AddIcon)
    expect(wrapper.findAll('path')).toHaveLength(ADD_PATHS.length)
  })

  it('switches to labelled mode when a title is provided', () => {
    const wrapper = mount(AddIcon, { props: { title: '添加' } })
    const svg = wrapper.get('svg')
    expect(svg.attributes('role')).toBe('img')
    expect(svg.attributes('aria-hidden')).toBeUndefined()
    expect(wrapper.find('title').text()).toBe('添加')
  })

  it('supports overriding the rendered size', () => {
    const wrapper = mount(AddIcon, { props: { size: 24 } })
    const svg = wrapper.get('svg')
    expect(svg.attributes('width')).toBe('24')
    expect(svg.attributes('height')).toBe('24')
  })
})
