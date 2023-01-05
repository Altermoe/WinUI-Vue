<script lang="ts" setup>
import type { CSSProperties } from 'vue'

interface SliderProps {
  modelValue?: number
  disabled?: boolean
  width?: CSSProperties['width']
  trackHeight?: number
  trackColor?: CSSProperties['background']
  thumbColor?: CSSProperties['background']
  min?: number
  max?: number
}

const props = withDefaults(defineProps<SliderProps>(), {
  modelValue: undefined,
  min: 0,
  max: 100,
  width: '120px',
  trackHeight: 4,
  trackColor: '#005FB8',
  thumbColor: '#005FB8',
})

const emits = defineEmits<{
  (e: 'update:modelValue', v: number): void
}>()

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

const containerRef = ref<HTMLElement | null>(null)
const thumbRef = ref<HTMLElement | null>(null)

const { width: containerW, height: containerH } = useElementSize(containerRef)

const handleChange = (ev: Event) => {
  console.log('change', ev)
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
    <input class="shadow-slide" type="ranger" :min="min" :max="max" @change="handleChange">
    <div ref="thumbRef" class="win-slider__thumb" />
  </div>
</template>

<style lang="scss" scoped>
.win-slider {
  --slider-cursor: pointer;
  --slider-height: 22px;
  --slider-thumb-bg-ratio: 0%;
  --slider-thumb-radius: 6px;
  --slider-thumb-ratio: v-bind(ratio);
  --slider-track-color: v-bind(trackColor);
  --slider-thumb-color: v-bind(thumbColor);

  width: var(--slider-width);
  height: var(--slider-height);
  position: relative;
  transition: all ease 176ms;
  user-select: none;

  &::before {
    content: '';
    background: var(--slider-track-color);
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
    clip-path: inset(calc(var(--slider-height) / 2 - var(--slider-track-height)) calc(var(--slider-height) / 2 - 2px) round var(--slider-track-height));
  }

  &:not(.disabled) {
    &:hover {
      --slider-thumb-radius: 7px;
    }

    &:active {
      --slider-thumb-radius: 5px;
      --slider-thumb-bg-ratio: 100%;
    }
  }
  &.disabled {
    --slider-cursor: not-allowed;
    --slider-thumb-color: rgba(0, 0, 0, 0.2169);
    --slider-track-color: rgba(0, 0, 0, 0.2169);
  }
}

.win-slider__thumb {
  cursor: var(--slider-cursor);
  width: var(--slider-height);
  height: var(--slider-height);
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.06) var(--slider-thumb-bg-ratio), rgba(0, 0, 0, 0.16));
  border-radius: 50%;
  position: absolute;
  top: 0;
  left: 0;
  transform: translateX(calc(var(--slider-thumb-ratio) * (var(--slider-width) - var(--slider-height))));

  &::before {
    content: '';
    position: absolute;
    width: 100%;
    height: 100%;
    left: 0;
    top: 0;
    background: #fff;
    clip-path: circle(10px);
  }

  &::after {
    content: '';
    position: absolute;
    width: 100%;
    height: 100%;
    left: 0;
    top: 0;
    background: var(--slider-thumb-color);
    clip-path: circle(var(--slider-thumb-radius));
    transition: all ease 176ms;
  }
}
</style>
