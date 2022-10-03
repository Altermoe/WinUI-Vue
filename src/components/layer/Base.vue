<script lang="ts" setup>
withDefaults(defineProps<{
  border?: boolean
  active?: boolean
  shadow?: boolean
}>(), {
  active: false,
  border: true,
  shadow: true,
})
</script>

<template>
  <div
    class="base"
    :class="{
      border,
      active,
    }"
    v-bind="$attrs"
  >
    <slot />
  </div>
</template>

<style lang="scss" scoped>
.base {
  background: linear-gradient(0deg, rgba(243, 243, 243, 0.5), rgba(243, 243, 243, 0.5)), #F3F3F3;
  background-blend-mode: color, luminosity;
  mix-blend-mode: multiply;
  transition-property: background, border, box-shadow;
  transition-duration: 187ms;
  transition-timing-function: cubic-bezier(0, 0, 0, 1);

  &.active {
    box-shadow: 0px 32px 64px rgba(0, 0, 0, 0.28), 0px 2px 21px rgba(0, 0, 0, 0.22);
    filter: drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25));
  }

  &.border {
    border: 1px solid rgba(117, 117, 117, 0.4);
    border-radius: 7px;
  }

  &.shadow {
    box-shadow: 0px 16px 32px rgba(0, 0, 0, 0.1876), 0px 2px 10.67px rgba(0, 0, 0, 0.1474);
  }
}
</style>
