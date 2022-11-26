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
  const rate = hoverRating.value - 1
  const intPart = Math.floor(rate)
  const floatPart = rate - intPart
  internalBind.value = intPart
    + (floatPart > 0.75
      ? 1
      : floatPart > 0.5
        ? 0.75
        : floatPart > 0.25
          ? 0.5
          : floatPart > 0
            ? 0.25
            : 0)
}
</script>

<template>
  <div ref="containerRef" class="win-rating" @click="confirmScore">
    <div
      v-for="i in 5"
      :key="i"
      class="win-rating__item"
    >
      <div
        :data-mask="isHover ? switchStar(hoverRating - i) : switchStar(internalBind + 1 - i)"
        class="win-rating__item-wrapper win-icon"
        @mousemove="(ev) => hoverRate(ev, i)"
      >
        
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.win-rating {
  --rating-item-size:  16px;

  width: 120px;
  height: 24px;
  display: grid;
  grid-template-columns: repeat(5, 24px);
}

.win-rating__item {
  height: 100%;
  width: 100%;
  display: grid;
  place-items: center;
}

.win-rating__item-wrapper {
  width: 16px;
  height: 16px;
  font-size: 16px;
  line-height: 16px;
  position: relative;
  user-select: none;
  cursor: pointer;

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
