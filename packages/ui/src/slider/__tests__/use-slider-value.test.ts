/* oxlint-disable no-magic-numbers -- hook 用例：这里的数字就是取值契约本身 */
/**
 * 取值层：受控 / 非受控两条取值路径 + reka 数组载荷适配。
 *
 * 该 hook 只依赖 ref / computed，不依赖组件实例 —— 直接调用即可，无需挂载。
 */

import { describe, expect, it } from 'vitest'
import { reactive } from 'vue'
import { useSliderValue } from '../use-slider-value'

/** 假事件层：hook 只依赖「具名方法」，测试里直接换成记录用的 spy */
const createEvents = () => {
  const changes: number[] = []
  const commits: number[] = []
  return {
    changes,
    commits,
    events: {
      valueChange: (value: number): void => {
        changes.push(value)
      },
      valueCommit: (value: number): void => {
        commits.push(value)
      },
    },
  }
}

const createProps = (
  overrides: Partial<{
    modelValue: number
    defaultValue: number
    min: number
    step: number
  }> = {},
) =>
  reactive({
    modelValue: undefined as number | undefined,
    defaultValue: undefined as number | undefined,
    min: 0,
    step: 1,
    ...overrides,
  })

describe('useSliderValue 受控模式', () => {
  it('currentValue 取 props.modelValue，并包成 reka 需要的数组', () => {
    const { events } = createEvents()
    const model = useSliderValue(createProps({ modelValue: 30 }), events)

    expect(model.currentValue.value).toBe(30)
    expect(model.rootValue.value).toEqual([30])
    expect(model.rootDefaultValue.value).toEqual([0])
  })

  it('值的事实源在父级：触发值变化后 currentValue 不变，等父级回写 props', () => {
    const { changes, events } = createEvents()
    const props = createProps({ modelValue: 30 })
    const model = useSliderValue(props, events)

    model.onUpdateModelValue([42])
    expect(changes).toEqual([42])
    expect(model.currentValue.value).toBe(30)

    props.modelValue = 42
    expect(model.currentValue.value).toBe(42)
  })

  it('空载荷不写值（reka 的 update:modelValue 允许空载荷）', () => {
    const { changes, events } = createEvents()
    const model = useSliderValue(createProps({ modelValue: 30 }), events)

    model.onUpdateModelValue([])
    model.onUpdateModelValue()
    expect(changes).toEqual([])
    expect(model.currentValue.value).toBe(30)
  })
})

describe('useSliderValue 非受控模式', () => {
  it('defaultValue 作为本地初始值，reka 侧改用 defaultValue（modelValue 传 undefined）', () => {
    const { events } = createEvents()
    const model = useSliderValue(createProps({ defaultValue: 42 }), events)

    expect(model.currentValue.value).toBe(42)
    expect(model.rootValue.value).toBeUndefined()
    expect(model.rootDefaultValue.value).toEqual([42])
  })

  it('缺省落到 min（对应 WinUI Slider.Value 默认 = Minimum）', () => {
    const { events } = createEvents()
    const model = useSliderValue(createProps({ min: 10 }), events)

    expect(model.currentValue.value).toBe(10)
    expect(model.rootDefaultValue.value).toEqual([10])
  })

  it('内部更新同时写本地值并触发值变化（数值提示与滑块位置共用同一值）', () => {
    const { changes, events } = createEvents()
    const props = createProps({ defaultValue: 42 })
    const model = useSliderValue(props, events)

    model.onUpdateModelValue([43])
    expect(model.currentValue.value).toBe(43)
    expect(changes).toEqual([43])
    // 非受控：不写回父级
    expect(props.modelValue).toBeUndefined()
  })

  it('defaultValue 只作初始值，后续变更不回溯当前值', () => {
    const { events } = createEvents()
    const props = createProps({ defaultValue: 42 })
    const model = useSliderValue(props, events)

    model.onUpdateModelValue([43])
    props.defaultValue = 90
    expect(model.currentValue.value).toBe(43)
  })
})

describe('useSliderValue 数值提示文本与交互结束回调', () => {
  it('valueText 按 step 的小数位格式化', () => {
    const { events } = createEvents()
    expect(
      useSliderValue(createProps({ modelValue: 0.25, step: 0.25 }), events).valueText.value,
    ).toBe('0.25')
    expect(
      useSliderValue(createProps({ modelValue: 0.5, step: 0.25 }), events).valueText.value,
    ).toBe('0.50')
    expect(useSliderValue(createProps({ modelValue: 30, step: 1 }), events).valueText.value).toBe(
      '30',
    )
  })

  it('onValueCommit 把 reka 的数组载荷摊平成单值', () => {
    const { commits, events } = createEvents()
    const model = useSliderValue(createProps({ modelValue: 30 }), events)

    model.onValueCommit([42])
    expect(commits).toEqual([42])
  })

  it('onValueCommit 载荷为空时回落到 min（交互结束时总有一个确定值）', () => {
    const { commits, events } = createEvents()
    const model = useSliderValue(createProps({ min: 10 }), events)

    model.onValueCommit([])
    expect(commits).toEqual([10])
  })
})
