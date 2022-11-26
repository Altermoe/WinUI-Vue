<script lang="ts" setup>
const props = defineProps<{
  modelValue?: number
  disabled?: boolean
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
  <div ref="containerRef" class="win-rating" :class="{ disabled }" @click="confirmScore">
    <div class="win-rating__selector">
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
    <div class="win-rating__text">
      {{ internalBind }}
    </div>
  </div>
</template>

<style lang="scss" scoped>
.win-rating {
  --rating-item-size:  16px;
  --rating-wrapper-size: calc(var(--rating-item-size) + 8px);

  display: flex;
  gap: 4px;
  color: rgba(0, 0, 0, 0.6063);
}

.win-rating__selector {
  height: var(--rating-wrapper-size);
  width: calc(5 * var(--rating-wrapper-size));
  display: grid;
  grid-template-columns: repeat(5, var(--rating-wrapper-size));
}

.win-rating__text {
  height: var(var(--rating-wrapper-size));
  line-height: var(--rating-item-size);
  font-size: 12px;
  display: grid;
  place-items: center;
}

.win-rating__item {
  height: 100%;
  width: 100%;
  display: grid;
  place-items: center;
}

.win-rating__item-wrapper {
  width: var(--rating-item-size);
  height: var(--rating-item-size);
  font-size: var(--rating-item-size);
  line-height: var(--rating-item-size);
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

  // &[data-mask=""] {
  //   filter: drop-shadow(0 0 2px #005FB8);
  // }
}
</style>
