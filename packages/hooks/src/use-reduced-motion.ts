/**
 * 减少动效偏好（useReducedMotion）。
 *
 * 封装 `prefers-reduced-motion: reduce` 媒体查询，SSR 安全：服务端恒为
 * `false`（视为无偏好），客户端按系统设置实时更新。动画类组件可据此在
 * `auto` 模式下决定是否禁用动画，无需各自手搓 `matchMedia` 能力探测。
 */
import { useMediaQuery } from './use-media-query'

/** 是否偏好减少动效（只读 ref，SSR 下恒为 false） */
// oxlint-disable-next-line import/prefer-default-export -- 库统一具名导出
export const useReducedMotion = (): Readonly<ReturnType<typeof useMediaQuery>> =>
  useMediaQuery('(prefers-reduced-motion: reduce)')
