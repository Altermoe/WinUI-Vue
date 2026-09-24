/**
 * Combobox 文本搜索（type-ahead）状态层：对应 WinUI `IsTextSearchEnabled`。
 *
 * 纯算法（窗口合并 / 环状前缀匹配）在 text-search.ts；本层只持有
 * 「搜索串 + 上次按键时刻」这份会话状态，并按 WinUI 口径决定起搜位置：
 *   - 新搜索串（超时后首键）：从 `SelectedIndex + 1` 起环状扫描
 *   - 同一串继续累积：从 `SelectedIndex` 起重扫（命中当前项即原地不动）
 *
 * 只依赖 ref + Date.now，不依赖组件实例，可直接在测试里调用
 * （超时窗口用 vi.useFakeTimers 控制）。
 */
import { ref } from 'vue'
import type { Ref } from 'vue'
import {
  FIRST_INDEX,
  INDEX_NOT_FOUND,
  MIN_SEARCH_QUERY_LENGTH,
  NEXT_ITEM_STEP,
  TEXT_SEARCH_TIMEOUT_MS,
} from './constants'
import { appendSearchQuery, findTextSearchMatch } from './text-search'
import type { FluereComboboxItem } from './types'

/** 本层依赖的取值层视图（只取搜索需要的三样） */
export interface ComboboxSearchDeps<T> {
  /** 下拉项 */
  entries: Ref<readonly FluereComboboxItem<T>[]>
  /** 当前选中下标（-1 = 无选中） */
  selectedIndex: Ref<number>
  /** 命中后提交选中（走取值层的唯一入口） */
  selectByIndex: (index: number) => void
}

/** 文本搜索层对外暴露的回调 */
export interface ComboboxSearchModel {
  /** 当前是否处于一次未超时的搜索中（空格是否参与搜索字符取决于它） */
  isSearching: () => boolean
  /** 累积搜索串并直接选中命中项（WinUI `AppendCharToSearchString` + `SearchItemSourceIndex`） */
  handleTextSearch: (char: string) => void
}

export const useComboboxSearch = <T>(deps: ComboboxSearchDeps<T>): ComboboxSearchModel => {
  const searchQuery = ref('')
  let searchAt = 0

  const isSearching = (): boolean =>
    searchQuery.value.length >= MIN_SEARCH_QUERY_LENGTH &&
    Date.now() - searchAt <= TEXT_SEARCH_TIMEOUT_MS

  /**
   * 字符搜索：累积搜索串并直接选中命中项（WinUI `AppendCharToSearchString` +
   * `SearchItemSourceIndex` + `SelectedIndex = foundIndex`）。
   * 新搜索串从「当前项 + 1」起环状扫描，同一串从「当前项」重扫。
   */
  const handleTextSearch = (char: string): void => {
    const now = Date.now()
    const elapsed = now - searchAt
    const isNewQuery = elapsed > TEXT_SEARCH_TIMEOUT_MS
    searchQuery.value = appendSearchQuery(searchQuery.value, char, elapsed)
    searchAt = now
    const start = isNewQuery
      ? deps.selectedIndex.value + NEXT_ITEM_STEP
      : Math.max(deps.selectedIndex.value, FIRST_INDEX)
    const match = findTextSearchMatch(deps.entries.value, searchQuery.value, start)
    if (match !== INDEX_NOT_FOUND) {
      deps.selectByIndex(match)
    }
  }

  return { isSearching, handleTextSearch }
}
