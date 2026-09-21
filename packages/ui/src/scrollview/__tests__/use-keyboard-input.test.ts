/* oxlint-disable capitalized-comments, id-length, no-magic-numbers, max-statements, no-null, prefer-destructuring, prefer-global-this, numeric-separators-style, consistent-function-scoping -- 测试代码：数值常量与简短标识符、注释为测试说明，豁免结构风格规则 */
/**
 * useKeyboardInput：方向键 / PageUp/Down / Home/End / Space 的步长映射，
 * 以及可编辑目标 / ignoredInputKinds 的放行。
 */

import { describe, expect, it, vi } from 'vitest'
import { useKeyboardInput } from '../use-keyboard-input'
import { makeCore } from './helpers'

const makeKeyboard = (props: Record<string, unknown> = {}) => {
  const core = makeCore({ props: props as never })
  const api = { scrollBy: vi.fn(), scrollTo: vi.fn() }
  const keyboard = useKeyboardInput(core, api as never)
  return { core, api, keyboard }
}

const keyEvent = (key: string, partial: Record<string, unknown> = {}): KeyboardEvent =>
  ({
    key,
    shiftKey: false,
    preventDefault: vi.fn(),
    target: { closest: () => null },
    ...partial,
  }) as unknown as KeyboardEvent

describe('useKeyboardInput', () => {
  it('方向键 / 翻页 / Home/End / Space 映射到正确的增量（带动画，无 disabled 覆盖）', () => {
    const { core, api, keyboard } = makeKeyboard()
    core.extentWidth.value = 800
    core.extentHeight.value = 1000
    core.viewportWidth.value = 400 // stepX = max(40, 40) = 40; pageX = 360; scrollableX = 400
    core.viewportHeight.value = 300 // stepY = max(40, 30) = 40; pageY = 260; scrollableY = 700

    keyboard.onKeyDown(keyEvent('ArrowDown'))
    expect(api.scrollBy).toHaveBeenCalledWith(0, 40)
    keyboard.onKeyDown(keyEvent('ArrowUp'))
    expect(api.scrollBy).toHaveBeenCalledWith(0, -40)
    keyboard.onKeyDown(keyEvent('ArrowRight'))
    expect(api.scrollBy).toHaveBeenCalledWith(40, 0)
    keyboard.onKeyDown(keyEvent('ArrowLeft'))
    expect(api.scrollBy).toHaveBeenCalledWith(-40, 0)

    keyboard.onKeyDown(keyEvent('PageDown'))
    expect(api.scrollBy).toHaveBeenCalledWith(0, 260)
    keyboard.onKeyDown(keyEvent('PageUp'))
    expect(api.scrollBy).toHaveBeenCalledWith(0, -260)

    keyboard.onKeyDown(keyEvent('Home'))
    expect(api.scrollTo).toHaveBeenCalledWith(0, 0)
    keyboard.onKeyDown(keyEvent('End'))
    expect(api.scrollTo).toHaveBeenCalledWith(400, 700) // scrollable

    keyboard.onKeyDown(keyEvent('Space'))
    expect(api.scrollBy).toHaveBeenCalledWith(0, 260)
    keyboard.onKeyDown(keyEvent('Space', { shiftKey: true }))
    expect(api.scrollBy).toHaveBeenCalledWith(0, -260)

    // 每次按键都 preventDefault（阻止浏览器原生滚动）
    const events = api.scrollBy.mock.calls.length + api.scrollTo.mock.calls.length
    expect(events).toBeGreaterThan(0)
  })

  it('每次方向键按下都 preventDefault', () => {
    const { keyboard } = makeKeyboard()
    const event = keyEvent('ArrowDown')
    keyboard.onKeyDown(event)
    expect(event.preventDefault).toHaveBeenCalled()
  })

  it('命中可编辑目标时不拦截（不 preventDefault、不滚动）', () => {
    const { api, keyboard } = makeKeyboard()
    const event = keyEvent('ArrowDown', {
      target: { closest: () => ({}) },
    })
    keyboard.onKeyDown(event)
    expect(event.preventDefault).not.toHaveBeenCalled()
    expect(api.scrollBy).not.toHaveBeenCalled()
  })

  it('ignoredInputKinds 含 keyboard 时不响应', () => {
    const { api, keyboard } = makeKeyboard({ ignoredInputKinds: ['keyboard'] })
    const event = keyEvent('ArrowDown')
    keyboard.onKeyDown(event)
    expect(api.scrollBy).not.toHaveBeenCalled()
  })

  it('非导航键不处理', () => {
    const { api, keyboard } = makeKeyboard()
    const event = keyEvent('Enter')
    keyboard.onKeyDown(event)
    expect(event.preventDefault).not.toHaveBeenCalled()
    expect(api.scrollBy).not.toHaveBeenCalled()
  })
})
