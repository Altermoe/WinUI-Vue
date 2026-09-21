/* oxlint-disable capitalized-comments, id-length, no-magic-numbers, max-statements, no-null, prefer-destructuring, prefer-global-this, numeric-separators-style, consistent-function-scoping -- 测试代码：数值常量与简短标识符、注释为测试说明，豁免结构风格规则 */
/**
 * createScrollViewCore：偏移钳制 / 派生尺寸 / 中心缩放 / 视图应用 / 事件。
 */

import { describe, expect, it } from 'vitest'
import { makeCore } from './helpers'

describe('createScrollViewCore', () => {
  it('clamp 将偏移限制在 [0, maxOffset]，且 maxOffset 随缩放与内容尺寸增长', () => {
    const core = makeCore()
    core.extentHeight.value = 1000
    core.viewportHeight.value = 200
    core.zoomFactor.value = 1
    expect(core.scrollableHeight.value).toBe(800)
    expect(core.clampY(900)).toBe(800)
    expect(core.clampY(-10)).toBe(0)

    core.zoomFactor.value = 2
    expect(core.scrollableHeight.value).toBe(1800)
    expect(core.clampY(2000)).toBe(1800)
  })

  it('extent 不大于视口时不可滚动', () => {
    const core = makeCore()
    core.extentWidth.value = 100
    core.viewportWidth.value = 200
    core.extentHeight.value = 100
    core.viewportHeight.value = 200
    expect(core.scrollableWidth.value).toBe(0)
    expect(core.scrollableHeight.value).toBe(0)
    expect(core.canScrollHorizontal()).toBe(false)
    expect(core.canScrollVertical()).toBe(false)
  })

  it('canScroll 遵循对应轴的 scrollMode', () => {
    const core = makeCore({ props: { verticalScrollMode: 'disabled' } })
    core.extentHeight.value = 1000
    core.viewportHeight.value = 200
    core.extentWidth.value = 500
    core.viewportWidth.value = 200
    expect(core.canScrollVertical()).toBe(false)
    expect(core.canScrollHorizontal()).toBe(true)
  })

  it('scaleAboutCenter 缩放后保持内容上某点仍在视口同一坐标', () => {
    const core = makeCore()
    const offset = 100
    const center = 50
    const from = 1
    const to = 2.5
    const next = core.scaleAboutCenter(offset, center, to / from)
    // 内容坐标约定：屏幕位置 = p*zoom - offset；点位于屏幕 center → p = (offset + center)/zoom
    const p = (offset + center) / from
    expect(p * to - next).toBeCloseTo(center, 10)
  })

  it('scaleAboutCenter 反缩放（ratio<1）同样保持中心点', () => {
    const core = makeCore()
    const offset = 120
    const center = 80
    const next = core.scaleAboutCenter(offset, center, 0.5)
    const p = (offset + center) / 2
    expect(p * 1 - next).toBeCloseTo(center, 10)
  })

  it('applyView 生成内容坐标约定的 transform（负向平移）', () => {
    const core = makeCore()
    core.setElement('contentEl', { style: {} })
    core.offsetX.value = 12
    core.offsetY.value = 34
    core.zoomFactor.value = 2
    core.applyView()
    expect(core.contentEl.value?.style.transform).toBe('translate3d(-12px, -34px, 0) scale(2)')
  })

  it('commitView 应用视图并触发 viewChanged', () => {
    const core = makeCore()
    core.setElement('contentEl', { style: {} })
    core.commitView()
    expect(core.events.viewChanged).toHaveBeenCalledTimes(1)
  })

  it('nextId 严格递增', () => {
    const core = makeCore()
    expect(core.nextId()).toBe(1)
    expect(core.nextId()).toBe(2)
    expect(core.nextId()).toBe(3)
  })

  it('setState 仅在状态变化时触发 stateChanged', () => {
    const core = makeCore()
    core.setState('interaction')
    core.setState('interaction')
    expect(core.events.stateChanged).toHaveBeenCalledTimes(1)
    core.setState('idle')
    expect(core.events.stateChanged).toHaveBeenCalledTimes(2)
  })

  it('computed 滚动条可见性遵循 scrollBarVisibility 与可滚动量', () => {
    const auto = makeCore()
    auto.extentHeight.value = 1000
    auto.viewportHeight.value = 200
    expect(auto.computedVBarVisible.value).toBe(true)
    expect(auto.computedHBarVisible.value).toBe(false)

    const hidden = makeCore({ props: { verticalScrollBarVisibility: 'hidden' } })
    hidden.extentHeight.value = 1000
    hidden.viewportHeight.value = 200
    expect(hidden.computedVBarVisible.value).toBe(false)

    const visible = makeCore({ props: { horizontalScrollBarVisibility: 'visible' } })
    expect(visible.computedHBarVisible.value).toBe(true)
  })
})
