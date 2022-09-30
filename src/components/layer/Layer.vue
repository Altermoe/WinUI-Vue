<script lang="ts" setup>
withDefaults(defineProps<{
  rounded?: boolean
}>(), {
  rounded: true,
})
</script>

<template>
  <div class="layer" :class="{ rounded }" v-bind="$attrs">
    <slot />
  </div>
</template>

<style lang="scss" scoped>
.layer {
  background: rgba(255, 255, 255, 0.5);
  border: 1px solid rgba(0, 0, 0, 0.0578);

  &.rounded {
    border-radius: 8px;
  }
}
</style>
