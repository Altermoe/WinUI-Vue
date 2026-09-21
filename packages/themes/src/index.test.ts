import { describe, expect, it } from 'vitest'
import { presetFluere, tokensCssText } from './index'

// Preflights 数组中「base」层（token CSS 变量注入）的索引
const PREFLIGHT_BASE_LAYER = 0

describe('presetFluere', () => {
  it('is a callable UnoCSS preset named fluent2', () => {
    expect(typeof presetFluere).toBe('function')
    expect(presetFluere().name).toBe('fluent2')
  })

  it('exposes a base-layer preflight for token css injection', () => {
    const preset = presetFluere()
    const base = preset.preflights?.[PREFLIGHT_BASE_LAYER]
    expect(base).toBeDefined()
    expect(base?.layer).toBe('base')
    expect(typeof base?.getCSS).toBe('function')
  })
})

describe('tokensCssText', () => {
  it('exposes the Fluent token custom properties', () => {
    expect(tokensCssText).toContain('--borderRadiusMedium')
    expect(tokensCssText).toContain('--fontFamilyBase')
  })
})
