<script lang="ts" setup>
interface SliderProps {
  modelValue?: number
  min?: number
  max?: number
}

const props = withDefaults(defineProps<SliderProps>(), {
  modelValue: undefined,
  min: 0,
  max: 100,
})

const emits = defineEmits<{
  (e: 'modelValue', v: number): void
}>()

const internalBind = ref(0)

const bindValue = computed({
  get: () => props.modelValue === undefined ? internalBind.value : props.modelValue,
  set: (v) => {
    if (props.modelValue === undefined) {
      internalBind.value = v
      return
    }
    emits('modelValue', v)
  },
})
</script>

<template>
  <div class="win-slider">
    <div class="win-slider__thumb" />
  </div>
</template>

<style lang="scss" scoped>
.win-slider {
  width: 120px;
  height: 22px;
  border-radius: 2px;
}

.win-slider__thumb {
  width: 22px;
  height: 22px;
  border: 1px solid rgba(0, 0, 0, 0.16);
  border-radius: 50%;
}
</style>
