<script lang="ts" setup>
withDefaults(defineProps<{
  bordered?: boolean
  active?: boolean
  shadow?: boolean
  type?: string
  rounded?: boolean
}>(), {
  active: false,
  border: true,
  shadow: true,
  type: '',
  rounded: true,
})
</script>

<template>
  <div
    class="win-layer"
    :class="{
      [type]: true,
      shadow,
      bordered,
      active,
      rounded,
    }"
    v-bind="$attrs"
  >
    <slot />
  </div>
</template>

<style lang="scss" scoped>
.win-layer {
  background: var(--win-bg-solid-base);
  // backdrop-filter: blur(10px);
  // background-blend-mode: color;
  // mix-blend-mode: multiply;
  // transition-property: border, box-shadow;
  // transition-duration: 187ms;
  // transition-timing-function: cubic-bezier(0, 0, 0, 1);

  &.active {
    box-shadow: 0px 32px 64px rgba(0, 0, 0, 0.28), 0px 2px 21px rgba(0, 0, 0, 0.22);
    filter: drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25));
  }

  &.bordered {
    border: 1px solid rgba(117, 117, 117, 0.4);
  }

  &.shadow {
    box-shadow: 0px 16px 32px rgba(0, 0, 0, 0.1876), 0px 2px 10.67px rgba(0, 0, 0, 0.1474);
  }

  &.rounded {
    border-radius: 7px;
  }
}
</style>
