<script lang="ts" setup>
const props = defineProps<{
  modelValue?: string
}>()

const emits = defineEmits<{
  (e: 'update:modelValue', v?: string): void
}>()
</script>

<template>
  <div class="win-colorpicker">
    ColorPicker
  </div>
</template>
