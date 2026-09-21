/* oxlint-disable capitalized-comments, id-length, no-magic-numbers, max-statements, no-null, prefer-destructuring, prefer-global-this, numeric-separators-style, consistent-function-scoping -- 测试代码：数值常量与简短标识符、注释为测试说明，豁免结构风格规则 */
/**
 * useWheelInput：
 *  - 滚轮滚动走统一滚动驱动（retarget 缓动），目标增量与 moved/remaining 正确
 *  - 边界时剩余增量链式传递给父级、chainMode=never 时吞掉
 *  - reduced-motion 下回退为直通写 offset
 *  - ctrl/⌘+滚轮原地缩放（中心为指针位置）
 */

import { describe, expect, it, vi } from 'vitest'
import { WHEEL_LINE_HEIGHT } from '../constants'
import { registerScrollChain } from '../scroll-chain'
import { useAnimation } from '../use-animation'
import { useInertia } from '../use-inertia'
import { useScrollApi } from '../use-scroll-api'
import { useWheelInput } from '../use-wheel-input'
import { installRafClock, makeBars, makeCore, makeRectElement, mountSetup } from './helpers'

/** 合成滚轮事件（最小字段） */
const wheelEvent = (partial: Record<string, unknown> = {}): WheelEvent =>
  ({
    deltaX: 0,
    deltaY: 0,
    deltaMode: 0,
    ctrlKey: false,
    metaKey: false,
    shiftKey: false,
    preventDefault: vi.fn(),
    ...partial,
  }) as unknown as WheelEvent

const mountWheel = (props: Record<string, unknown> = {}) =>
  mountSetup(() => {
    const core = makeCore({ props: props as never })
    const bars = makeBars()
    const animation = useAnimation(core, bars)
    const inertia = useInertia(core, animation)
    const api = useScrollApi(core, animation, inertia)
    const wheel = useWheelInput(core, bars, api, animation)
    return { core, bars, animation, inertia, api, wheel }
  })

describe('useWheelInput · 滚轮滚动（统一缓动驱动）', () => {
  it('滚轮增量交给滚动驱动缓动：目标被续接、offset 随后收敛', () => {
    const clock = installRafClock()
    const { result, unmount } = mountWheel()
    const { core, animation, wheel } = result
    core.extentHeight.value = 1000
    core.viewportHeight.value = 200

    const event = wheelEvent({ deltaY: 120 })
    wheel.onWheel(event)
    expect(event.preventDefault).toHaveBeenCalled()
    expect(animation.getScrollTarget().y).toBe(120)

    clock.run(16)
    expect(core.offsetY.value).toBeGreaterThan(0)
    clock.run(2000)
    expect(core.offsetY.value).toBe(120)
    clock.dispose()
    unmount()
  })

  it('deltaMode 行 / 页会按行高 / 视口尺寸换算', () => {
    const clock = installRafClock()
    const { result, unmount } = mountWheel()
    const { core, animation, wheel } = result
    core.extentHeight.value = 5000
    core.viewportHeight.value = 200

    wheel.onWheel(wheelEvent({ deltaY: 1, deltaMode: 1 })) // 行 → ×16
    expect(animation.getScrollTarget().y).toBe(WHEEL_LINE_HEIGHT)

    wheel.onWheel(wheelEvent({ deltaY: 1, deltaMode: 2 })) // 页 → ×viewport
    expect(animation.getScrollTarget().y).toBe(WHEEL_LINE_HEIGHT + 200)
    clock.dispose()
    unmount()
  })

  it('Shift+滚轮把纵向增量归一为横向', () => {
    const clock = installRafClock()
    const { result, unmount } = mountWheel({ contentOrientation: 'both' })
    const { core, animation, wheel } = result
    core.extentWidth.value = 2000
    core.viewportWidth.value = 300
    core.extentHeight.value = 2000
    core.viewportHeight.value = 300

    wheel.onWheel(wheelEvent({ deltaY: 150, shiftKey: true }))
    expect(animation.getScrollTarget().x).toBe(150)
    expect(animation.getScrollTarget().y).toBe(0)
    clock.dispose()
    unmount()
  })

  it('到达边界且部分消化时，剩余增量链式交给父级', () => {
    const clock = installRafClock()
    const { result, unmount } = mountWheel()
    const { core, animation, wheel } = result
    core.extentHeight.value = 1000
    core.viewportHeight.value = 200 // maxOffset = 800
    core.offsetY.value = 700

    const parentHandle = { chainScrollBy: vi.fn() }
    const parentRoot = { parentElement: null }
    const childRoot = { parentElement: parentRoot } as unknown as HTMLElement
    registerScrollChain(parentRoot as never, parentHandle)
    core.setElement('rootEl', childRoot)

    const event = wheelEvent({ deltaY: 200 })
    wheel.onWheel(event)
    expect(event.preventDefault).toHaveBeenCalled()
    expect(animation.getScrollTarget().y).toBe(800) // 本视图消化 100
    expect(parentHandle.chainScrollBy).toHaveBeenCalledWith(0, 100) // 剩余 100
    clock.dispose()
    unmount()
  })

  it('到达边界且无法消化时，chainMode=never 吞掉事件（preventDefault）', () => {
    const clock = installRafClock()
    const { result, unmount } = mountWheel({ verticalScrollChainMode: 'never' })
    const { core, wheel } = result
    core.extentHeight.value = 1000
    core.viewportHeight.value = 200
    core.offsetY.value = 800 // 已在底部

    const event = wheelEvent({ deltaY: 120 })
    wheel.onWheel(event)
    expect(event.preventDefault).toHaveBeenCalled()
    clock.dispose()
    unmount()
  })

  it('父级链式调用 chainScrollBy 也会走统一缓动驱动', () => {
    const clock = installRafClock()
    const { result, unmount } = mountWheel()
    const { core, animation, wheel } = result
    core.extentHeight.value = 1000
    core.viewportHeight.value = 200

    wheel.chainHandle.chainScrollBy(0, 60)
    expect(animation.getScrollTarget().y).toBe(60)
    clock.run(2000)
    expect(core.offsetY.value).toBe(60)
    clock.dispose()
    unmount()
  })
})

describe('useWheelInput · reduced-motion 直通', () => {
  it('prefers-reduced-motion 时滚轮直接写 offset（无动画）', () => {
    const originalDescriptor = Object.getOwnPropertyDescriptor(window, 'matchMedia')
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: vi.fn().mockReturnValue({
        matches: true,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }),
    })
    try {
      const { result, unmount } = mountWheel()
      const { core, wheel } = result
      core.extentHeight.value = 1000
      core.viewportHeight.value = 200
      const event = wheelEvent({ deltaY: 120 })
      wheel.onWheel(event)
      expect(core.offsetY.value).toBe(120) // 立即落位
      expect(core.interactionState.value).toBe('idle')
      unmount()
    } finally {
      if (originalDescriptor) {
        Object.defineProperty(window, 'matchMedia', originalDescriptor)
      } else {
        Reflect.deleteProperty(window, 'matchMedia')
      }
    }
  })
})

describe('useWheelInput · Ctrl/⌘+滚轮缩放', () => {
  it('以指针为缩放中心发出 zoomBy（带动画）', () => {
    const clock = installRafClock()
    const { result, unmount } = mountWheel({ zoomMode: 'enabled' })
    const { core, wheel } = result
    core.extentWidth.value = 2000
    core.extentHeight.value = 2000
    core.viewportWidth.value = 300
    core.viewportHeight.value = 200
    // 视口左上角位于屏幕 (10, 20)
    core.setElement(
      'viewportEl',
      makeRectElement({ left: 10, top: 20, width: 300, height: 200 }) as never,
    )

    const event = wheelEvent({ deltaY: -100, ctrlKey: true, clientX: 110, clientY: 70 })
    wheel.onWheel(event)
    expect(event.preventDefault).toHaveBeenCalled()
    expect(core.events.zoomAnimationStarting).toHaveBeenCalledWith({
      centerPoint: { x: 100, y: 50 }, // 110-10 / 70-20
      startZoomFactor: 1,
      endZoomFactor: 1.2, // WHEEL_ZOOM_FACTOR_STEP ** (100/100)
      correlationId: expect.any(Number),
    })
    clock.run(2000)
    expect(core.zoomFactor.value).toBe(1.2)
    clock.dispose()
    unmount()
  })
})
