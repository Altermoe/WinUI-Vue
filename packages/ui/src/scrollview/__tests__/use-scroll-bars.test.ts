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

describe('useScrollBars · 拇指几何', () => {
  it('拇指长度按可滚动比例缩放且有最小长度，位移按 offset 比例', async () => {
    const { core, dispose } = makeBars()
    const vBar = { clientHeight: 200 }
    const vThumb = { style: {} as Record<string, string>, offsetHeight: 0, offsetWidth: 0 }
    core.setElement('vBarEl', vBar)
    core.setElement('vThumbEl', vThumb)

    core.extentHeight.value = 1000
    core.viewportHeight.value = 200 // scrollable = 800
    core.offsetY.value = 0
    await nextTick()
    // length = max(30, 200 * 200/1000) = 40; maxTravel = 160
    expect(vThumb.style.height).toBe('40px')
    expect(vThumb.style.transform).toBe('translateY(0px)')

    core.offsetY.value = 400 // ratio 0.5 → 0.5 * 160
    await nextTick()
    expect(vThumb.style.transform).toBe('translateY(80px)')
    dispose()
  })

  it('可滚动量很大时拇指取最小长度', async () => {
    const { core, dispose } = makeBars()
    const vBar = { clientHeight: 200 }
    const vThumb = { style: {} as Record<string, string>, offsetHeight: 0, offsetWidth: 0 }
    core.setElement('vBarEl', vBar)
    core.setElement('vThumbEl', vThumb)

    core.extentHeight.value = 2000
    core.viewportHeight.value = 200 // scrollable = 1800 → ratio = 0.1 → 200*0.1 = 20 < 30
    core.offsetY.value = 0
    await nextTick()
    expect(vThumb.style.height).toBe('30px') // 保底 THUMB_MIN_LENGTH
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
})
