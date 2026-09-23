<script lang="ts">
import type { AcceptableValue, DataOrientation, Direction } from 'reka-ui'

/**
 * FluereRadioGroup 组件 Props 契约
 *
 * 设计规范来源：WinUI 3 / Windows App SDK — RadioButton 成组使用
 * （同组互斥 + 方向键在组内导航，见 RadioButton_themeresources.xaml 与
 *   KeyboardAccelerator / ScopeRegistry 约定）
 * 交互底座复用 reka-ui 的 RadioGroupRoot：roving focus 方向键导航、
 * role=radiogroup、同组互斥、表单隐藏 input。
 * 取值一律经 Fluent 2 语义 token 落地（fluent-tokens：data/fluent-tokens.json）
 *
 * 用法：用 v-model 绑定当前选中值，内部放入若干 <FluereRadioButton value=…>。
 *
 * 无障碍：根元素自带 role=radiogroup；可选 label 提供 aria-label，或由表单上下文
 * 关联 label。方向键（↑↓/←→）在组内循环导航并实时选中（reka roving focus）。
 */
export interface FluereRadioGroupProps {
  /**
   * 当前选中值（v-model）
   */
  modelValue?: AcceptableValue

  /**
   * 非受控初始选中值
   */
  defaultValue?: AcceptableValue

  /**
   * 是否禁用整组单选项
   * @default false
   */
  disabled?: boolean

  /**
   * 布局方向：vertical（纵向） / horizontal（横向）
   * @default 'vertical'
   */
  orientation?: DataOrientation

  /**
   * 表单提交名（位于表单内时 reka 自动补隐藏原生 radio input）
   */
  name?: string

  /**
   * 组内必选约束（配合 reka 表单校验）
   * @default false
   */
  required?: boolean

  /**
   * 用方向键在首尾项之间循环导航
   * @default true
   */
  loop?: boolean

  /**
   * 阅读方向（一般无需设置，由 ConfigProvider / LTR 推断）
   */
  dir?: Direction

  /**
   * 组的可访问名称（无障碍，等价 aria-label）。无可见 group 标签时建议提供。
   */
  label?: string
}
</script>

<script setup lang="ts">
import { RadioGroupRoot as RekaRadioGroupRoot } from 'reka-ui'
import { computed } from 'vue'

const props = withDefaults(defineProps<FluereRadioGroupProps>(), {
  modelValue: undefined,
  defaultValue: undefined,
  disabled: false,
  orientation: 'vertical',
  name: undefined,
  required: false,
  loop: true,
  dir: undefined,
  label: undefined,
})

const emit = defineEmits<{
  'update:modelValue': [value?: AcceptableValue]
}>()

const rootClass = computed(() => ['fui-radio-group'])
const rootAttrs = computed(() => ({
  'data-orientation': props.orientation,
  ...(props.label ? { 'aria-label': props.label } : {}),
}))

/** 转发 reka 的选中值变化为组自身的 v-model 事件 */
const onUpdateModelValue = (value: AcceptableValue) => emit('update:modelValue', value)

defineOptions({ name: 'FluereRadioGroup' })
</script>

<template>
  <RekaRadioGroupRoot
    :model-value="props.modelValue"
    @update:model-value="onUpdateModelValue"
    :default-value="defaultValue"
    :disabled="disabled"
    :name="name"
    :required="required"
    :loop="loop"
    :dir="dir"
    :orientation="orientation"
    :class="rootClass"
    v-bind="rootAttrs"
  >
    <slot />
  </RekaRadioGroupRoot>
</template>

<style scoped>
/* ------------------------------------------------------------------ */
/* 组布局：默认纵向堆叠，项间距取 Fluent 垂直 spacing；横向时水平排开。 */
/* 单选互斥、方向键导航由 reka RadioGroupRoot 承担，本组件只负责排布。  */
/* ------------------------------------------------------------------ */

.fui-radio-group {
  display: inline-flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--spacingVerticalM); /* 纵向项间距 12px */
}
.fui-radio-group[data-orientation='horizontal'] {
  flex-direction: row;
  flex-wrap: wrap;
  gap: var(--spacingHorizontalL); /* 横向项间距 16px */
}
</style>
