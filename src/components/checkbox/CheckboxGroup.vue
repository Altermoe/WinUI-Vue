<script lang="ts" setup>
import { Checkbox } from '.'

type CheckboxValue = string | number

interface CheckboxOption {
  label?: string
  value: CheckboxValue
  disabled?: boolean
}

const props = defineProps<{
  modelValue?: CheckboxValue[]
  options?: CheckboxOption[]
  disabled?: boolean
}>()

const emits = defineEmits<{
  (e: 'update:modelValue', v: CheckboxValue[]): void
}>()

const cache = ref<CheckboxValue[]>([])

const internalBind = computed({
  get: () => props.modelValue === undefined ? cache.value : props.modelValue,
  set: (v) => {
    if (props.modelValue === undefined) {
      cache.value = v
      return
    }
    emits('update:modelValue', v)
  },
})

const internalSetBind = computed(() => new Set(internalBind.value))

const toggleValue = (option: CheckboxOption) => {
  if (props.disabled)
    return
  const set = unref(internalSetBind.value)
  set.has(option.value)
    ? set.delete(option.value)
    : set.add(option.value)
  internalBind.value = [...set]
}
</script>

<template>
  <div class="win-checkbox" :class="{ disabled }">
    <Checkbox
      v-for="op in options"
      :key="op.value"
      :model-value="internalSetBind.has(op.value)"
      :disabled="disabled || op.disabled"
      :label="op.label"
      @update:model-value="() => toggleValue(op)"
    />
  </div>
</template>

<style lang="scss" scoped>
.win-checkbox {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 1rem;
}
</style>
