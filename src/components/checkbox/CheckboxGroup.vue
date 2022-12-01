<script lang="ts" setup>
import { Checkbox } from '.'

type CheckboxValue = string | number

interface CheckboxOption {
  label?: string
  value: CheckboxValue
}

const props = defineProps<{
  modelValue?: CheckboxValue[]
  options?: CheckboxOption[]
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
</script>

<template>
  <div class="win-checkbox">
    <Checkbox v-for="op in options" :key="op.value" :option="op" :checked="true" />
  </div>
</template>

<style lang="scss" scoped>
.win-checkbox {
  display: flex;
  gap: 1rem;
}
</style>
