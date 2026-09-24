/* oxlint-disable no-magic-numbers -- 断言里的毫秒窗口与下标就是被测输入与期望值 */
/**
 * 文本搜索（type-ahead）状态层：搜索串窗口 + 起搜位置（WinUI IsTextSearchEnabled）。
 *
 * 该 hook 只依赖 ref + Date.now —— 直接调用即可，无需挂载；
 * 时间用 vi.spyOn(Date, 'now') 控制，避免真实计时抖动。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import type { FluereComboboxItem } from '../types'
import { useComboboxSearch } from '../use-combobox-search'

const FRUITS: FluereComboboxItem<string>[] = [
  { value: 'a', text: 'Apple' },
  { value: 'b', text: 'Banana' },
  { value: 'c', text: 'Cherry', disabled: true },
  { value: 'd', text: 'Durian' },
]

const WINDOW_MS = 1000

const createHarness = (selectedIndex = -1) => {
  const entries = ref<readonly FluereComboboxItem<string>[]>(FRUITS)
  const index = ref(selectedIndex)
  const selectByIndex = vi.fn()
  const model = useComboboxSearch<string>({ entries, selectedIndex: index, selectByIndex })
  return { entries, index, selectByIndex, model }
}

let now = 0

beforeEach(() => {
  now = 1_000_000
  vi.spyOn(Date, 'now').mockImplementation(() => now)
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('useComboboxSearch 会话状态', () => {
  it('未搜索时 isSearching 为 false；搜过一次即 true；超时后回到 false', () => {
    const { model } = createHarness()
    expect(model.isSearching()).toBe(false)

    model.handleTextSearch('b')
    expect(model.isSearching()).toBe(true)

    now += WINDOW_MS + 1
    expect(model.isSearching()).toBe(false)
  })

  it('同一窗口内字符累积成一个搜索串（WinUI AppendCharToSearchString）', () => {
    const { model, selectByIndex } = createHarness()
    model.handleTextSearch('b')
    model.handleTextSearch('a')
    // 'ba' → Banana
    expect(selectByIndex).toHaveBeenLastCalledWith(1)

    now += WINDOW_MS + 1
    model.handleTextSearch('a')
    // 超时后 'a' 另起一次搜索（不再拼成 'baa'）→ Apple
    expect(selectByIndex).toHaveBeenLastCalledWith(0)
  })
})

describe('useComboboxSearch 起搜位置（WinUI 口径）', () => {
  it('新搜索串从「当前项 + 1」起环状扫描', () => {
    // 当前项 Apple(0)，'a' 从 1 起扫：Banana / Cherry(禁用) / Durian 都不以 a 开头 → 回绕回 Apple
    const { model, selectByIndex } = createHarness(0)
    model.handleTextSearch('a')
    expect(selectByIndex).toHaveBeenLastCalledWith(0)
  })

  it('同一串从「当前项」重扫：命中当前项即原地不动', () => {
    const { model, selectByIndex } = createHarness(1)
    model.handleTextSearch('b') // 新串：从 2 起扫 → Durian 之后回绕 → Banana(1)
    expect(selectByIndex).toHaveBeenLastCalledWith(1)
    selectByIndex.mockClear()

    now += 100
    model.handleTextSearch('a') // 同一串 'ba'：从 1 起扫 → Banana(1) 原地命中
    expect(selectByIndex).toHaveBeenLastCalledWith(1)
  })

  it('无命中不调用 selectByIndex（含禁用项不参与命中）', () => {
    const { model, selectByIndex } = createHarness(0)
    model.handleTextSearch('z')
    expect(selectByIndex).not.toHaveBeenCalled()

    now += WINDOW_MS + 1
    model.handleTextSearch('c') // 只有禁用的 Cherry 以 c 开头
    expect(selectByIndex).not.toHaveBeenCalled()
  })
})
