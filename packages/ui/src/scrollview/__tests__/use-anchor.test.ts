/* oxlint-disable capitalized-comments, id-length, no-magic-numbers, max-statements, no-null, prefer-destructuring, prefer-global-this, numeric-separators-style, consistent-function-scoping -- 测试代码：数值常量与简短标识符、注释为测试说明，豁免结构风格规则 */
/**
 * useAnchor：锚点元素选择，以及内容变化后维持锚点元素在视口内的位置不变。
 */

import { describe, expect, it, vi } from 'vitest'
import { toRaw } from 'vue'
import { useAnchor } from '../use-anchor'
import { makeCore, makeRectElement } from './helpers'

const makeAnchor = (props: Record<string, unknown> = {}) => {
  const core = makeCore({
    props: { verticalAnchorRatio: 0.5, ...props } as never,
  })
  const anchor = useAnchor(core)
  return { core, anchor }
}

const makeViewport = (): Record<string, unknown> =>
  makeRectElement({ left: 0, top: 0, width: 300, height: 200 })

describe('useAnchor', () => {
  it('从候选集中选择最接近锚点比例的锚点元素', () => {
    const { core, anchor } = makeAnchor()
    core.setElement('viewportEl', makeViewport())
    const near = makeRectElement({ left: 0, top: 95, width: 100, height: 10 }) // 中心 100
    const far = makeRectElement({ left: 0, top: 300, width: 100, height: 10 })
    anchor.registerAnchorCandidate(near as never)
    anchor.registerAnchorCandidate(far as never)
    anchor.selectAnchor()
    // currentAnchor 为 ref 深响应代理，需 toRaw 还原原始引用
    expect(toRaw(core.currentAnchor.value)).toBe(near)
  })

  it('内容变化后 reAnchor 保持锚点元素的屏幕位置不变', () => {
    const { core, anchor } = makeAnchor()
    core.setElement('viewportEl', makeViewport())
    core.extentHeight.value = 2000
    core.viewportHeight.value = 200
    const candidate = makeRectElement(
      { left: 0, top: 100, width: 100, height: 10 },
      {
        isConnected: true,
      },
    )
    anchor.registerAnchorCandidate(candidate as never)
    anchor.selectAnchor()
    // selectAnchor 记录锚点屏幕位置 = 100

    // 内容变化：元素下沉到 300
    Object.defineProperty(candidate, 'getBoundingClientRect', {
      value: () =>
        makeRectElement({ left: 0, top: 300, width: 100, height: 10 }).getBoundingClientRect(),
    })
    const viewChanged = vi.spyOn(core.events, 'viewChanged')
    anchor.reAnchor()
    expect(core.offsetY.value).toBe(200) // 300 - 100（维持屏幕位置 100）
    expect(viewChanged).toHaveBeenCalled()
  })

  it('reAnchor 的目标越界时钳制', () => {
    const { core, anchor } = makeAnchor()
    core.setElement('viewportEl', makeViewport())
    core.extentHeight.value = 250
    core.viewportHeight.value = 200 // maxOffsetY = 50
    const candidate = makeRectElement(
      { left: 0, top: 100, width: 100, height: 10 },
      {
        isConnected: true,
      },
    )
    anchor.registerAnchorCandidate(candidate as never)
    anchor.selectAnchor()
    // 元素下沉到 500 → 目标 offset = 500-100 = 400 → 钳到 50
    Object.defineProperty(candidate, 'getBoundingClientRect', {
      value: () =>
        makeRectElement({ left: 0, top: 500, width: 100, height: 10 }).getBoundingClientRect(),
    })
    anchor.reAnchor()
    expect(core.offsetY.value).toBe(50)
  })

  it('anchorEnabled 仅在任一轴向比例非 NaN 时为真', () => {
    const disabled = makeAnchor() // verticalAnchorRatio = 0.5 → 启用
    expect(disabled.anchor.anchorEnabled()).toBe(true)
    const none = makeAnchor({ verticalAnchorRatio: Number.NaN, horizontalAnchorRatio: Number.NaN })
    expect(none.anchor.anchorEnabled()).toBe(false)
  })

  it('unregisterAnchorCandidate 移除候选，重新选择后清空锚点', () => {
    const { core, anchor } = makeAnchor()
    core.setElement('viewportEl', makeViewport())
    const el = makeRectElement({ left: 0, top: 100, width: 100, height: 10 })
    anchor.registerAnchorCandidate(el as never)
    anchor.selectAnchor()
    expect(toRaw(core.currentAnchor.value)).toBe(el)
    anchor.unregisterAnchorCandidate(el as never)
    anchor.selectAnchor()
    expect(core.currentAnchor.value).toBeUndefined()
  })
})
