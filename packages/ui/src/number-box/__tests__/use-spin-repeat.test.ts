/* oxlint-disable no-magic-numbers -- 断言里的字面量就是被测输入与期望值，抽成常量反而更难读 */
/**
 * 增减按钮的长按重复（对应 WinUI RepeatButton 的 Delay / Interval = 250ms）。
 * 用假定时器精确驱动时序。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useSpinRepeat } from '../use-spin-repeat'

const DELAY = 250
const INTERVAL = 250

describe('useSpinRepeat 长按重复', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('按下立即触发一次，Delay 后才开始重复', () => {
    const onTrigger = vi.fn()
    const controller = useSpinRepeat({ onTrigger })

    controller.start()
    expect(controller.pressed.value).toBe(true)
    expect(onTrigger).toHaveBeenCalledTimes(1)

    vi.advanceTimersByTime(DELAY - 1)
    expect(onTrigger).toHaveBeenCalledTimes(1)
    vi.advanceTimersByTime(1)
    expect(onTrigger).toHaveBeenCalledTimes(1)

    vi.advanceTimersByTime(INTERVAL)
    expect(onTrigger).toHaveBeenCalledTimes(2)
    vi.advanceTimersByTime(INTERVAL * 3)
    expect(onTrigger).toHaveBeenCalledTimes(5)
  })

  it('抬起后停止重复', () => {
    const onTrigger = vi.fn()
    const controller = useSpinRepeat({ onTrigger })

    controller.start()
    vi.advanceTimersByTime(DELAY)
    controller.stop()
    expect(controller.pressed.value).toBe(false)

    vi.advanceTimersByTime(INTERVAL * 5)
    expect(onTrigger).toHaveBeenCalledTimes(1)
  })

  it('重复过程中变为不可用（到达端点 / 被禁用）立即停止', () => {
    const onTrigger = vi.fn()
    let disabled = false
    const controller = useSpinRepeat({ onTrigger, isDisabled: () => disabled })

    controller.start()
    vi.advanceTimersByTime(DELAY)
    vi.advanceTimersByTime(INTERVAL)
    expect(onTrigger).toHaveBeenCalledTimes(2)

    disabled = true
    vi.advanceTimersByTime(INTERVAL)
    expect(onTrigger).toHaveBeenCalledTimes(2)
    expect(controller.pressed.value).toBe(false)
  })

  it('不可用时按下不触发', () => {
    const onTrigger = vi.fn()
    const controller = useSpinRepeat({ onTrigger, isDisabled: () => true })

    controller.start()
    expect(onTrigger).not.toHaveBeenCalled()
    expect(controller.pressed.value).toBe(false)
    vi.advanceTimersByTime(DELAY + INTERVAL * 3)
    expect(onTrigger).not.toHaveBeenCalled()
  })

  it('重复按下会重置计时（不会叠加多个定时器）', () => {
    const onTrigger = vi.fn()
    const controller = useSpinRepeat({ onTrigger })

    controller.start()
    vi.advanceTimersByTime(DELAY - 1)
    controller.start()
    expect(onTrigger).toHaveBeenCalledTimes(2)

    vi.advanceTimersByTime(DELAY)
    expect(onTrigger).toHaveBeenCalledTimes(2)
    vi.advanceTimersByTime(INTERVAL)
    expect(onTrigger).toHaveBeenCalledTimes(3)
  })

  it('Delay / Interval 可覆写（仍是 RepeatButton 的语义）', () => {
    const onTrigger = vi.fn()
    const controller = useSpinRepeat({ onTrigger, delay: 10, interval: 5 })

    controller.start()
    vi.advanceTimersByTime(10)
    expect(onTrigger).toHaveBeenCalledTimes(1)
    vi.advanceTimersByTime(5)
    expect(onTrigger).toHaveBeenCalledTimes(2)
  })
})
