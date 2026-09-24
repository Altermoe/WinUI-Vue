/**
 * Slider 取值层：受控 / 非受控两条取值路径 + reka 数组载荷的适配。
 *
 * - 受控（传了 modelValue）：值的事实源在父级。reka 侧恒为受控，本层只把
 *   reka 的数组载荷摊平成单值向上抛出（valueChange），等父级回写；
 * - 非受控：本地值（localValue）与 reka 的 defaultValue 并行维护 —— reka 自己
 *   保存内部状态用于定位滑块，本地值用于数值提示的显示。
 *
 * 只依赖 computed / ref，不依赖组件实例，可直接在测试里调用。
 */
import { computed, ref } from 'vue'
import type { ComputedRef } from 'vue'
import { SINGLE_THUMB_INDEX } from './constants'
import { formatValueText } from './disambiguation'
import type { FluereSliderProps } from './types'

/**
 * 本层用到的 props 视图。
 * min / step 由组件补过默认值，故在这里是必填；modelValue 的 undefined 表示非受控。
 */
export type SliderValueProps = Required<Pick<FluereSliderProps, 'min' | 'step'>> &
  Pick<FluereSliderProps, 'modelValue' | 'defaultValue'>

/**
 * 本层向上触发的具名事件。
 *
 * 组件里 defineEmits 生成的 emit 携带重载签名、不便跨模块传递，这里按
 * ScrollView 的 events 层思路改成具名方法，组件侧用一行适配接上；
 * 事件名拼错会在编译期暴露。
 */
export interface SliderValueEvents {
  /** 值变化（对应 update:modelValue） */
  valueChange: (value: number) => void
  /** 一次交互结算（对应 valueCommit） */
  valueCommit: (value: number) => void
}

/** 取值层对外暴露的状态与回调 */
export interface SliderValueModel {
  /** 当前值：受控取 props.modelValue，非受控取本地值 */
  currentValue: ComputedRef<number>
  /** 喂给 reka 的受控值；非受控时为 undefined（改用 rootDefaultValue） */
  rootValue: ComputedRef<number[] | undefined>
  /** 喂给 reka 的非受控初始值 */
  rootDefaultValue: ComputedRef<number[]>
  /** 数值提示文本 */
  valueText: ComputedRef<string>
  /** 把 reka 的数组载荷摊平成单值的值变化回调 */
  onUpdateModelValue: (payload?: number[]) => void
  /** 把 reka 的交互结束回调转成 valueCommit */
  onValueCommit: (payload: number[]) => void
}

export const useSliderValue = (
  props: SliderValueProps,
  events: SliderValueEvents,
): SliderValueModel => {
  /** 非受控模式下的本地值（与 reka 的 defaultValue 并行维护，供数值提示显示） */
  const localValue = ref(props.defaultValue ?? props.min)

  const currentValue = computed(() => props.modelValue ?? localValue.value)

  /** 受控时把单值包成 reka 需要的数组；非受控时交给 reka 的 defaultValue */
  const rootValue = computed(() =>
    props.modelValue === undefined ? undefined : [props.modelValue],
  )
  const rootDefaultValue = computed(() => [props.defaultValue ?? props.min])

  const valueText = computed(() => formatValueText(currentValue.value, props.step))

  const onUpdateModelValue = (payload?: number[]): void => {
    const next = payload?.[SINGLE_THUMB_INDEX]
    if (next === undefined) {
      return
    }
    localValue.value = next
    events.valueChange(next)
  }

  const onValueCommit = (payload: number[]): void => {
    events.valueCommit(payload[SINGLE_THUMB_INDEX] ?? props.min)
  }

  return {
    currentValue,
    rootValue,
    rootDefaultValue,
    valueText,
    onUpdateModelValue,
    onValueCommit,
  }
}
