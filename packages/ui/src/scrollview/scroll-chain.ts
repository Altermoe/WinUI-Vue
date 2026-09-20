/**
 * 嵌套 ScrollView 之间的滚动链式传递注册表。
 *
 * WinUI 的 ScrollView 支持滚动 chaining：内层滚动到边界后，把剩余增量交给外层。
 * Web 端自定义滚动（transform 驱动）无法依赖浏览器原生事件冒泡完成该传递，
 * 因此用本模块维护「根元素 → 内部处理器」的映射，供外层 ScrollView 截获剩余增量。
 */

interface ScrollChainHandle {
  /** 应用剩余的滚动增量（含自身模式的判断与钳制） */
  chainScrollBy: (dx: number, dy: number) => void
}

const registry = new WeakMap<HTMLElement, ScrollChainHandle>()

const registerScrollChain = (root: HTMLElement, handle: ScrollChainHandle): void => {
  registry.set(root, handle)
}

const unregisterScrollChain = (root: HTMLElement): void => {
  registry.delete(root)
}

/** 从自身根元素向上查找最近的外层 ScrollView 处理器 */
const findParentScroller = (ownRoot: HTMLElement): ScrollChainHandle | undefined => {
  let el = ownRoot.parentElement
  while (el) {
    const handle = registry.get(el)
    if (handle) {
      return handle
    }
    el = el.parentElement
  }
  return undefined
}

export type { ScrollChainHandle }
export { registerScrollChain, unregisterScrollChain, findParentScroller }
