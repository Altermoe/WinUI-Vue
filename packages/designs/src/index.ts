// 语言层入口：Fluent Design 2 的唯一事实源（data/fluent-tokens.json）的 TS 表面。
// 值一律通过生成产物（tokens.css / preset-fluent.ts）消费，这里只暴露 token 名与类型。
export type { Theme, BrandVariants } from '@fluentui/tokens'
export type { FluentTokenName } from '../generated/token-names'
export { tokenNames } from '../generated/token-names'
