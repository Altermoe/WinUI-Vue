import { hasMatchMedia } from '@fluere-vue/utils'
/**
 * 媒体查询响应式状态（useMediaQuery）。
 *
 * 对齐 VueUse useMediaQuery 的行为，但显式保证 SSR 安全：
 *  - `setup()` 期若 `matchMedia` 不存在（Node SSR / 无能力环境），直接返回
 *    `false` 默认值，绝不抛错；
 *  - 浏览器环境下立即读取初始值（供 setup 内「读不渲染」的判定使用），并在
 *    当前作用域销毁时移除监听，避免内存泄漏；
 *  - 返回只读 ref，后续查询变化会自动更新。
 *
 * 注意：返回值若需渲染进模板，请在挂载后再读取/展示，避免服务端默认值与
 * 客户端真实值不一致引发水合警告。
 */
import { onScopeDispose, readonly, ref } from 'vue'
import type { Ref } from 'vue'

/**
 * 订阅一条 CSS 媒体查询，返回其匹配状态的只读 ref。
 * @param query 媒体查询字符串，如 `(prefers-reduced-motion: reduce)`
 */
// oxlint-disable-next-line import/prefer-default-export -- 库统一具名导出
export const useMediaQuery = (query: string): Readonly<Ref<boolean>> => {
  const matches = ref(false)

  if (!hasMatchMedia()) {
    // SSR / 无能力环境：保持默认值，不建立任何监听
    return readonly(matches)
  }

  const mediaQueryList = globalThis.matchMedia(query)
  const handler = (event: MediaQueryListEvent): void => {
    matches.value = event.matches
  }

  matches.value = mediaQueryList.matches
  mediaQueryList.addEventListener('change', handler)
  onScopeDispose(() => {
    mediaQueryList.removeEventListener('change', handler)
  })

  return readonly(matches)
}
