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

const thumbRef = ref<HTMLElement | null>(null)
useEventListener(thumbRef, 'pointerdown', (ev) => {
  if ((ev as PointerEvent).button !== 0)
    return

  const container = (ev.target as HTMLElement).parentElement as HTMLElement
  const { x: rawXmin, width: rawWidth } = container.getBoundingClientRect()
  const rawXmax = rawXmin + rawWidth
  const offset = parseInt(getComputedStyle(container)
    .getPropertyValue('--slider-height')
    .match(/\d+/)
    ?.[0] ?? '',
  ) / 2
  const xmin = rawXmin + offset
  const xmax = rawXmax - offset
  const width = xmax - xmin

  const stopPointermoveListerner = useEventListener('pointermove', (moveEv) => {
    const { x } = moveEv as PointerEvent
    const posRatio = Math.min(Math.max(0, (x - xmin) / width), 1)
    bindValue.value = posRatio * range.value
  })

  const stopPointerupListener = useEventListener('pointerup', () => {
    stopPointermoveListerner()
    stopPointerupListener()
  })
})
</script>

<template>
  <div class="win-slider">
    <div ref="thumbRef" class="win-slider__thumb" />
  </div>
</template>

<style lang="scss" scoped>
.win-slider {
  --slider-height: 22px;
  --slider-width: 120px;
  --slider-thumb-bg-ratio: 0%;
  --slider-thumb-radius: 6px;
  --slider-thumb-ratio: v-bind(ratio);

  width: var(--slider-width);
  height: var(--slider-height);
  position: relative;
  transition: all ease 176ms;

  &::before {
    content: '';
    background: #005FB8;
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
    clip-path: inset(calc(var(--slider-height) / 2 - 2px) calc(var(--slider-height) / 2 - 2px) round 2px);
  }

  :not(.disabled) {
    &:hover {
      --slider-thumb-radius: 7px;
    }

    &:active {
      --slider-thumb-radius: 5px;
      --slider-thumb-bg-ratio: 100%;
    }
  }
}

.win-slider__thumb {
  cursor: pointer;
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
    background: #005FB8;
    clip-path: circle(var(--slider-thumb-radius));
    transition: all ease 176ms;
  }
}
</style>
