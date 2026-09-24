/* oxlint-disable no-magic-numbers -- 用例里的下标 / 字面量就是断言数据本身 */
import { describe, expect, it } from 'vitest'
import {
  findBoundaryIndex,
  findEnabledIndex,
  findItemIndex,
  findItemIndexByText,
  isSameValue,
  itemText,
  textOfValue,
} from '../items'

/**
 * 对照来源：WinUI 3（Windows App SDK 2.0）`Selector` 的项身份 / 索引语义。
 * 这些函数是方向键选区、文本搜索、可编辑态提交的共同底座，单独守住。
 */
const items = [
  { value: 'a', text: 'Apple' },
  { value: 'b', text: 'Banana', disabled: true },
  { value: 'c', text: 'Cherry' },
]

/** 末位数字相同的两个数视为同一项（by 为函数的口径） */
const sameLastDigit = (a: number, b: number): boolean => a % 10 === b % 10

describe('itemText', () => {
  it('显式 text 优先，缺省回落 String(value)', () => {
    expect(itemText({ value: 'a', text: 'Apple' })).toBe('Apple')
    expect(itemText({ value: 42 })).toBe('42')
    expect(itemText({ value: true })).toBe('true')
  })
})

describe('isSameValue / findItemIndex', () => {
  it('未给 by 时按值严格相等', () => {
    expect(isSameValue('a', 'a')).toBe(true)
    expect(isSameValue('a', 'b')).toBe(false)
    expect(isSameValue(null, null)).toBe(true)
    expect(isSameValue(null, 'a')).toBe(false)
  })

  it('by 为字段名时按字段比较（对象项）', () => {
    const by = 'id'
    expect(isSameValue({ id: 1 }, { id: 1 }, by)).toBe(true)
    expect(isSameValue({ id: 1 }, { id: 2 }, by)).toBe(false)
  })

  it('by 为函数时交给调用方', () => {
    expect(isSameValue(11, 21, sameLastDigit)).toBe(true)
    expect(isSameValue(11, 22, sameLastDigit)).toBe(false)
  })

  it('findItemIndex：无选中返回 -1（WinUI SelectedIndex = -1）', () => {
    expect(findItemIndex(items, null)).toBe(-1)
    expect(findItemIndex(items, 'c')).toBe(2)
    expect(findItemIndex(items, 'zzz')).toBe(-1)
  })

  it('findItemIndexByText 按显示文本序数比较（区分大小写）', () => {
    expect(findItemIndexByText(items, 'Cherry')).toBe(2)
    expect(findItemIndexByText(items, 'cherry')).toBe(-1)
  })
})

describe('findEnabledIndex（方向键选区）', () => {
  it('无选中时：向下取第一项，向上取最后一项', () => {
    expect(findEnabledIndex(items, -1, 1)).toBe(0)
    expect(findEnabledIndex(items, -1, -1)).toBe(2)
  })

  it('跳过 disabled 项', () => {
    expect(findEnabledIndex(items, 0, 1)).toBe(2)
    expect(findEnabledIndex(items, 2, -1)).toBe(0)
  })

  it('到端点即停（WinUI 夹在 [0, itemCount - 1]，不环绕）', () => {
    expect(findEnabledIndex(items, 2, 1)).toBe(-1)
    expect(findEnabledIndex(items, 0, -1)).toBe(-1)
  })

  it('空集合返回 -1', () => {
    expect(findEnabledIndex([], -1, 1)).toBe(-1)
  })
})

describe('textOfValue（选中值 → 显示文本）', () => {
  it('命中项取 itemText，null 取空串，未命中取 String(value)', () => {
    expect(textOfValue(items, 'c')).toBe('Cherry')
    expect(textOfValue(items, null)).toBe('')
    expect(textOfValue(items, 'zzz')).toBe('zzz')
    expect(textOfValue([], 42)).toBe('42')
  })

  it('对象项按 by 字段命中', () => {
    const rows = [
      { id: 1, name: '一' },
      { id: 2, name: '二' },
    ]
    expect(
      textOfValue(
        rows.map((row) => ({ value: row, text: row.name })),
        { id: 2, name: '二' },
        'id',
      ),
    ).toBe('二')
  })
})

describe('findBoundaryIndex（Home / End）', () => {
  it('取首 / 尾可选项', () => {
    expect(findBoundaryIndex(items, 'first')).toBe(0)
    expect(findBoundaryIndex(items, 'last')).toBe(2)
  })

  it('端点项不可选时继续向内找', () => {
    const edge = [{ value: 'a', disabled: true }, { value: 'b' }, { value: 'c', disabled: true }]
    expect(findBoundaryIndex(edge, 'first')).toBe(1)
    expect(findBoundaryIndex(edge, 'last')).toBe(1)
  })

  it('全部不可选 / 空集合返回 -1', () => {
    expect(findBoundaryIndex([{ value: 'a', disabled: true }], 'first')).toBe(-1)
    expect(findBoundaryIndex([], 'last')).toBe(-1)
  })
})
