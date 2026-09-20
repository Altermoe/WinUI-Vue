// 引入全局 Fluent token CSS 变量（组件 scoped style 依赖 var(--TokenName)）
// oxlint-disable-next-line import/no-unassigned-import
import '@fluentui-vue/designs/tokens.css'
import FluentButton from './src/button/button.vue'
import FluentInput from './src/input/input.vue'

export { FluentButton, FluentInput }
export type { FluentButtonProps } from './src/button/button.vue'
export type { FluentInputProps } from './src/input/input.vue'
