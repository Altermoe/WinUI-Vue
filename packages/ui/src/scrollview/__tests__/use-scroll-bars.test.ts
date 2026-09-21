/* oxlint-disable capitalized-comments, id-length, no-magic-numbers, max-statements, no-null, prefer-destructuring, prefer-global-this, numeric-separators-style, consistent-function-scoping -- 测试代码：数值常量与简短标识符、注释为测试说明，豁免结构风格规则 */
/**
 * useScrollBars：拇指几何派生（长度 / 位移）与 展开/收起 时机。
 */

import { afterEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import { BARS_HIDE_DELAY } from '../constants'
import { useScrollBars } from '../use-scroll-bars'
import { makeCore, scoped } from './helpers'

const makeBars = () => {
  const core = makeCore()
  const { value: bars, dispose } = scoped(() => useScrollBars(core))
  return { core, bars, dispose }
}

/** 两端步进按钮 band：CSS 通过 thumb 的 top / left 内缩给出（12px） */
const TRAVEL_INSET = 12

/** 从 inline style 读取 px 数值 */
const px = (value: string | undefined): number => Number.parseFloat(value ?? '')

/** 从 inline transform 中取出行程值（px） */
const travelOf = (transform: string | undefined): number =>
  px((transform ?? '').slice('translateY('.length, -2))

/** 竖向轨道假元素：trackLength 200，可用行程 200 - 2 * 12 = 176 */
const setVerticalThumb = (core: ReturnType<typeof makeCore>): Record<string, string> => {
  const vThumb = {
    style: {} as Record<string, string>,
    offsetHeight: 0,
    offsetWidth: 0,
    offsetTop: TRAVEL_INSET,
    offsetLeft: TRAVEL_INSET,
  }
  core.setElement('vBarEl', { clientHeight: 200 })
  core.setElement('vThumbEl', vThumb)
  return vThumb.style
}

describe('useScrollBars · 拇指几何', () => {
  it('拇指长度按可滚动比例缩放且有最小长度，位移按 offset 比例', async () => {
    const { core, dispose } = makeBars()
    const style = setVerticalThumb(core)

    core.extentHeight.value = 1000
    core.viewportHeight.value = 200 // scrollable = 800
    core.offsetY.value = 0
    await nextTick()
    // 可用行程 176：length = max(30, 176 * 200/1000) = 35.2；maxTravel = 140.8
    expect(style.height).toBe('35.2px')
    expect(style.transform).toBe('translateY(0px)')

    core.offsetY.value = 400 // ratio 0.5 → 0.5 * 140.8
    await nextTick()
    expect(style.transform).toBe('translateY(70.4px)')
    dispose()
  })

  it('可滚动量很大时拇指取最小长度', async () => {
    const { core, dispose } = makeBars()
    const style = setVerticalThumb(core)

    core.extentHeight.value = 2000
    core.viewportHeight.value = 200 // scrollable = 1800 → ratio = 0.1 → 176*0.1 = 17.6 < 30
    core.offsetY.value = 0
    await nextTick()
    expect(style.height).toBe('30px') // 保底 THUMB_MIN_LENGTH
    dispose()
  })

  it('滚到两端时拇指始终让开按钮 band，不与端点按钮重叠', async () => {
    const { core, dispose } = makeBars()
    const style = setVerticalThumb(core)

    core.extentHeight.value = 1000
    core.viewportHeight.value = 200 // scrollable = 800
    core.offsetY.value = 0
    await nextTick()
    const length = px(style.height)
    // 起点：行程为 0，滑块上边缘正是 band 内缩处（按钮下沿）
    expect(travelOf(style.transform)).toBe(0)

    core.offsetY.value = 800 // ratio 1 → 走完可用行程
    await nextTick()
    // 终点：滑块下边缘 = 轨道长度 - band 内缩（200 - 12）
    expect(TRAVEL_INSET + travelOf(style.transform) + length).toBe(200 - TRAVEL_INSET)
    dispose()
  })
})

describe('useScrollBars · 展开 / 收起时机', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('指针进入立即显示（无延迟），退出后 BARS_HIDE_DELAY 收起', () => {
    vi.useFakeTimers()
    const { bars, dispose } = makeBars()

    bars.onPointerEnterViewport()
    expect(bars.barsVisible.value).toBe(true)
    expect(bars.barsImmediate.value).toBe(true)

    // 悬停期间不收起
    vi.advanceTimersByTime(BARS_HIDE_DELAY)
    expect(bars.barsVisible.value).toBe(true)

    // 退出后延迟收起
    bars.onPointerLeaveViewport()
    vi.advanceTimersByTime(BARS_HIDE_DELAY - 1)
    expect(bars.barsVisible.value).toBe(true)
    vi.advanceTimersByTime(1)
    expect(bars.barsVisible.value).toBe(false)
    dispose()
  })

  it('平移进行中不收起', () => {
    vi.useFakeTimers()
    const { bars, dispose } = makeBars()
    bars.panningActive.value = true
    bars.onPointerEnterViewport()
    bars.onPointerLeaveViewport()
    vi.advanceTimersByTime(BARS_HIDE_DELAY * 2)
    expect(bars.barsVisible.value).toBe(true)
    dispose()
  })

  it('收起时复位「立即显示」标志，避免下次显示丢失过渡语义', () => {
    vi.useFakeTimers()
    const { bars, dispose } = makeBars()

    bars.onPointerEnterViewport()
    expect(bars.barsImmediate.value).toBe(true)

    bars.onPointerLeaveViewport()
    vi.advanceTimersByTime(BARS_HIDE_DELAY)
    expect(bars.barsVisible.value).toBe(false)
    expect(bars.barsImmediate.value).toBe(false)
    dispose()
  })
})

describe('useScrollBars · 轨道展开', () => {
  it('指针进入滚动条命中区才展开轨道，离开即收起', () => {
    const { bars, dispose } = makeBars()

    // 仅在滚动容器内：滑块显示，但轨道保持收起
    bars.onPointerEnterViewport()
    expect(bars.barsVisible.value).toBe(true)
    expect(bars.trackExpanded.value).toBe(false)

    bars.onBarPointerEnter()
    expect(bars.trackExpanded.value).toBe(true)

    bars.onBarPointerLeave()
    expect(bars.trackExpanded.value).toBe(false)
    dispose()
  })

  it('拖拽滑块期间保持轨道展开', () => {
    const { bars, dispose } = makeBars()

    bars.onPointerEnterViewport()
    bars.thumbDragging.value = true
    expect(bars.trackExpanded.value).toBe(true)
    dispose()
  })
})
