<script lang="ts" setup>
import { useConditionalltHandler } from '@/hooks'

const props = withDefaults(defineProps<{
  disabled?: boolean
  noFocus?: boolean
}>(), {
  disabled: false,
  noFocus: false,
})

const emits = defineEmits<{
  (e: 'click', ev: MouseEvent): void
}>()

const { handler } = useConditionalltHandler(emits, {
  disabled: toRef(props, 'disabled'),
  preventDefault: true,
})
</script>

<template>
  <a
    v-bind="$attrs"
    class="win-link"
    :class="{
      disabled,
      noFocus,
    }"
    :disabled="disabled"
    @click="handler('click', $event)"
  >
    <slot />
  </a>
</template>

<style lang="scss" scoped>
.win-link {
  color: #003E92;
  cursor: pointer;
  text-decoration-line: underline;
  line-height: 20px;
  font-size: 14px;
  font-weight: 400;
  border-radius: 4px;

  &:not(.disabled) {
    &:hover {
      color: #001A68;
      text-decoration: none;
    }

    &:active {
      color: #005FB8;
      text-decoration: none;
    }

    &:focus {
      outline: 2px solid #000;
      outline-offset: 1px;
    }
  }

  &.disabled {
    color: rgba(0, 0, 0, 0.3614);
    cursor: not-allowed;
  }

  &.noFocus {
    outline: none;
  }
}
</style>
