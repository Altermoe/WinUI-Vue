// 引入全局 Fluent token CSS 变量（组件 scoped style 依赖 var(--TokenName)）
// oxlint-disable-next-line import/no-unassigned-import
import '@fluere-vue/designs/tokens.css'
import FluereButton from './src/button/button.vue'
import FluereCheckbox from './src/checkbox/checkbox.vue'
import FluereInput from './src/input/input.vue'
import FluereScrollView from './src/scrollview/scroll-view.vue'
import FluereToggleSwitch from './src/toggle-switch/toggle-switch.vue'

export { FluereButton, FluereCheckbox, FluereInput, FluereScrollView, FluereToggleSwitch }
export type { FluereButtonProps } from './src/button/button.vue'
export type { FluereCheckboxProps } from './src/checkbox/checkbox.vue'
export type { FluereInputProps } from './src/input/input.vue'
export type {
  FluereToggleSwitchProps,
  FluereToggleSwitchSize,
} from './src/toggle-switch/toggle-switch.vue'
export type {
  FluereScrollViewProps,
  ScrollingAnchorRequestedEventArgs,
  ScrollingAnimationMode,
  ScrollingBringingIntoViewEventArgs,
  ScrollingChainMode,
  ScrollingContentOrientation,
  ScrollingInputKinds,
  ScrollingInteractionState,
  ScrollingRailMode,
  ScrollingScrollAnimationStartingEventArgs,
  ScrollingScrollBarVisibility,
  ScrollingScrollCompletedEventArgs,
  ScrollingScrollMode,
  ScrollingScrollOptions,
  ScrollingSnapPointsMode,
  ScrollingZoomAnimationStartingEventArgs,
  ScrollingZoomCompletedEventArgs,
  ScrollingZoomMode,
  ScrollingZoomOptions,
} from './src/scrollview/types'
