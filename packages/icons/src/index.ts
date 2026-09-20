// 图标库入口：WinUI 3 / Fluent System Icons 的 Vue3 实现。
// 组件本体为生成产物（generated/*），由 scripts/sync-icons.mjs 从官方
// @fluentui/svg-icons（MIT）生成；这里只负责对外聚合导出与类型。
// 重建：pnpm --filter @fluentui-vue/icons sync
export * from '../generated/index'
export type { FluentIconName, FluentIconSize, FluentIconStyle } from '../generated/names'
export { fluentIconNames } from '../generated/names'
export type { FluentIconOptions, FluentIconProps } from './factory'
export { createFluentIcon } from './factory'
