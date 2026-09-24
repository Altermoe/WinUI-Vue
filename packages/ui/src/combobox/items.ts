/**
 * FluereCombobox 项集合纯函数层。
 *
 * 对应 WinUI `Selector` 的项身份与索引语义：
 *   - 项文本：`ItemsSource` 元素的 `ToString()`（WinUI 未设 `ItemTemplate` 时）
 *   - 项身份：`by`（字段名或比较函数）→ 未给出时退化为值相等
 *   - 方向键选区：`Selector.SelectNext / SelectPrev`，跳过不可选项并夹在两端
 *   - `Home` / `End`：第一个 / 最后一个可选项
 * 这一层不依赖 Vue，可直接单测。
 */
import {
  EMPTY_LENGTH,
  FIRST_INDEX,
  INDEX_NOT_FOUND,
  NEXT_ITEM_STEP,
  PREVIOUS_ITEM_STEP,
} from './constants'
import type { ItemStep } from './constants'
import type { FluereComboboxItem } from './types'

/** 项身份比较器（对应 reka `by`） */
type ItemComparator<T> = string | ((a: T, b: T) => boolean) | undefined

/** 只读项视图：值类型放开为 unknown，便于纯函数同时接受任意项集合 */
type ItemLike = FluereComboboxItem<unknown>

/**
 * 项文本：显式 `text` 优先，缺省 `String(value)`
 * （对应 WinUI 未设 `ItemTemplate` 时把 `ItemsSource` 元素 `ToString()`）
 */
const itemText = (item: ItemLike): string => item.text ?? String(item.value)

/**
 * 两个值是否表示同一项。
 * - `by` 为字符串：按该字段比较
 * - `by` 为函数：交给调用方
 * - 否则严格相等（WinUI 对 `SelectedItem` 的引用 / 值比较）
 */
const isSameValue = <T>(a: T | null, b: T | null, by?: ItemComparator<T>): boolean => {
  if (a === null || b === null) {
    return a === b
  }
  if (typeof by === 'function') {
    return by(a, b)
  }
  if (typeof by === 'string') {
    return (a as Record<string, unknown>)[by] === (b as Record<string, unknown>)[by]
  }
  return a === b
}

/** 值在项集合中的下标；无选中返回 -1（WinUI `SelectedIndex = -1`） */
const findItemIndex = <T>(
  items: readonly FluereComboboxItem<T>[],
  value: T | null,
  by?: ItemComparator<T>,
): number => {
  if (value === null) {
    return INDEX_NOT_FOUND
  }
  return items.findIndex((item) => isSameValue<T>(item.value, value, by))
}

/**
 * 当前选中值的显示文本（对应 WinUI ContentPresenter 的 `SelectionBoxItem`）：
 * 命中项 → `itemText(item)`；未命中 → 非空值 `String(value)`、null 空串。
 */
const textOfValue = <T>(
  items: readonly FluereComboboxItem<T>[],
  value: T | null,
  by?: ItemComparator<T>,
): string => {
  const index = findItemIndex(items, value, by)
  if (index === INDEX_NOT_FOUND) {
    return value === null ? '' : String(value)
  }
  const item = items[index]
  return item === undefined ? '' : itemText(item)
}

/**
 * 按显示文本精确匹配项下标（可编辑态提交文本时用）。
 * WinUI 用 `AreStringsEqual`（序数比较，区分大小写）。
 */
const findItemIndexByText = (items: readonly ItemLike[], text: string): number =>
  items.findIndex((item) => itemText(item) === text)

/**
 * 从 `from` 出发按 `delta` 找到下一个可选项下标。
 *
 * - `from` 为 -1（当前无选中）：`delta > 0` 取第一个可选项，`delta < 0` 取最后一个
 * - 跳过 `disabled` 项（WinUI 不可选项不参与选择）
 * - 走到端点即返回 -1（WinUI 夹在 `[0, itemCount - 1]`，不环绕）
 */
const findEnabledIndex = (items: readonly ItemLike[], from: number, step: ItemStep): number => {
  if (items.length === EMPTY_LENGTH) {
    return INDEX_NOT_FOUND
  }
  // 无选中时从「首项之前 / 末项之后」出发，步进一次即落到端点
  let index =
    from === INDEX_NOT_FOUND ? (step === NEXT_ITEM_STEP ? PREVIOUS_ITEM_STEP : items.length) : from
  for (;;) {
    index += step
    if (index < FIRST_INDEX || index >= items.length) {
      return INDEX_NOT_FOUND
    }
    if (items[index]?.disabled !== true) {
      return index
    }
  }
}

/** 端点项下标（`Home` / `End`）：第一个 / 最后一个可选项 */
const findBoundaryIndex = (items: readonly ItemLike[], edge: 'first' | 'last'): number => {
  const step: ItemStep = edge === 'first' ? NEXT_ITEM_STEP : PREVIOUS_ITEM_STEP
  const start = edge === 'first' ? FIRST_INDEX : items.length - NEXT_ITEM_STEP
  for (let index = start; index >= FIRST_INDEX && index < items.length; index += step) {
    if (items[index]?.disabled !== true) {
      return index
    }
  }
  return INDEX_NOT_FOUND
}

export {
  findBoundaryIndex,
  findEnabledIndex,
  findItemIndex,
  findItemIndexByText,
  isSameValue,
  itemText,
  textOfValue,
}
export type { ItemComparator, ItemLike }
