/* oxlint-disable no-magic-numbers -- 纯函数用例：刻度分布本身就是在断言具体数字 */
/**
 * 刻度几何：刻度分布 / 刻度条显隐 / 样式投影。
 *
 * 这些都是纯函数，不需要挂载组件；组件侧的契约测试只负责验证「绑定到了模板」。
 */

import { describe, expect, it } from 'vitest'
import { getHostStyle, getTickBars, getTickPercents, getTickStyle } from '../geometry'

describe('getTickPercents（WinUI TickBar 的刻度分布）', () => {
  const base = { min: 0, max: 100, tickFrequency: 25, tickPlacement: 'outside' } as const

  it('TickPlacement=none 不画刻度（WinUI 默认）', () => {
    expect(getTickPercents({ ...base, tickPlacement: 'none' })).toEqual([])
  })

  it('TickFrequency ≤ 0 不画刻度（WinUI 默认 0）', () => {
    expect(getTickPercents({ ...base, tickFrequency: 0 })).toEqual([])
    expect(getTickPercents({ ...base, tickFrequency: -10 })).toEqual([])
  })

  it('range ≤ 0 不画刻度（无有效值域）', () => {
    expect(getTickPercents({ ...base, min: 10, max: 10 })).toEqual([])
    expect(getTickPercents({ ...base, min: 10, max: 5 })).toEqual([])
  })

  it('含首尾端点，按区间百分比分布', () => {
    expect(getTickPercents(base)).toEqual([0, 25, 50, 75, 100])
  })

  it('min ≠ 0 时按区间比例分布，端点仍是 0% / 100%', () => {
    expect(getTickPercents({ ...base, min: -50, max: 50, tickFrequency: 50 })).toEqual([0, 50, 100])
  })

  it('tickFrequency 不整除时不会越界多画一条（浮点误差被容忍）', () => {
    expect(getTickPercents({ ...base, tickFrequency: 30 })).toEqual([0, 30, 60, 90])
  })

  it('range 不足一个 tickFrequency 时不画刻度', () => {
    expect(getTickPercents({ ...base, max: 10, tickFrequency: 25 })).toEqual([])
  })

  it('数量超过上限时整体放弃，避免渲染出上万个节点', () => {
    expect(getTickPercents({ ...base, max: 1000, tickFrequency: 1 })).toEqual([])
  })
})

describe('getTickBars（三条 TickBar 的显隐矩阵）', () => {
  const percents = [0, 100]

  it('没有刻度线时三条都不画', () => {
    expect(getTickBars('outside', [])).toEqual({ inline: false, top: false, bottom: false })
  })

  it('inline 只画轨道内刻度', () => {
    expect(getTickBars('inline', percents)).toEqual({ inline: true, top: false, bottom: false })
  })

  it('outside 两侧都画（纵向时对应左 / 右）', () => {
    expect(getTickBars('outside', percents)).toEqual({ inline: false, top: true, bottom: true })
  })

  it('top-left / bottom-right 只画单侧', () => {
    expect(getTickBars('top-left', percents)).toEqual({ inline: false, top: true, bottom: false })
    expect(getTickBars('bottom-right', percents)).toEqual({
      inline: false,
      top: false,
      bottom: true,
    })
  })

  it('none 即便有刻度也不画', () => {
    expect(getTickBars('none', percents)).toEqual({ inline: false, top: false, bottom: false })
  })
})

describe('样式投影', () => {
  it('getTickStyle：位置交给 --fui-slider-tick', () => {
    expect(getTickStyle(25)).toEqual({ '--fui-slider-tick': '25%' })
  })

  it('getHostStyle：纵向给长度变量，横向交给布局（不产生多余内联样式）', () => {
    expect(getHostStyle('vertical', 160)).toEqual({ '--fui-slider-length': '160px' })
    expect(getHostStyle('horizontal', 160)).toBeUndefined()
  })
})
