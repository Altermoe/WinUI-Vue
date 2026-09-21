/* oxlint-disable capitalized-comments, id-length, no-magic-numbers, max-statements, no-null, prefer-destructuring, prefer-global-this, numeric-separators-style, consistent-function-scoping -- 测试代码：数值常量与简短标识符、注释为测试说明，豁免结构风格规则 */
/**
 * useScrollbarInput：拇指拖拽的 指针→offset 换算、轨道翻页的方向与动画、
 * 两端步进按钮的单击 / 长按连续滚动。
 */

import { describe, expect, it, vi } from 'vitest'
import {
  SCROLLBAR_REPEAT_DELAY,
  SCROLLBAR_REPEAT_INTERVAL,
  SCROLLBAR_STEP,
  SCROLL_ANIMATION_DURATION,
} from '../constants'
import { useScrollbarInput } from '../use-scrollbar-input'
import { installRafClock, makeEngine, makeRectElement, scoped } from './helpers'

/** 竖向滚动条 / 拇指的最小假元素 */
/** 两端步进按钮 band：CSS 通过 thumb 的 top / left 内缩给出（12px） */
const TRAVEL_INSET = 12

const makeVBar = (): Record<string, unknown> =>
  makeRectElement(
    { left: 0, top: 0, width: 12, height: 200 },
    { setPointerCapture: vi.fn(), releasePointerCapture: vi.fn() },
  )
/** 竖向滑块假元素：契约与真实 DOM 一致——顶部内缩一个按钮 band */
const makeVThumb = (top = TRAVEL_INSET, height = 40): Record<string, unknown> =>
  makeRectElement(
    { left: 0, top, width: 6, height },
    {
      offsetHeight: height,
      offsetWidth: 6,
      offsetTop: TRAVEL_INSET,
      offsetLeft: TRAVEL_INSET,
      contains: () => false,
    },
  )

const makeScrollbar = () => {
  const { core, bars, animation, inertia, api, dispose } = makeEngine()
  // 在独立作用域中创建：useScrollbarInput 注册了 onScopeDispose 清理长按计时器
  const scrollbarScope = scoped(() => useScrollbarInput(core, bars, api, animation, inertia))
  return {
    core,
    bars,
    animation,
    api,
    scrollbar: scrollbarScope.value,
    dispose: () => {
      scrollbarScope.dispose()
      dispose()
    },
  }
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

    // 按下滑块中部（滑块顶部在 band 内缩 12 处，中点 32）→ 抓取点相对滑块起点 20
    const down = pointerDownOn(thumb, { clientY: 32 })
    scrollbar.onVBarPointerDown(down)
    expect(bar.setPointerCapture).toHaveBeenCalledWith(1)
    expect(bars.thumbDragging.value).toBe(true)
    expect(core.interactionState.value).toBe('interaction')

    // 可用行程 = 200 - 2*12 = 176；拖动行程 = 100-20-12 = 68 → ratio = 0.5 → offset = 400
    scrollbar.onThumbPointerMove({
      pointerId: 1,
      clientY: 100,
    } as unknown as PointerEvent)
    expect(core.offsetY.value).toBe(400)
    expect(core.events.viewChanged).toHaveBeenCalled()

    // 抬起
    scrollbar.onBarPointerUp({ pointerId: 1 } as unknown as PointerEvent)
    expect(bar.releasePointerCapture).toHaveBeenCalledWith(1)
    expect(bars.thumbDragging.value).toBe(false)
    expect(core.interactionState.value).toBe('idle')
    clock.dispose()
    dispose()
  })

  it('按住滑块后再原地移动不会跳变（行程内缩与滑块位置一致）', () => {
    const clock = installRafClock()
    const { core, scrollbar, dispose } = makeScrollbar()
    core.extentHeight.value = 1000
    core.viewportHeight.value = 200 // scrollable = 800
    core.offsetY.value = 400 // ratio 0.5 → 滑块位于 12 + 0.5*140.8 = 82.4（长度 35.2）
    core.setElement('vBarEl', makeVBar())
    core.setElement('vThumbEl', makeVThumb(82.4, 35.2))

    scrollbar.onVBarPointerDown(pointerDownOn(core.vThumbEl.value, { clientY: 92.4 }))
    scrollbar.onThumbPointerMove({ pointerId: 1, clientY: 92.4 } as unknown as PointerEvent)
    expect(core.offsetY.value).toBe(400)
    clock.dispose()
    dispose()
  })

  it('命中对象不是滑块元素时，只要落在滑块范围内仍进入拖拽（不翻页）', () => {
    const clock = installRafClock()
    const { core, bars, api, scrollbar, dispose } = makeScrollbar()
    const scrollBy = vi.spyOn(api, 'scrollBy')
    core.extentHeight.value = 1000
    core.viewportHeight.value = 200
    core.setElement('vBarEl', makeVBar())
    core.setElement('vThumbEl', makeVThumb())

    // target 传轨道：模拟命中测试落到轨道而非滑块元素（滑块上有伪元素 / 与按钮相邻）
    // 滑块纵向范围 [12, 52]，50 在其末端附近 → 应当拖拽而不是翻页
    scrollbar.onVBarPointerDown(pointerDownOn(core.vBarEl.value, { clientY: 50 }))
    expect(scrollBy).not.toHaveBeenCalled()
    expect(bars.thumbDragging.value).toBe(true)
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

    // 滑块纵向范围 [12, 52]（顶部内缩 band 12）；点击 100（下方）→ +page
    scrollbar.onVBarPointerDown(pointerDownOn(core.vBarEl.value, { clientY: 100 }))
    expect(scrollBy).toHaveBeenCalledWith(0, 160)

    // 点击 10（滑块上沿之上，落在上端按钮 band 内）→ -page
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

/** 竖向步进按钮的按下事件（按钮在轨道内，事件不会冒泡到轨道） */
const stepDownOn = (options: { pointerId?: number; button?: number } = {}): PointerEvent =>
  ({
    pointerType: 'mouse',
    pointerId: options.pointerId ?? 1,
    button: options.button ?? 0,
    preventDefault: vi.fn(),
    stopPropagation: vi.fn(),
  }) as unknown as PointerEvent

describe('useScrollbarInput · 轨道两端步进按钮', () => {
  it('单击按 SCROLLBAR_STEP 步进，并阻断冒泡与默认行为', () => {
    const clock = installRafClock()
    const { core, bars, animation, scrollbar, dispose } = makeScrollbar()
    core.extentHeight.value = 1000
    core.viewportHeight.value = 200 // scrollable = 800
    core.setElement('vBarEl', makeVBar())
    core.setElement('vThumbEl', makeVThumb())

    const down = stepDownOn()
    scrollbar.onStepPointerDown('vertical', 1, down)
    // 阻断冒泡：否则会同时触发轨道翻页 / 拇指拖拽
    expect(down.preventDefault).toHaveBeenCalled()
    expect(down.stopPropagation).toHaveBeenCalled()
    // 步进交由统一滚动动画驱动，交互状态随即进入 animation
    expect(core.interactionState.value).toBe('animation')
    expect(bars.showBars).toHaveBeenCalledWith(true)
    expect(animation.getScrollTarget().y).toBe(SCROLLBAR_STEP)

    clock.run(SCROLL_ANIMATION_DURATION * 2)
    expect(core.offsetY.value).toBeCloseTo(SCROLLBAR_STEP, 0)
    clock.dispose()
    dispose()
  })

  it('长按超过延迟后按间隔连续步进，抬起立即停止', () => {
    vi.useFakeTimers()
    const { core, animation, scrollbar, dispose } = makeScrollbar()
    core.extentHeight.value = 2000
    core.viewportHeight.value = 200 // scrollable = 1800
    core.setElement('vBarEl', makeVBar())
    core.setElement('vThumbEl', makeVThumb())

    scrollbar.onStepPointerDown('vertical', 1, stepDownOn())
    expect(animation.getScrollTarget().y).toBe(SCROLLBAR_STEP)

    // 首次延迟内只有单击那一步
    vi.advanceTimersByTime(SCROLLBAR_REPEAT_DELAY - 1)
    expect(animation.getScrollTarget().y).toBe(SCROLLBAR_STEP)

    // 延迟到点后启动连续步进：再过一个间隔累加一步
    vi.advanceTimersByTime(1)
    expect(animation.getScrollTarget().y).toBe(SCROLLBAR_STEP)
    vi.advanceTimersByTime(SCROLLBAR_REPEAT_INTERVAL)
    expect(animation.getScrollTarget().y).toBe(SCROLLBAR_STEP * 2)
    vi.advanceTimersByTime(SCROLLBAR_REPEAT_INTERVAL * 3)
    expect(animation.getScrollTarget().y).toBe(SCROLLBAR_STEP * 5)

    // 抬起后计时器停止，不再继续步进
    scrollbar.onBarPointerUp({ pointerId: 1 } as unknown as PointerEvent)
    const stopped = animation.getScrollTarget().y
    vi.advanceTimersByTime(SCROLLBAR_REPEAT_INTERVAL * 5)
    expect(animation.getScrollTarget().y).toBe(stopped)
    vi.useRealTimers()
    dispose()
  })

  it('步进越界时钳制到边界，不可滚动时不做任何滚动', () => {
    vi.useFakeTimers()
    const { core, animation, scrollbar, dispose } = makeScrollbar()
    core.extentHeight.value = 300
    core.viewportHeight.value = 200 // scrollable = 100
    core.setElement('vBarEl', makeVBar())
    core.setElement('vThumbEl', makeVThumb())

    // 100 < 3 * SCROLLBAR_STEP：第 3 次步进被钳制到 100，第 4 次不再产生新目标
    scrollbar.onStepPointerDown('vertical', 1, stepDownOn())
    expect(animation.getScrollTarget().y).toBe(SCROLLBAR_STEP)
    scrollbar.onStepPointerDown('vertical', 1, stepDownOn({ pointerId: 2 }))
    expect(animation.getScrollTarget().y).toBe(SCROLLBAR_STEP * 2)
    scrollbar.onStepPointerDown('vertical', 1, stepDownOn({ pointerId: 3 }))
    expect(animation.getScrollTarget().y).toBe(100)
    scrollbar.onStepPointerDown('vertical', 1, stepDownOn({ pointerId: 4 }))
    expect(animation.getScrollTarget().y).toBe(100)
    scrollbar.onBarPointerUp({ pointerId: 4 } as unknown as PointerEvent)

    // 该轴不可滚动
    core.extentHeight.value = 100
    scrollbar.onStepPointerDown('vertical', -1, stepDownOn({ pointerId: 5 }))
    expect(animation.getScrollTarget().y).toBe(100)
    vi.useRealTimers()
    dispose()
  })
})
