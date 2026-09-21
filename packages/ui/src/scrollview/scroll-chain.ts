/**
 * 嵌套 ScrollView 之间的滚轮归属与滚动链式传递。
 *
 * 滚轮事件会沿 DOM 冒泡：指针位于内层 ScrollView 内时，外层 ScrollView 根节点
 * 上的 wheel 监听同样会被触发，若不处理，外层会重复应用同一份增量（表现为
 * 「内层滚动、外层跟着滚」，内层到极限时外层更是立刻接管）。本模块因此维护
 * 两份状态：
 *
 *  - 归属标记（claimedWheelEvents）：取得归属的 ScrollView 在事件上打标，祖先
 *    在 onWheel 开头跳过；事件本身仍正常冒泡，业务侧其它 wheel 监听器不受影响。
 *    对齐 WinUI 3：指针在子滚动容器内时，滚轮不会扩散到外层，无论是否到极限。
 *  - 链式注册表（registry）：「根元素 → 处理器」映射，仅供 scrollChainMode
 *    ='always' 的旧链式路径查找最近的外层 ScrollView 并交出剩余增量。
 */

interface ScrollChainHandle {
  /** 应用剩余的滚动增量（含自身模式的判断与钳制） */
  chainScrollBy: (dx: number, dy: number) => void
}

/* ------------------------------------------------------------------ */
/* 滚轮归属标记：同一次事件只允许最近的可用 ScrollView 接管               */
/* ------------------------------------------------------------------ */

/**
 * 已在本轮冒泡中取得归属的滚轮事件。
 *
 * 用 WeakSet 而非在事件对象上挂属性：不改动外部传入的事件对象，且随事件被
 * 回收后自动释放；同一事件对象会沿冒泡路径传递给所有祖先，故可用身份比对。
 */
const claimedWheelEvents = new WeakSet<Event>()

/** 声明本次滚轮事件由本 ScrollView 接管（祖先随后会跳过） */
const claimWheelEvent = (event: Event): void => {
  claimedWheelEvents.add(event)
}

/** 本次滚轮事件是否已被某个后代 ScrollView 接管 */
const isWheelEventClaimed = (event: Event): boolean => claimedWheelEvents.has(event)

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
export {
  claimWheelEvent,
  findParentScroller,
  isWheelEventClaimed,
  registerScrollChain,
  unregisterScrollChain,
}
