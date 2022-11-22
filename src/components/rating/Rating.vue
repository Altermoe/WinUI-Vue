<script lang="ts" setup>
const props = defineProps<{
  modelValue?: number
}>()

const emits = defineEmits<{
  (e: 'update:modelValue', v: number): void
}>()

const internalCache = ref(0)

const internalBind = computed({
  get: () => props.modelValue === undefined ? internalCache.value : props.modelValue,
  set: (v) => {
    if (props.modelValue === undefined) {
      internalCache.value = v
      return
    }
    emits('update:modelValue', v)
  },
})
</script>

<template>
  <div class="win-rating">
    Rating
  </div>
</template>

<style lang="scss" scoped>
.win-rating {
  display: flex;
}
</style>
