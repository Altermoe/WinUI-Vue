/* oxlint-disable capitalized-comments, id-length, no-magic-numbers, max-statements, no-null, prefer-destructuring, prefer-global-this, numeric-separators-style, consistent-function-scoping -- 测试代码：数值常量与简短标识符、注释为测试说明，豁免结构风格规则 */
/**
 * usePointerInput：
 *  - 触控平移方向正确（内容跟随手指）与速度阈值下的惯性衔接
 *  - 双指捏合以两指中点为缩放中心（原地缩放）
 */

import { describe, expect, it, vi } from 'vitest'
import { usePointerInput } from '../use-pointer-input'
import { installRafClock, makeEngine } from './helpers'

const makeViewport = (): Record<string, unknown> => ({
  setPointerCapture: vi.fn(),
  releasePointerCapture: vi.fn(),
  getBoundingClientRect: () => ({
    left: 0,
    top: 0,
    width: 300,
    height: 200,
    right: 300,
    bottom: 200,
  }),
})

const makePointer = (props: Record<string, unknown> = {}) => {
  const { core, bars, animation, inertia, dispose } = makeEngine({
    props: { zoomMode: 'disabled', ...props } as never,
  })
  const pointer = usePointerInput(core, bars, animation, inertia)
  return { core, bars, animation, inertia, pointer, dispose }
}

const touchDown = (id: number, x: number, y: number): PointerEvent =>
  ({ pointerType: 'touch', button: 0, pointerId: id, clientX: x, clientY: y }) as PointerEvent

const touchMove = (id: number, x: number, y: number): PointerEvent =>
  ({ pointerType: 'touch', pointerId: id, clientX: x, clientY: y }) as PointerEvent

const touchUp = (id: number): PointerEvent =>
  ({ pointerType: 'touch', pointerId: id }) as PointerEvent

describe('usePointerInput · 单指平移', () => {
  it('内容跟随手指：向下拖 offset 减小（内容下移），向上拖恢复', () => {
    const clock = installRafClock()
    const { core, pointer, dispose } = makePointer()
    core.extentHeight.value = 1000
    core.viewportHeight.value = 300
    core.offsetY.value = 100
    core.setElement('viewportEl', makeViewport())

    pointer.onPointerDown(touchDown(1, 50, 100))
    pointer.onPointerMove(touchMove(1, 50, 140)) // 下移 40
    expect(core.offsetY.value).toBe(60)
    pointer.onPointerMove(touchMove(1, 50, 100)) // 上移 40
    expect(core.offsetY.value).toBe(100)
    clock.dispose()
    dispose()
  })

  it('低速松手不进入惯性，高速松手进入惯性', () => {
    const clock = installRafClock()
    const { core, pointer, dispose } = makePointer()
    core.extentHeight.value = 2000
    core.viewportHeight.value = 300
    core.offsetY.value = 200
    core.setElement('viewportEl', makeViewport())

    // 低速：40px / 400ms → 100px/s < 阈值
    pointer.onPointerDown(touchDown(1, 50, 100))
    clock.step(400)
    pointer.onPointerMove(touchMove(1, 50, 140))
    pointer.onPointerUp(touchUp(1))
    expect(core.interactionState.value).toBe('idle')

    // 高速：40px / 20ms → 2000px/s > 阈值
    pointer.onPointerDown(touchDown(1, 50, 100))
    clock.step(20)
    pointer.onPointerMove(touchMove(1, 50, 140))
    pointer.onPointerUp(touchUp(1))
    expect(core.interactionState.value).toBe('inertia')
    clock.dispose()
    dispose()
  })

  it('触控平移中滚动条显示', () => {
    const clock = installRafClock()
    const { core, bars, pointer, dispose } = makePointer()
    core.extentHeight.value = 1000
    core.viewportHeight.value = 300
    core.setElement('viewportEl', makeViewport())
    pointer.onPointerDown(touchDown(1, 50, 100))
    expect(bars.panningActive.value).toBe(true)
    expect(bars.showBars).toHaveBeenCalled()
    clock.dispose()
    dispose()
  })
})

describe('usePointerInput · 双指捏合', () => {
  it('以两指中点为缩放中心原地缩放，抬指后结束', () => {
    const clock = installRafClock()
    const { core, pointer, dispose } = makePointer({ zoomMode: 'enabled' })
    core.extentWidth.value = 2000
    core.extentHeight.value = 2000
    core.viewportWidth.value = 300
    core.viewportHeight.value = 200
    core.setElement('viewportEl', makeViewport())

    pointer.onPointerDown(touchDown(1, 50, 50))
    pointer.onPointerDown(touchDown(2, 100, 60)) // 两指成立 → 开始捏合
    const cx = 75
    const cy = 55

    pointer.onPointerMove(touchMove(2, 150, 70)) // 距离翻倍 → zoom 2
    expect(core.zoomFactor.value).toBeCloseTo(2, 5)
    // 中点所在内容坐标不变（原地缩放）
    const pX = (core.offsetX.value + cx) / core.zoomFactor.value
    const pY = (core.offsetY.value + cy) / core.zoomFactor.value
    expect(pX).toBeCloseTo(cx, 5)
    expect(pY).toBeCloseTo(cy, 5)

    pointer.onPointerUp(touchUp(1)) // 只剩一指 → 结束捏合
    expect(core.interactionState.value).toBe('idle')
    clock.dispose()
    dispose()
  })
})
