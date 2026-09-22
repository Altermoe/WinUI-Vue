/**
 * 站点手动明暗模式控制。
 *
 * 设计令牌通过 `light-dark()` 跟随系统（随 `color-scheme` 解析），Shiki 代码块
 * 在 content-code.css 中跟随系统。为让“手动切换”同时覆盖两者，这里统一向
 * `<html>` 写入：
 * - `el.style.colorScheme` → 让 `light-dark()` 按手动选择解析；
 * - `data-color-mode` 属性 → 让 content-code.css 的代码块跟随手动选择。
 *
 * 偏好持久化到 localStorage。首次访问无存储值时跟随系统（与既有行为一致）。
 */

type ColorMode = 'light' | 'dark'

const STORAGE_KEY = 'fluere-docs-color-mode'

/** 明暗互为反相，用查表避免条件分支。 */
const OPPOSITE: Record<ColorMode, ColorMode> = { light: 'dark', dark: 'light' }

const mode = ref<ColorMode>('light')
const isDark = computed(() => mode.value === 'dark')

let hydrated = false

/** 解析初始值：优先 localStorage，否则跟随系统。仅客户端调用。 */
const resolveInitial = (): ColorMode => {
  if (!import.meta.client) {
    return 'light'
  }
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === 'dark' || stored === 'light') {
    return stored
  }
  if (globalThis.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark'
  }
  return 'light'
}

const apply = (next: ColorMode) => {
  const el = document.documentElement
  el.style.colorScheme = next
  el.dataset.colorMode = next
}

const setMode = (next: ColorMode, persist: boolean) => {
  mode.value = next
  if (import.meta.client) {
    apply(mode.value)
    if (persist) {
      localStorage.setItem(STORAGE_KEY, mode.value)
    }
  }
}

const useColorMode = () => {
  if (!hydrated) {
    hydrated = true
    if (import.meta.client) {
      // 首帧样式由 nuxt.config 的内联头脚本按同一规则写入，避免闪烁；
      // 此处同步响应式状态，并使按钮图标与 DOM 一致。
      // 初始值跟随系统时不持久化，只有当用户显式点击切换后才记住偏好。
      setMode(resolveInitial(), false)
    }
  }

  const toggle = () => {
    setMode(OPPOSITE[mode.value], true)
  }

  return { mode, isDark, toggle }
}

export { useColorMode }
export type { ColorMode }
