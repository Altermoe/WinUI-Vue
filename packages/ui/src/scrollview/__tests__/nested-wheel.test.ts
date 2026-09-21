/* oxlint-disable capitalized-comments, id-length, no-magic-numbers, max-statements, no-null, prefer-destructuring, prefer-global-this, consistent-function-scoping -- 测试代码：数值常量与简短标识符、注释为测试说明，豁免结构风格规则 */
/**
 * 嵌套 ScrollView 的滚轮归属（对齐 WinUI 3）：
 *  - 指针位于内层滚动容器内时，无论内层是否到达滚动极限，外层都不滚动
 *  - 内层在该方向不可滚动时，外层接管（避免滚轮死区）
 *  - 指针落在不属于任何子滚动容器的元素上时，外层正常滚动
 *  - chainMode='always' 保留旧的「剩余增量链给外层」逃生舱
 *
 * 用真实 DOM 构造 root0 ⊃ root1 ⊃ … 的冒泡路径并派发 WheelEvent，覆盖组件
 * 模板 @wheel 绑定下的真实事件流（祖先的监听确实会被触发，只是主动跳过）。
 */

import { describe, expect, it } from 'vitest'
import { registerScrollChain } from '../scroll-chain'
import { useAnimation } from '../use-animation'
import { useInertia } from '../use-inertia'
import { useScrollApi } from '../use-scroll-api'
import { useWheelInput } from '../use-wheel-input'
import type { WheelInput } from '../use-wheel-input'
import { installRafClock, makeBars, makeCore, mountSetup } from './helpers'
import type { TestCore } from './helpers'

const WHEEL_DELTA = 120
const PARTIAL_DELTA = 200
const EXTENT = 1000
const VIEWPORT = 200
const MAX_OFFSET = EXTENT - VIEWPORT // 800
const OUTER = 0
const INNER = 1

interface WheelNode {
  core: TestCore
  wheel: WheelInput
}

interface ChainLevel {
  root: HTMLDivElement
  node: WheelNode
}

interface Chain {
  levels: ChainLevel[]
  /** 最外层自有内容（不属于任何子滚动容器） */
  plain: HTMLDivElement
  dispose: () => void
}

/** 挂载一个滚轮输入实例（真实组件 setup 上下文，保证生命周期 hook 合法） */
const mountWheelNode = (props: Record<string, unknown> = {}): WheelNode => {
  const { result } = mountSetup(() => {
    const core = makeCore({ props: props as never })
    const bars = makeBars()
    const animation = useAnimation(core, bars)
    const inertia = useInertia(core, animation)
    const api = useScrollApi(core, animation, inertia)
    const wheel = useWheelInput(core, bars, api, animation)
    return { core, wheel }
  })
  return result
}

/** 构造 root0 ⊃ root1 ⊃ … 的嵌套滚轮栈，levels[0] 为最外层 */
const buildChain = (
  configs: { scrollable?: boolean; props?: Record<string, unknown> }[],
): Chain => {
  const plain = document.createElement('div')
  const levels: ChainLevel[] = []
  let outermost: HTMLDivElement | undefined = undefined
  let container: HTMLDivElement | undefined = undefined

  for (const config of configs) {
    const root = document.createElement('div')
    if (container) {
      container.append(root)
    } else {
      // 最外层：首个子节点是自有内容，随后是下一层滚动容器
      outermost = root
      root.append(plain)
    }
    const node = mountWheelNode(config.props)
    node.core.extentHeight.value = EXTENT
    if (config.scrollable === false) {
      node.core.extentHeight.value = VIEWPORT
    }
    node.core.viewportHeight.value = VIEWPORT
    node.core.setElement('rootEl', root)
    // 真实组件在 onMounted 注册；测试挂载后才注入元素，这里手动补注册
    registerScrollChain(root, node.wheel.chainHandle)
    root.addEventListener('wheel', node.wheel.onWheel)
    levels.push({ root, node })
    container = root
  }

  if (outermost) {
    document.body.appendChild(outermost)
  }

  return {
    levels,
    plain,
    dispose: () => {
      for (const level of levels) {
        level.root.removeEventListener('wheel', level.node.wheel.onWheel)
      }
      outermost?.remove()
    },
  }
}

/** 取嵌套栈中第 index 层（0 = 最外层），收窄 noUncheckedIndexedAccess 下的可选类型 */
const levelAt = (chain: Chain, index: number): ChainLevel => {
  const level = chain.levels[index]
  if (!level) {
    throw new Error(`嵌套栈缺少第 ${index} 层`)
  }
  return level
}

/** 在指定元素上派发一次可冒泡、可取消的滚轮事件 */
const wheelOn = (target: HTMLElement, deltaY: number): WheelEvent => {
  const event = new WheelEvent('wheel', { deltaY, bubbles: true, cancelable: true })
  target.dispatchEvent(event)
  return event
}

describe('嵌套 ScrollView · 滚轮归属', () => {
  it('内层可完整滚动时：只有内层滚动，外层不动', () => {
    const clock = installRafClock()
    const chain = buildChain([{}, {}])
    const inner = levelAt(chain, INNER)
    const outer = levelAt(chain, OUTER)
    const event = wheelOn(inner.root, WHEEL_DELTA)
    clock.run(3000)

    expect(inner.node.core.offsetY.value).toBe(WHEEL_DELTA)
    expect(outer.node.core.offsetY.value).toBe(0)
    expect(event.defaultPrevented).toBe(true)
    chain.dispose()
    clock.dispose()
  })

  it('内层到达滚动极限时：内层停住，外层依然不动（问题场景）', () => {
    const clock = installRafClock()
    const chain = buildChain([{}, {}])
    const inner = levelAt(chain, INNER)
    const outer = levelAt(chain, OUTER)
    inner.node.core.offsetY.value = MAX_OFFSET
    const event = wheelOn(inner.root, WHEEL_DELTA)
    clock.run(3000)

    expect(inner.node.core.offsetY.value).toBe(MAX_OFFSET)
    expect(outer.node.core.offsetY.value).toBe(0)
    // 完全吞掉：页面等原生祖先也不会滚动
    expect(event.defaultPrevented).toBe(true)
    chain.dispose()
    clock.dispose()
  })

  it('内层只消化一部分时：剩余增量不外溢到外层', () => {
    const clock = installRafClock()
    const chain = buildChain([{}, {}])
    const inner = levelAt(chain, INNER)
    const outer = levelAt(chain, OUTER)
    inner.node.core.offsetY.value = 700
    wheelOn(inner.root, PARTIAL_DELTA)
    clock.run(3000)

    expect(inner.node.core.offsetY.value).toBe(MAX_OFFSET)
    expect(outer.node.core.offsetY.value).toBe(0)
    chain.dispose()
    clock.dispose()
  })

  it('内层在该方向不可滚动时：外层接管', () => {
    const clock = installRafClock()
    const chain = buildChain([{}, { scrollable: false }])
    const inner = levelAt(chain, INNER)
    const outer = levelAt(chain, OUTER)
    const event = wheelOn(inner.root, WHEEL_DELTA)
    clock.run(3000)

    expect(inner.node.core.offsetY.value).toBe(0)
    expect(outer.node.core.offsetY.value).toBe(WHEEL_DELTA)
    expect(event.defaultPrevented).toBe(true)
    chain.dispose()
    clock.dispose()
  })

  it('指针位于外层自有内容上时：外层正常滚动', () => {
    const clock = installRafClock()
    const chain = buildChain([{}, {}])
    const inner = levelAt(chain, INNER)
    const outer = levelAt(chain, OUTER)
    wheelOn(chain.plain, WHEEL_DELTA)
    clock.run(3000)

    expect(outer.node.core.offsetY.value).toBe(WHEEL_DELTA)
    expect(inner.node.core.offsetY.value).toBe(0)
    chain.dispose()
    clock.dispose()
  })

  it('chainMode=always：剩余增量仍显式链给外层 ScrollView', () => {
    const clock = installRafClock()
    const chain = buildChain([{}, { props: { verticalScrollChainMode: 'always' } }])
    const inner = levelAt(chain, INNER)
    const outer = levelAt(chain, OUTER)
    inner.node.core.offsetY.value = 700
    wheelOn(inner.root, PARTIAL_DELTA)
    clock.run(3000)

    expect(inner.node.core.offsetY.value).toBe(MAX_OFFSET)
    expect(outer.node.core.offsetY.value).toBe(PARTIAL_DELTA - (MAX_OFFSET - 700))
    chain.dispose()
    clock.dispose()
  })

  it('三层嵌套：中间层可滚动时由中间层独占，最外层不动', () => {
    const clock = installRafClock()
    const chain = buildChain([{}, {}, { scrollable: false }])
    const innermost = levelAt(chain, 2)
    const middle = levelAt(chain, 1)
    const outer = levelAt(chain, OUTER)
    wheelOn(innermost.root, WHEEL_DELTA)
    clock.run(3000)

    expect(innermost.node.core.offsetY.value).toBe(0)
    expect(middle.node.core.offsetY.value).toBe(WHEEL_DELTA)
    expect(outer.node.core.offsetY.value).toBe(0)
    chain.dispose()
    clock.dispose()
  })
})
