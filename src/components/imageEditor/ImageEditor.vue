<script lang="ts" setup>
defineProps<{
  image?: ImageBitmap
  offset?: [number, number]
}>()

const containerRef = ref<HTMLElement | null>(null)
const { width, height } = useElementBounding(containerRef)
</script>

<template>
  <div ref="containerRef" class="win-image-editor">
    <canvas class="win-image-editor__canvas" :width="width" :height="height" />
  </div>
</template>

<style lang="scss" scoped>
.win-image-editor__canvas {
  width: 100%;
  height: 100%;
}
</style>
