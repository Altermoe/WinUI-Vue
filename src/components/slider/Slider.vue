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

useEventListener<PointerEvent>(thumbRef, 'pointerdown', (ev) => {
  if (props.disabled || ev.button !== 0)
    return

  const container = (ev.target as HTMLElement).parentElement as HTMLElement
  const { x: cxmin, y: cymin, width: cw, height: ch } = container.getBoundingClientRect()
  console.log(cw, ch, container.clientWidth, container.clientHeight)
  /** 容器的斜率 */
  const k1 = ch / cw
  /** 轨道端点为了在视觉上适配滑块而向内缩减的偏移量 */
  const offset = parseInt(getComputedStyle(container)
    .getPropertyValue('--slider-height')
    .match(/\d+/)
    ?.[0] ?? '',
  ) / 2
  /** 计算容器长度（不含缩减），这里不使用宽度是因为要适配不同旋转角度的轨道 */
  const len = Math.hypot(cw, ch) - 2 * offset

  /** 缓存点击的起始位置 */
  const startPoint = [ev.x, ev.y]

  const stopPointermoveListerner = useEventListener('pointermove', (moveEv) => {
    const { x, y } = moveEv as PointerEvent
    /** 移动线段的长度 */
    const moveLen = Math.hypot(x - startPoint[0], y - startPoint[1])
    /** 移动线段的斜率 */
    const k2 = (y - startPoint[1]) / (x - startPoint[0])
    /** 移动线段与容器线段的夹角 */
    const arc = Math.atan((k2 - k1) / (1 + k1 * k2))
    /** 移动线段在容器线段上的投影距离 */
    const peojectionDist = moveLen * Math.sin(arc)
    console.log({ peojectionDist })
    /** 投影长度占容器线段的比值 */
    const posRatio = Math.min(Math.max(0, peojectionDist / len), 1)
    bindValue.value = posRatio * range.value
  })

  const stopPointerupListener = useEventListener('click', () => {
    stopPointermoveListerner()
    stopPointerupListener()
  })
})
</script>

<template>
  <div
    ref="containerRef"
    class="win-slider"
    :class="{ disabled }"
    :style="{
      '--slider-width': `${containerW}px`,
      '--slider-track-height': `${trackHeight / 2}px`,
      '--slider-track-color': trackColor,
      '--slider-thumb-color': thumbColor,
      width,
    }"
  >
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

  width: var(--slider-width);
  height: var(--slider-height);
  position: relative;
  transition: all ease 176ms;

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
