<script lang="ts" setup>
const props = defineProps<{
  label?: string
  value: string | number
  disabled?: boolean
  checked?: boolean
}>()
</script>

<template>
  <label :for="label" class="win-radio">
    <input :id="label" type="radio" :value="value" :checked="checked" name="win-radio">
    {{ label }}
  </label>
</template>

<style lang="scss" scoped>
.win-radio {
  display: flex;
  gap: 0.5em;
}
</style>
