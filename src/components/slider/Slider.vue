<script lang="ts" setup>
import type { CSSProperties, Ref } from 'vue'
import type { Observable } from 'rxjs'
import { filter, fromEvent, map, switchMap, takeUntil } from 'rxjs'
import { fromEvent as fromEventRef, useSubscription } from '@vueuse/rxjs'
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

/** slider 容器 DOM，用于计算滑块在组件中的相对位置 */
const containerRef = ref<HTMLElement | null>(null)
/** 滑块 DOM，用于计算滑块在组件中的相对位置 */
const thumbRef = ref<HTMLElement | null>(null)
/** 头部定位 DOM，用于计算组件旋转角度和滑动矢量在容器水平中轴线的投影距离 */
const headRef = ref<HTMLElement | null>(null)
/** 尾部定位 DOM，用于计算组件旋转角度和滑动矢量在容器水平中轴线的投影距离 */
const tailRef = ref<HTMLElement | null>(null)

const { width: containerW } = useElementSize(containerRef)
const { width: thumbW } = useElementSize(thumbRef)
/** 容器长度减去滑块长度后的实际可用滑动长度 */
const slideLength = computed(() => containerW.value - thumbW.value)

/** 非受控状态下的内部缓存值 */
const internalBind = ref(0)

/** 内部双绑值 */
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

/** 区间值的总大小 */
const range = computed(() => Math.abs(props.max - props.min))
/** 当前值占区间的比 */
const ratio = computed(() => (bindValue.value - props.min) / range.value)

/** 将定位元素转换为矢量 */
const getHorizontalCentralAxis = (a: HTMLElement, b: HTMLElement) => {
  const shapeA = a.getBoundingClientRect()
  const shapeB = b.getBoundingClientRect()
  return Flatten.vector(
    Flatten.point(shapeA.x, shapeA.y),
    Flatten.point(shapeB.x, shapeB.y),
  )
}

/** 获取投影长度，处理一下矢量长度为 0 时的特殊情况 */
const getProjectionLength = (v1: Flatten.Vector, v2: Flatten.Vector) => {
  try {
    const angle = Math.cos(v1.angleTo(v2))
    const directionalCoefficient = angle / Math.abs(angle)
    return v1.projectionOn(v2).length * directionalCoefficient
  }
  catch {
    return 0
  }
}

/** 取区间值 */
const clamp = (min: number, max: number, value: number) => {
  return Math.max(min, Math.min(max, value))
}

const pointerdown = fromEventRef(thumbRef as Ref<HTMLElement>, 'pointerdown') as Observable<PointerEvent>
const pointermove = fromEvent<PointerEvent>(window, 'pointermove')
const pointerup = fromEvent(window, 'pointerup')

const slideObservable = pointerdown.pipe(
  filter(() => !props.disabled),
  map(({ x: startX, y: startY }) => Flatten.point(startX, startY)),
  switchMap((start) => {
    const startValue = bindValue.value
    return pointermove.pipe(
      takeUntil(pointerup),
      map(({ x, y }) => {
        if (!headRef.value || !tailRef.value)
          return { moveLen: 0, startValue }
        const axisVector = getHorizontalCentralAxis(headRef.value, tailRef.value)
        const moveVector = Flatten.vector(start, Flatten.point(x, y))
        const moveLen = getProjectionLength(moveVector, axisVector)
        return { moveLen, startValue }
      }),
    )
  }),
)

useSubscription(slideObservable.subscribe(({ startValue, moveLen }) => {
  // 先算出移动距离占可滑动长度的比
  const lenRatio = moveLen / slideLength.value
  // 再根据区间长度和上下限计算应该得到的数值
  const result = clamp(props.min, props.max, startValue + lenRatio * range.value)
  bindValue.value = Math.floor(result / props.step) * props.step
}))
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
    <div ref="thumbRef" class="thumb" :style="{ transform: `translate(${ratio * slideLength}px, 0)` }" />
  </div>
</template>

<style lang="scss" scoped>
.win-slider {
  --thumb-bg: linear-gradient(to bottom, rgba(0, 0, 0, 0.06), rgba(0, 0, 0, 0.16));
  --thumb-cursor: pointer;

  border: 1px solid red;
  width: v-bind(width);
  height: 24px;
  position: relative;

  &.disabled {
    --thumb-cursor: not-allowed;
    --thumb-ng: linear-gradient(to bottom, rgba(255, 255, 255, 0.09), rgba(255, 255, 255, 0.07));
  }

  .thumb {
    width: 22px;
    height: 22px;
    position: absolute;
    left: 0;
    top: 0;
    background: var(--thumb-bg);
    border-radius: 100%;
    user-select: none;
    cursor: var(--thumb-cursor);
  }
  .thumb::before {
    content: '';
    position: absolute;
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
