/**
 * 类型安全的 emits 包装。
 *
 * 组件内 defineEmits 生成的 emit 函数携带精确的重载签名，难以在拆分模块间
 * 传递；这里把每个事件封装成具名方法，core 与各 composable 只依赖本模块，
 * 事件名拼写错误会在编译期暴露。
 */
import type { EmitFn } from 'vue'
import type {
  ScrollViewEmits,
  ScrollingAnchorRequestedEventArgs,
  ScrollingBringingIntoViewEventArgs,
  ScrollingInteractionState,
  ScrollingScrollAnimationStartingEventArgs,
  ScrollingScrollCompletedEventArgs,
  ScrollingZoomAnimationStartingEventArgs,
  ScrollingZoomCompletedEventArgs,
} from './types'

/** 全部对外事件的具名方法集合 */
export interface ScrollViewEvents {
  /** 视图（offset / zoom）发生变化时触发 */
  viewChanged: () => void
  /** Extent（内容尺寸）发生变化时触发 */
  extentChanged: () => void
  /** 交互状态切换时触发 */
  stateChanged: (state: ScrollingInteractionState) => void
  /** 一次带动画的滚动开始前触发，可定制 */
  scrollAnimationStarting: (args: ScrollingScrollAnimationStartingEventArgs) => void
  /** 滚动操作（ScrollTo / ScrollBy / AddScrollVelocity）结束时触发 */
  scrollCompleted: (args: ScrollingScrollCompletedEventArgs) => void
  /** 一次带动画的缩放开始前触发，可定制 */
  zoomAnimationStarting: (args: ScrollingZoomAnimationStartingEventArgs) => void
  /** 缩放操作（ZoomTo / ZoomBy / AddZoomVelocity）结束时触发 */
  zoomCompleted: (args: ScrollingZoomCompletedEventArgs) => void
  /** 选择锚点元素前触发，可定制候选或显式指定锚点 */
  anchorRequested: (args: ScrollingAnchorRequestedEventArgs) => void
  /** 参与 bring-into-view 前触发，可取消或调整目标偏移 */
  bringIntoView: (args: ScrollingBringingIntoViewEventArgs) => void
}

/** 由组件内 defineEmits 生成的 emit 函数构造具名事件集合 */
export const createScrollViewEvents = (emit: EmitFn<ScrollViewEmits>): ScrollViewEvents => ({
  viewChanged: () => emit('view-changed'),
  extentChanged: () => emit('extent-changed'),
  stateChanged: (state) => emit('state-changed', state),
  scrollAnimationStarting: (args) => emit('scroll-animation-starting', args),
  scrollCompleted: (args) => emit('scroll-completed', args),
  zoomAnimationStarting: (args) => emit('zoom-animation-starting', args),
  zoomCompleted: (args) => emit('zoom-completed', args),
  anchorRequested: (args) => emit('anchor-requested', args),
  bringIntoView: (args) => emit('bring-into-view', args),
})
