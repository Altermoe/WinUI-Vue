<script lang="ts" setup>
import Radio from './Radio.vue'
const props = defineProps<{
  modelValue?: string | number
  disabled?: boolean
  options?: { label?: string; value: string | number; disabled?: boolean }[]
}>()

const emits = defineEmits<{
  (e: 'update:modelValue', v: string | number): void
}>()

const bindValue = computed({
  get: () => props.modelValue,
  set: (v) => {
    if (v === undefined || v === null)
      return
    emits('update:modelValue', v)
  },
})

const onChange = (ev: Event) => {
  console.log(ev)
  bindValue.value = (ev.target as HTMLInputElement).value
}
</script>

<template>
  <form
    class="win-radio-group"
    :class="{
      disabled,
    }"
    @change="onChange"
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
  gap: 1rem;
}
</style>
