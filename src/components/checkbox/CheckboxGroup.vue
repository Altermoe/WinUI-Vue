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

const toggleValue = (option: CheckboxOption) => {
  console.log(option)
  // emits('update:modelValue', [])
}
</script>

<template>
  <div class="win-checkbox" :class="{ disabled }">
    <Checkbox v-for="op in options" :key="op.value" :option="op" :checked="true" @click="() => toggleValue(op)" />
  </div>
</template>

<style lang="scss" scoped>
.win-checkbox {
  display: flex;
  gap: 1rem;
}
</style>
