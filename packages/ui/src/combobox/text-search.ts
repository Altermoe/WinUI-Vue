/**
 * FluereCombobox 文本搜索（type-ahead）纯函数层。
 *
 * 对应 WinUI `ComboBox_Partial.cpp` 的搜索口径：
 *   - `HasSearchStringTimedOut()`：两次按键间隔 > 1000ms 即开始新一次搜索
 *   - `AppendCharToSearchString()`：窗口内逐字符累积搜索串
 *   - `SearchItemSourceIndex()`：从起点**环状**扫描（`searchIndex == itemCount` 时回到 0），
 *     命中第一个「前缀匹配」的项
 *   - `StartsWithIgnoreLinguisticSemantics()`：项文本先 `TrimStart(' ')`，再忽略大小写做
 *     前缀比较（不做子串 / 模糊 / 去重音匹配）
 * 这一层不依赖 Vue，可直接单测。
 */
import {
  EMPTY_LENGTH,
  FIRST_INDEX,
  INDEX_NOT_FOUND,
  MIN_SEARCH_QUERY_LENGTH,
  NEXT_ITEM_STEP,
  TEXT_SEARCH_TIMEOUT_MS,
} from './constants'
import { itemText } from './items'
import type { ItemLike } from './items'

/** 归一化：WinUI 先 TrimStart(' ') 再忽略大小写 */
const normalizeSearchText = (value: string): string => value.trimStart().toLowerCase()

/** 前缀匹配（WinUI `StartsWithIgnoreLinguisticSemantics`） */
const matchesSearchQuery = (text: string, query: string): boolean =>
  query.length >= MIN_SEARCH_QUERY_LENGTH &&
  normalizeSearchText(text).startsWith(normalizeSearchText(query))

/**
 * 累积搜索串：距上次按键超过 1000ms 时，当前字符另起一次搜索
 * （WinUI `AppendCharToSearchString` + `HasSearchStringTimedOut`）
 */
const appendSearchQuery = (previous: string, char: string, elapsedMs: number): string =>
  elapsedMs > TEXT_SEARCH_TIMEOUT_MS ? char : previous + char

/**
 * 环状查找首个前缀命中项，返回项下标；无命中返回 -1。
 * 起点由调用方按 WinUI 口径给出：新搜索串从 `SelectedIndex + 1` 起，同一串从
 * `SelectedIndex` 起重扫。不可选项不参与命中。
 */
const findTextSearchMatch = (
  items: readonly ItemLike[],
  query: string,
  startIndex: number,
): number => {
  const count = items.length
  if (count === EMPTY_LENGTH || query.length < MIN_SEARCH_QUERY_LENGTH) {
    return INDEX_NOT_FOUND
  }
  const start = ((startIndex % count) + count) % count
  for (let offset = FIRST_INDEX; offset < count; offset += NEXT_ITEM_STEP) {
    const index = (start + offset) % count
    const item = items[index]
    // 不可选项不参与命中，继续往后扫
    if (item !== undefined && item.disabled !== true && matchesSearchQuery(itemText(item), query)) {
      return index
    }
  }
  return INDEX_NOT_FOUND
}

/** 该键是否构成一次字符搜索：单字符、且不带 Ctrl / Meta / Alt（WinUI OnCharacterReceived） */
const isTextSearchKey = (
  key: string,
  modifiers?: { ctrlKey?: boolean; metaKey?: boolean; altKey?: boolean },
): boolean =>
  key.length === MIN_SEARCH_QUERY_LENGTH &&
  modifiers?.ctrlKey !== true &&
  modifiers?.metaKey !== true &&
  modifiers?.altKey !== true

export {
  appendSearchQuery,
  findTextSearchMatch,
  isTextSearchKey,
  matchesSearchQuery,
  normalizeSearchText,
}
