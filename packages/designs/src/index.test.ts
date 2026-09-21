// 通过别名 @fluere-vue/designs 引用本包入口，冒烟验证 vitest 的工作区别名解析。
import { tokenNames } from '@fluere-vue/designs'
import { describe, expect, it } from 'vitest'

describe('@fluere-vue/designs tokenNames', () => {
  it('exposes the curated Fluent semantic tokens', () => {
    expect(tokenNames).toMatchObject({
      borderRadiusMedium: true,
      colorBrandBackground: true,
      fontFamilyBase: true,
      spacingHorizontalS: true,
    })
  })

  it('covers the token families used by components', () => {
    expect(tokenNames).toHaveProperty('fontSizeBase300')
    expect(tokenNames).toHaveProperty('colorNeutralForeground1')
    expect(tokenNames).toHaveProperty('strokeWidthThin')
  })
})
