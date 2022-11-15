<script lang="ts" setup>
const props = defineProps<{
  modelValue?: boolean
  disabled?: boolean
}>()

const emits = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
}>()

const ctx = getCurrentInstance()
onMounted(() => {
  const slots = ctx?.slots.default?.() ?? []
  slots.forEach((slot) => {
    console.log(slot.type.valueOf())
  })
})
</script>

<template>
  <div class="win-radio-group">
    <slot />
  </div>
</template>

<style lang="scss" scoped>
.win-radio-group {
  display: flex;
}
</style>
