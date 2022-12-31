<script lang="ts" setup>
/**
 * 之所以选择 Blob 作为绑定类型，
 * 是考虑到 Blob 可以比较方便的转换为 File、ImageBitmap 等类型
 */
const props = defineProps<{
  modelValue?: Blob
}>()

const emits = defineEmits<{
  (e: 'update:modelValue', v?: Blob): void
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
