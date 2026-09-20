// 引入全局 Fluent token CSS 变量（组件 scoped style 依赖 var(--TokenName)）
// oxlint-disable-next-line import/no-unassigned-import
import '@fluere-vue/designs/tokens.css'
import FluereButton from './src/button/button.vue'
import FluereInput from './src/input/input.vue'

export { FluereButton, FluereInput }
export type { FluereButtonProps } from './src/button/button.vue'
export type { FluereInputProps } from './src/input/input.vue'
