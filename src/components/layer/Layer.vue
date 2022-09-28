<script lang="ts" setup></script>

<template>
  <div class="layer" v-bind="$attrs">
    <slot />
  </div>
</template>

<style lang="scss" scoped>
.layer {
  background: rgba(255, 255, 255, 0.5);
  border: 1px solid rgba(0, 0, 0, 0.0578);
}
</style>
