/* oxlint-disable capitalized-comments, id-length, no-magic-numbers, max-statements, no-null, prefer-destructuring, prefer-global-this, numeric-separators-style, consistent-function-scoping -- 测试代码：数值常量与简短标识符、注释为测试说明，豁免结构风格规则 */
/**
 * scroll-chain：嵌套 ScrollView 滚动链式传递的注册表。
 */

import { describe, expect, it, vi } from 'vitest'
import { findParentScroller, registerScrollChain, unregisterScrollChain } from '../scroll-chain'

const makeNode = (parentElement: object | null = null): HTMLElement =>
  ({ parentElement }) as unknown as HTMLElement

describe('scroll-chain', () => {
  it('从自身根元素向上查找最近的外层处理器', () => {
    const handle = { chainScrollBy: vi.fn() }
    const parent = makeNode()
    const child = makeNode(parent)
    const deep = makeNode(child)
    registerScrollChain(parent, handle)

    expect(findParentScroller(child)).toBe(handle)
    expect(findParentScroller(deep)).toBe(handle)
    expect(findParentScroller(parent)).toBeUndefined() // 自身不计
    expect(findParentScroller(makeNode())).toBeUndefined()
  })

  it('unregister 后不再命中', () => {
    const handle = { chainScrollBy: vi.fn() }
    const parent = makeNode()
    const child = makeNode(parent)
    registerScrollChain(parent, handle)
    expect(findParentScroller(child)).toBe(handle)
    unregisterScrollChain(parent)
    expect(findParentScroller(child)).toBeUndefined()
  })
})
