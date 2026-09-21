/* oxlint-disable capitalized-comments, id-length, no-magic-numbers, max-statements, no-null, prefer-destructuring, prefer-global-this, numeric-separators-style, consistent-function-scoping -- 测试代码：数值常量与简短标识符、注释为测试说明，豁免结构风格规则 */
/**
 * useScrollbarInput：拇指拖拽的 指针→offset 换算、轨道翻页的方向与动画。
 */

import { describe, expect, it, vi } from 'vitest'
import { useScrollbarInput } from '../use-scrollbar-input'
import { installRafClock, makeEngine, makeRectElement } from './helpers'

/** 竖向滚动条 / 拇指的最小假元素 */
const makeVBar = (): Record<string, unknown> =>
  makeRectElement(
    { left: 0, top: 0, width: 12, height: 200 },
    { setPointerCapture: vi.fn(), releasePointerCapture: vi.fn() },
  )
const makeVThumb = (): Record<string, unknown> =>
  makeRectElement(
    { left: 0, top: 0, width: 8, height: 40 },
    { offsetHeight: 40, offsetWidth: 8, contains: () => false },
  )

const makeScrollbar = () => {
  const { core, bars, animation, inertia, api, dispose } = makeEngine()
  const scrollbar = useScrollbarInput(core, bars, api, animation, inertia)
  return { core, bars, animation, api, scrollbar, dispose }
}

const pointerDownOn = (
  target: unknown,
  options: { pointerId?: number; clientY?: number; button?: number } = {},
): PointerEvent =>
  ({
    pointerType: 'mouse',
    pointerId: options.pointerId ?? 1,
    button: options.button ?? 0,
    clientX: 0,
    clientY: options.clientY ?? 0,
    target,
    preventDefault: vi.fn(),
  }) as unknown as PointerEvent

describe('useScrollbarInput · 拇指拖拽', () => {
  it('按下拇指启动拖拽，移动换算为目标 offset，抬起结束', () => {
    const clock = installRafClock()
    const { core, bars, scrollbar, dispose } = makeScrollbar()
    core.extentHeight.value = 1000
    core.viewportHeight.value = 200 // scrollable = 800

    const bar = makeVBar()
    const thumb = makeVThumb()
    core.setElement('vBarEl', bar)
    core.setElement('vThumbEl', thumb)

    // 按下（拇指顶部在 track 0 处，抓取点 offset=40）
    const down = pointerDownOn(thumb, { clientY: 40 })
    scrollbar.onVBarPointerDown(down)
    expect(bar.setPointerCapture).toHaveBeenCalledWith(1)
    expect(bars.thumbDragging.value).toBe(true)
    expect(core.interactionState.value).toBe('interaction')

    // 移动到 clientY=80：ratio=(80-40)/(200-40)=0.25 → offset=0.25*800=200
    scrollbar.onThumbPointerMove({
      pointerId: 1,
      clientY: 80,
    } as unknown as PointerEvent)
    expect(core.offsetY.value).toBe(200)
    expect(core.events.viewChanged).toHaveBeenCalled()

    // 抬起
    scrollbar.onThumbPointerUp({ pointerId: 1 } as unknown as PointerEvent)
    expect(bar.releasePointerCapture).toHaveBeenCalledWith(1)
    expect(bars.thumbDragging.value).toBe(false)
    expect(core.interactionState.value).toBe('idle')
    clock.dispose()
    dispose()
  })

  it('拖拽目标越界时钳制到边界', () => {
    const clock = installRafClock()
    const { core, scrollbar, dispose } = makeScrollbar()
    core.extentHeight.value = 1000
    core.viewportHeight.value = 200
    core.setElement('vBarEl', makeVBar())
    core.setElement('vThumbEl', makeVThumb())

    scrollbar.onVBarPointerDown(pointerDownOn(core.vThumbEl.value, { clientY: 40 }))
    // 拖到 track 底部（ratio=1）→ offset=800
    scrollbar.onThumbPointerMove({ pointerId: 1, clientY: 200 } as unknown as PointerEvent)
    expect(core.offsetY.value).toBe(800)
    // 继续越界拖拽仍钳在 800
    scrollbar.onThumbPointerMove({ pointerId: 1, clientY: 300 } as unknown as PointerEvent)
    expect(core.offsetY.value).toBe(800)
    clock.dispose()
    dispose()
  })
})

describe('useScrollbarInput · 轨道翻页', () => {
  it('点击拇指下方翻到下一页、上方翻到上一页（带动画）', () => {
    const clock = installRafClock()
    const { core, api, scrollbar, dispose } = makeScrollbar()
    const scrollBy = vi.spyOn(api, 'scrollBy')
    core.extentHeight.value = 1000
    core.viewportHeight.value = 200 // page = 200-40 = 160
    core.setElement('vBarEl', makeVBar())
    core.setElement('vThumbEl', makeVThumb())

    // 拇指中点 = 0 + 40/2 = 20；点击 100（下方）→ +page
    scrollbar.onVBarPointerDown(pointerDownOn(core.vBarEl.value, { clientY: 100 }))
    expect(scrollBy).toHaveBeenCalledWith(0, 160)

    // 点击 10（上方）→ -page
    scrollbar.onVBarPointerDown(pointerDownOn(core.vBarEl.value, { clientY: 10 }))
    expect(scrollBy).toHaveBeenCalledWith(0, -160)
    clock.dispose()
    dispose()
  })

  it('不可滚动时点击轨道不响应', () => {
    const { core, api, scrollbar, dispose } = makeScrollbar()
    const scrollBy = vi.spyOn(api, 'scrollBy')
    core.extentHeight.value = 100
    core.viewportHeight.value = 200 // 不可滚动
    core.setElement('vBarEl', makeVBar())
    core.setElement('vThumbEl', makeVThumb())
    scrollbar.onVBarPointerDown(pointerDownOn(core.vBarEl.value, { clientY: 100 }))
    expect(scrollBy).not.toHaveBeenCalled()
    dispose()
  })
})
