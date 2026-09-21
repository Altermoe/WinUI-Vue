/* oxlint-disable no-null, no-magic-numbers -- matchMedia 桩的 onchange: null 与断言次数属测试固定值 */
import { afterEach, describe, expect, it, vi } from 'vitest'
/**
 * 单元测试：useMediaQuery / useReducedMotion。
 *  - SSR / 无能力环境（jsdom 默认无 matchMedia）：返回 false 默认值，不抛错；
 *  - 浏览器环境（stub matchMedia）：立即反映初始 matches，随 change 事件更新，
 *    作用域销毁时移除监听（验证 onScopeDispose 清理被调用）。
 */
import { effectScope } from 'vue'
import type { Ref } from 'vue'
import { useMediaQuery } from '../use-media-query'
import { useReducedMotion } from '../use-reduced-motion'

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

/** 在独立 effectScope 内调用 composable（使 onScopeDispose 有可依附的作用域） */
const runInScope = <TValue>(factory: () => TValue): { value: TValue; dispose: () => void } => {
  const scope = effectScope()
  const value = scope.run(factory) as TValue
  return { value, dispose: () => scope.stop() }
}

describe('useMediaQuery', () => {
  it('无 matchMedia 环境（SSR / jsdom）返回 false 且不抛错', () => {
    expect(typeof globalThis.matchMedia).toBe('undefined')
    const { value } = runInScope(() => useMediaQuery('(prefers-reduced-motion: reduce)'))
    expect(value.value).toBe(false)
  })

  it('浏览器环境立即反映初始 matches', () => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockReturnValue({
        matches: true,
        media: '',
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }),
    )
    const { value } = runInScope(() => useMediaQuery('(prefers-reduced-motion: reduce)'))
    expect(value.value).toBe(true)
  })

  it('change 事件更新 matches，作用域销毁时移除监听', () => {
    const removeListener = vi.fn()
    const captured: { handler?: (event: { matches: boolean }) => void } = {}
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockReturnValue({
        matches: false,
        media: '',
        onchange: null,
        addEventListener: vi.fn().mockImplementation((_type: string, handler: () => void) => {
          captured.handler = handler
        }),
        removeEventListener: removeListener,
        dispatchEvent: vi.fn(),
      }),
    )

    const { value, dispose } = runInScope(() => useMediaQuery('(max-width: 600px)'))
    expect(value.value).toBe(false)

    captured.handler?.({ matches: true })
    expect(value.value).toBe(true)

    dispose()
    expect(removeListener).toHaveBeenCalledTimes(1)
  })

  it('返回只读 ref，外部写入被忽略（保持单一事实源）', () => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockReturnValue({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }),
    )
    // 故意对只读 ref 赋值触发 Vue 开发警告，屏蔽以免污染测试输出
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const { value } = runInScope(() => useMediaQuery('(x: y)'))
    const typed = value as Ref<boolean>
    typed.value = true
    expect(value.value).toBe(false)
    warnSpy.mockRestore()
  })
})

describe('useReducedMotion', () => {
  it('SSR / 无能力环境返回 false（动画保持启用）', () => {
    const { value } = runInScope(() => useReducedMotion())
    expect(value.value).toBe(false)
  })

  it('浏览器环境遵循 prefers-reduced-motion', () => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockReturnValue({
        matches: true,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }),
    )
    const { value } = runInScope(() => useReducedMotion())
    expect(value.value).toBe(true)
  })
})
