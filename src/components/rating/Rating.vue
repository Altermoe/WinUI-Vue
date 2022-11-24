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

const containerRef = ref<HTMLElement | null>(null)
const isHover = useElementHover(containerRef)

const hoverRating = ref(0)
const switchStar = (ratio: number) => {
  if (!isHover.value)
    return ''
  return ratio > 0.75
    ? ''
    : ratio > 0.5
      ? ''
      : ratio > 0.25
        ? ''
        : ratio > 0
          ? ''
          : ''
}

const hoverRate = (ev: MouseEvent, index: number) => {
  hoverRating.value = index + ev.offsetX / (ev.target as HTMLElement).clientWidth
}

const confirmScore = () => {
  internalBind.value = hoverRating.value - 1
}
</script>

<template>
  <div ref="containerRef" class="win-rating" @click="confirmScore">
    <div
      v-for="i in 5"
      :key="i"
      :data-mask="switchStar(hoverRating - i)"
      class="win-rating__item win-icon w-full h-full"
      @mousemove="(ev) => hoverRate(ev, i)"
    >
      
    </div>
    {{ hoverRating }}
  </div>
</template>

<style lang="scss" scoped>
.win-rating {
  --rating-item-size:  24px;

  display: flex;
}

.win-rating__item {
  width: var(--rating-item-size);
  height: var(--rating-item-size);
  display: grid;
  place-items: center;
  user-select: none;
  font-size: 16px;
  cursor: pointer;
  position: relative;

  &::before {
    content: attr(data-mask);
    position: absolute;
    width: 100%;
    height: 100%;
    left: 0;
    top: 0;
    display: grid;
    place-items: center;
    color: #005FB8;
  }
}
</style>
