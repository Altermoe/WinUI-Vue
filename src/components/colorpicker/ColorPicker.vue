<script lang="ts" setup>
const props = defineProps<{
  label?: string
  value: string | number
  disabled?: boolean
  checked?: boolean
}>()

const emitValue = inject('emitValue') as (v: string | number) => void

const updateValue = () => {
  if (props.disabled)
    return
  emitValue(props.value)
}
</script>

<template>
  <div class="win-radio" :class="{ disabled, checked }" @click="updateValue">
    <div class="win-radio__input" :value="value" />
    {{ label }}
  </div>
</template>
