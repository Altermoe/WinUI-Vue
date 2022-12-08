<script lang="ts" setup>
const props = withDefaults(defineProps<{
  modelValue?: string
  type?: 'rgba' | 'hsl'
}>(), {
  type: 'rgba',
})

const emits = defineEmits<{
  (e: 'update:modelValue', v?: string): void
}>()

const colormapRef = ref<HTMLCanvasElement | null>(null)
const { width, height } = useElementSize(colormapRef)
const colormapCtx = computed(() => colormapRef.value?.getContext('2d'))

const drawBackground = ([w, h]: [number, number]) => {
  const ctx = colormapCtx.value
  if (!ctx)
    throw new Error('无法获取绘制上下文')
  ctx.save()
  for (let i = 0; i < 256; i++) {
    const gradient = ctx.createLinearGradient(0, 0, 1, 255)
    gradient.addColorStop()
    ctx.fillStyle = '#000'
    ctx.fillRect(0, 0, w, h)
  }
  ctx.restore()
}

useResizeObserver(colormapRef, (entry) => {
  const { width, height } = entry[0].contentRect
  drawBackground([width, height])
})
</script>

<template>
  <div class="win-colorpicker" :class="{ round: type === 'hsl' }">
    <canvas
      ref="colormapRef"
      class="win-colorpicker__colormap"
      :width="width"
      :height="height"
    />
  </div>
</template>

<style lang="scss" scoped>
.win-colorpicker__colormap {
  display: inline-block;
  width: 256px;
  height: 256px;
  overflow: hidden;
}
</style>
