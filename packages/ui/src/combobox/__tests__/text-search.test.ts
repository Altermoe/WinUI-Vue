/* oxlint-disable no-magic-numbers -- 用例里的时间窗口 / 下标就是断言数据本身 */
import { describe, expect, it } from 'vitest'
import {
  appendSearchQuery,
  findTextSearchMatch,
  isTextSearchKey,
  matchesSearchQuery,
} from '../text-search'

/**
 * 对照来源：WinUI 3（Windows App SDK 2.0）
 *   src/dxaml/xcp/dxaml/lib/ComboBox_Partial.cpp
 *     HasSearchStringTimedOut()  → 1000ms 窗口
 *     AppendCharToSearchString() → 窗口内累积
 *     SearchItemSourceIndex()    → 环状扫描 + 前缀匹配 + 跳过不可选项
 *     StartsWithIgnoreLinguisticSemantics() → TrimStart(' ') 后忽略大小写前缀比较
 */
const items = [
  { value: 'wa', text: 'Washington' },
  { value: 'wv', text: 'West Virginia' },
  { value: 'wy', text: 'Wyoming' },
  { value: 'wi', text: ' Wisconsin' }, // 前导空格：WinUI 会 TrimStart
  { value: 'xx', text: 'Xanadu', disabled: true },
]

describe('matchesSearchQuery（前缀匹配）', () => {
  it('忽略大小写，只做前缀（不做子串匹配）', () => {
    expect(matchesSearchQuery('Washington', 'wa')).toBe(true)
    expect(matchesSearchQuery('Washington', 'WA')).toBe(true)
    expect(matchesSearchQuery('Washington', 'shington')).toBe(false)
  })

  it("项文本先 TrimStart(' ')", () => {
    expect(matchesSearchQuery(' Wisconsin', 'wi')).toBe(true)
  })

  it('空查询串不算命中', () => {
    expect(matchesSearchQuery('Washington', '')).toBe(false)
  })
})

describe('appendSearchQuery（1000ms 累积窗口）', () => {
  it('窗口内逐字符累积', () => {
    expect(appendSearchQuery('w', 'a', 300)).toBe('wa')
  })

  it('超过 1000ms 另起一次搜索', () => {
    expect(appendSearchQuery('wa', 'y', 1001)).toBe('y')
    expect(appendSearchQuery('wa', 'y', 1000)).toBe('way')
  })
})

describe('findTextSearchMatch（环状扫描）', () => {
  it('从起点向下找首个前缀命中项', () => {
    expect(findTextSearchMatch(items, 'w', 0)).toBe(0)
    expect(findTextSearchMatch(items, 'wy', 0)).toBe(2)
  })

  it('到末尾后回绕到开头继续找', () => {
    // 从下标 2（Wyoming）起找 'wi'：3（Wisconsin）命中
    expect(findTextSearchMatch(items, 'wi', 2)).toBe(3)
    // 从下标 2 起找 'was'：3 不命中、4 不可选 → 回绕到 0（Washington）
    expect(findTextSearchMatch(items, 'was', 2)).toBe(0)
  })

  it('起点支持任意偏移（负数 / 越界都会归一化）', () => {
    expect(findTextSearchMatch(items, 'wy', 5)).toBe(2)
    expect(findTextSearchMatch(items, 'wy', -1)).toBe(2)
  })

  it('不可选项不参与命中', () => {
    expect(findTextSearchMatch(items, 'xa', 0)).toBe(-1)
  })

  it('空集合 / 空查询 / 无命中都返回 -1', () => {
    expect(findTextSearchMatch([], 'w', 0)).toBe(-1)
    expect(findTextSearchMatch(items, '', 0)).toBe(-1)
    expect(findTextSearchMatch(items, 'zzz', 0)).toBe(-1)
  })
})

describe('isTextSearchKey', () => {
  it('单字符且无 Ctrl / Meta / Alt 才算搜索字符', () => {
    expect(isTextSearchKey('w')).toBe(true)
    expect(isTextSearchKey(' ')).toBe(true)
    expect(isTextSearchKey('ArrowDown')).toBe(false)
    expect(isTextSearchKey('w', { ctrlKey: true })).toBe(false)
    expect(isTextSearchKey('w', { metaKey: true })).toBe(false)
    expect(isTextSearchKey('w', { altKey: true })).toBe(false)
  })
})
