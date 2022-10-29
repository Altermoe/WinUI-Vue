<script lang="ts" setup>
defineProps<{
  rtl?: boolean
  rtr?: boolean
  rbl?: boolean
  rbr?: boolean
  bt?: boolean
  br?: boolean
  bb?: boolean
  bl?: boolean
  border?: boolean
}>()
</script>

<template>
  <div
    v-bind="$attrs"
    class="layer"
    :class="{
      'r-tl': rtl,
      'r-tr': rtr,
      'r-bl': rbl,
      'r-br': rbr,
      'bt': bt,
      'br': br,
      'bb': bb,
      'bl': bl,
    }"
  >
    <slot />
  </div>
</template>

<style lang="scss" scoped>
// TODO: 这个组件与 Base 似乎有点定位重复
.layer {
  --border-radius: 8px;
  --border-color: rgba(0, 0, 0, 0.0578);
  --border-width: 1px;

  background: rgba(255, 255, 255, 0.5);
  border-style: solid;

  &.bt {
    border-top-width: var(--border-width);
  }
  &.br {
    border-right-width: var(--border-width);
  }
  &.bb {
    border-bottom-width: var(--border-width);
  }
  &.bl {
    border-left-width: var(--border-width);
  }

  &.r-tl {
    border-top-left-radius: var(--border-radius);
  }
  &.r-tr {
    border-top-right-radius: var(--border-radius);
  }
  &.r-bl {
    border-bottom-left-radius: var(--border-radius);
  }
  &.r-br {
    border-bottom-right-radius: var(--border-radius);
  }
}
</style>
