<script lang="ts" setup>
import type { CSSProperties } from 'vue'
import { fromEvent, map, switchMap, takeUntil } from 'rxjs'
import Flatten from '@flatten-js/core'

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
const thumbRef = ref<HTMLElement | null>(null)
const headRef = ref<HTMLElement | null>(null)
const tailRef = ref<HTMLElement | null>(null)

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
const { width: containerW } = useElementSize(containerRef)
const { width: thumbW } = useElementSize(thumbRef)
const ratio = computed(() => (bindValue.value - props.min) / range.value)

const getHorizontalCentralAxis = (a: HTMLElement, b: HTMLElement) => {
  const shapeA = a.getBoundingClientRect()
  const shapeB = b.getBoundingClientRect()
  return Flatten.vector(
    Flatten.point(shapeA.x, shapeA.y),
    Flatten.point(shapeB.x, shapeB.y),
  )
}

const clamp = (min: number, max: number, value: number) => {
  return Math.max(min, Math.min(max, value))
}

onMounted(() => {
  if (!thumbRef.value)
    return

  const pointerdown = fromEvent<PointerEvent>(thumbRef.value, 'pointerdown')
  const pointermove = fromEvent<PointerEvent>(window, 'pointermove')
  const pointerup = fromEvent(window, 'pointerup')

  pointerdown
    .pipe(switchMap(({ x: startX, y: startY }) => {
      const start = Flatten.point(startX, startY)
      const startValue = bindValue.value
      return pointermove.pipe(
        takeUntil(pointerup),
        map(({ x, y }) => {
          if (!headRef.value || !tailRef.value) {
            return {
              moveLen: 0,
              startValue,
            }
          }
          const axisVector = getHorizontalCentralAxis(headRef.value, tailRef.value)
          const moveVector = Flatten.vector(start, Flatten.point(x, y))
          const angle = Math.cos(moveVector.angleTo(axisVector))
          const directionalCoefficient = angle / Math.abs(angle)
          return {
            moveLen: moveVector.projectionOn(axisVector).length * directionalCoefficient,
            startValue,
          }
        }),
      )
    }))
    .subscribe(({ startValue, moveLen }) => {
      const result = clamp(props.min, props.max, startValue + moveLen)
      bindValue.value = Math.floor(result / props.step) * props.step
    })
})
</script>

<template>
  <div
    ref="containerRef"
    class="win-slider"
    v-bind="$attrs"
    :class="{ disabled }"
    :style="{
      '--slider-width': `${containerW}px`,
      '--slider-track-height': `${trackHeight / 2}px`,
      width,
    }"
  >
    <div ref="headRef" class="positioning-element positioning-element__head" />
    <div ref="tailRef" class="positioning-element positioning-element__tail" />
    <div ref="thumbRef" class="thumb" :style="{ transform: `translate(${ratio * (containerW - thumbW)}px, 0)` }" />
  </div>
</template>

<style lang="scss" scoped>
.win-slider {
  border: 1px solid red;
  width: v-bind(width);
  height: 24px;
  position: relative;
  background: linear-gradient(transparent 49%, red 50%, transparent 50%);

  .thumb {
    width: 22px;
    height: 22px;
    position: absolute;
    left: 0;
    top: 0;
    background-color: blue;
    user-select: none;
  }

  .positioning-element {
    width: 0;
    height: 0;
    top: 50%;
    position: absolute;
  }

  .positioning-element__head {
    left: 0;
  }

  .positioning-element__tail {
    left: 100%;
  }
}
</style>
