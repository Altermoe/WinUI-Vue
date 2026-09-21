/* oxlint-disable capitalized-comments, id-length, no-magic-numbers, max-statements, no-null, prefer-destructuring, prefer-global-this, numeric-separators-style, consistent-function-scoping -- 测试代码：数值常量与简短标识符、注释为测试说明，豁免结构风格规则 */
/**
 * useMeasurement：尺寸测量、偏移钳制与 extent-changed 事件（含观察者回调触发）。
 */

import { afterEach, describe, expect, it, vi } from 'vitest'
import { useMeasurement } from '../use-measurement'
import { makeCore, mountSetup } from './helpers'

interface FakeObserver {
  callback: (...args: unknown[]) => void
  observed: unknown[]
}

const createObserverStubs = (): {
  observers: FakeObserver[]
  restore: () => void
} => {
  const observers: FakeObserver[] = []
  const originalResize = globalThis.ResizeObserver
  const originalMutation = globalThis.MutationObserver

  class ResizeObserverStub {
    callback: ResizeObserverCallback
    constructor(callback: ResizeObserverCallback) {
      this.callback = callback
      observers.push({ callback: callback as unknown as () => void, observed: [] })
    }
    observe(): void {}
    unobserve(): void {}
    disconnect(): void {}
  }
  class MutationObserverStub {
    callback: MutationCallback
    constructor(callback: MutationCallback) {
      this.callback = callback
      observers.push({ callback: callback as unknown as () => void, observed: [] })
    }
    observe(): void {}
    disconnect(): void {}
    takeRecords(): MutationRecord[] {
      return []
    }
  }
  vi.stubGlobal('ResizeObserver', ResizeObserverStub)
  vi.stubGlobal('MutationObserver', MutationObserverStub)
  return {
    observers,
    restore: () => {
      vi.stubGlobal('ResizeObserver', originalResize)
      vi.stubGlobal('MutationObserver', originalMutation)
    },
  }
}

describe('useMeasurement', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('挂载后测量尺寸，内容变化触发重新测量与 extent-changed，并钳制偏移', () => {
    const stubs = createObserverStubs()
    const core = makeCore()
    const anchor = {
      anchorEnabled: () => false,
      reAnchor: vi.fn(),
      selectAnchor: vi.fn(),
    }
    const viewport = { clientWidth: 300, clientHeight: 200 }
    const content = {
      clientWidth: 300,
      clientHeight: 200,
      scrollWidth: 300,
      scrollHeight: 500,
      style: {},
    }
    core.setElement('viewportEl', viewport)
    core.setElement('contentEl', content)

    const { unmount } = mountSetup(() => {
      useMeasurement(core, anchor as never)
    })
    // onMounted → 首次 measure()
    expect(core.viewportWidth.value).toBe(300)
    expect(core.viewportHeight.value).toBe(200)
    // vertical：宽 = 视口、高 = scrollHeight
    expect(core.extentWidth.value).toBe(300)
    expect(core.extentHeight.value).toBe(500)
    expect(core.scrollableHeight.value).toBe(300)
    expect(core.events.extentChanged).toHaveBeenCalled()
    expect(anchor.selectAnchor).toHaveBeenCalled()

    // 内容增长到 900 → 触发 content ResizeObserver 回调（observers[1] 为 content）
    const extentChanged = vi.spyOn(core.events, 'extentChanged')
    content.scrollHeight = 900
    stubs.observers[1]!.callback()
    expect(core.extentHeight.value).toBe(900)
    expect(extentChanged).toHaveBeenCalled()

    // 内容收缩 → 越界偏移被钳制
    core.offsetY.value = 700
    content.scrollHeight = 400 // 新 scrollable = 200
    stubs.observers[1]!.callback()
    expect(core.offsetY.value).toBe(200)
    unmount()
  })

  it('双向方向（both）宽度取 scrollWidth', () => {
    createObserverStubs() // 仅需 stub 全局观察者以支撑 onMounted
    const core = makeCore({ props: { contentOrientation: 'both' } })
    const anchor = { anchorEnabled: () => false, reAnchor: vi.fn(), selectAnchor: vi.fn() }
    const viewport = { clientWidth: 300, clientHeight: 200 }
    const content = {
      clientWidth: 300,
      clientHeight: 200,
      scrollWidth: 800,
      scrollHeight: 500,
      style: {},
    }
    core.setElement('viewportEl', viewport)
    core.setElement('contentEl', content)

    const { unmount } = mountSetup(() => {
      useMeasurement(core, anchor as never)
    })
    expect(core.extentWidth.value).toBe(800)
    expect(core.extentHeight.value).toBe(500)
    unmount()
  })
})
