<script lang="ts" setup>
import type { CSSProperties } from 'vue'

interface SliderProps {
  modelValue?: number
  disabled?: boolean
  width?: CSSProperties['width']
  trackHeight?: number
  trackColor?: CSSProperties['background']
  thumbColor?: CSSProperties['background']
  step?: number
  min?: number
  max?: number
}

const props = withDefaults(defineProps<SliderProps>(), {
  modelValue: undefined,
  min: 0,
  max: 100,
  step: 1,
  width: '120px',
  trackHeight: 4,
  trackColor: '#005FB8',
  thumbColor: '#005FB8',
})

const emits = defineEmits<{
  (e: 'update:modelValue', v: number): void
}>()

const containerRef = ref<HTMLElement | null>(null)
const inputRef = ref<HTMLInputElement | null>(null)

const internalBind = ref(0)

const bindValue = computed({
  get: () => props.modelValue === undefined ? internalBind.value : props.modelValue,
  set: (v) => {
    if (props.modelValue === undefined) {
      internalBind.value = v
      return
    }
    emits('update:modelValue', v)
  },
})

const range = computed(() => Math.abs(props.max - props.min))
const ratio = computed(() => (bindValue.value - props.min) / range.value)

const { width: containerW, height: containerH } = useElementSize(containerRef)

onMounted(() => {
  if (!inputRef.value || props.modelValue === undefined)
    return
  if (props.modelValue === undefined || props.modelValue < props.min || props.modelValue > props.max)
    return
  inputRef.value.value = `${props.modelValue}`
})
const handleChange = (ev: Event) => {
  bindValue.value = Number((ev.target as HTMLInputElement).value)
}
</script>

<template>
  <div
    ref="containerRef"
    class="win-slider"
    :class="{ disabled }"
    :style="{
      '--slider-width': `${containerW}px`,
      '--slider-track-height': `${trackHeight / 2}px`,
      width,
    }"
  >
    <input ref="inputRef" class="shadow-slide" type="range" :min="min" :max="max" :value="bindValue" :step="step" @input="handleChange">
  </div>
</template>

<style lang="scss" scoped>
// .win-slider {
// }

.shadow-slide {
  display: block;
  width: var(--slider-width);
  // opacity: 0;
}
</style>
