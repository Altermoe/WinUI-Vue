<script lang="ts" setup>
const props = defineProps<{
  modelValue?: boolean
  options?: RadioOption[]
  disabled?: boolean
}>()

const emits = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
}>()

interface RadioOption {
  title?: string
  value: string | number | boolean
}
</script>

<template>
  <div>
    <!-- 暂时不确定是要否通过原生元素来做 -->
    <input type="radio">
  </div>
</template>
