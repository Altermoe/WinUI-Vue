<script lang="ts" setup>
import Radio from './Radio.vue'
const props = defineProps<{
  modelValue?: string | number
  disabled?: boolean
  options?: { label?: string; value: string | number; disabled?: boolean }[]
}>()

const emits = defineEmits<{
  (e: 'update:modelValue', v?: string | number): void
}>()

const bindValue = computed({
  get: () => props.modelValue,
  set: v => emits('update:modelValue', v),
})

provide('emitValue', (v?: string | number) => {
  bindValue.value = v
})
</script>

<template>
  <form
    class="win-radio-group"
    :class="{
      disabled,
    }"
  >
    <Radio
      v-for="option in options"
      :key="option.value"
      :label="option.label"
      :value="option.value"
      :checked="option.value === bindValue"
      :disabled="disabled"
    />
  </form>
</template>

<style lang="scss" scoped>
.win-radio-group {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}
</style>
