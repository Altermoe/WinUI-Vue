<script lang="ts" setup>
import { useConditionalltHandler } from '@/hooks'
const props = withDefaults(defineProps<{
  type?: 'accent' | 'standard' | 'text' | 'critical' | 'success' | 'caution'
  disabled?: boolean
  outline?: boolean
}>(), {
  type: 'standard',
  disabled: false,
  outline: false,
})

const emits = defineEmits<{
  (e: 'click', ev: MouseEvent): void
}>()

const { handler } = useConditionalltHandler(emits, {
  disabled: toRef(props, 'disabled'),
})
</script>

<template>
  <button
    v-bind="$attrs"
    type="button"
    class="win-button"
    :disabled="disabled"
    :aria-disabled="disabled"
    :class="{
      [type]: true,
      disabled,
      outline,
    }"
    @click="handler('click', $event)"
  >
    <slot />
  </button>
</template>

<style lang="scss" scoped>
.win-button {
  cursor: pointer;
  display: flex;
  border: 1px solid transparent;
  justify-content: center;
  align-items: center;
  padding: 5px 12px 7px;
  border-radius: 4px;
  height: 32px;
  font-size: 14px;
  line-height: 20px;
  text-align: center;
  font-weight: 400;
  background: transparent;

  &.outline:focus {
    &:not(.disabled) {
      outline: 2px solid #000;
      outline-offset: 1px;
    }
  }

  &.text {
    &:not(.disabled) {
      color: #003E92;

      &:hover {
        color: #001A68;
        background: rgba(0, 0, 0, 0.0373);
      }

      &:active {
        color: #005FB8;
        background: rgba(0, 0, 0, 0.0241);
      }
    }

    &.disabled {
      color: rgba(0, 0, 0, 0.3614);
      background: transparent;
    }
  }

  &:not(.text) {
    color: rgba(255, 255, 255, 1);
    border-color: rgba(255, 255, 255, 0.08);
    border-bottom-color: rgba(0, 0, 0, 0.4);
    &:not(.disabled):active {
      color: rgba(255, 255, 255, 0.7);
      border-bottom-color: rgba(255, 255, 255, 0.08);
    }
  }

  &.standard {
    &:not(.disabled) {
      color: rgba(0, 0, 0, 0.9);
      background: rgba(255, 255, 255, 0.7);
      border-color: rgba(0, 0, 0, 0.06);
      border-bottom-color: rgba(0, 0, 0, 0.16);
      &:hover {
        background: rgba(249, 249, 249, 0.5);
      }
      &:active {
        color: rgba(0, 0, 0, 0.5);
        background: rgba(249, 249, 249, 0.3);
        border-bottom-color: rgba(0, 0, 0, 0.06);
      }
    }

    &.disabled {
      color: rgba(0, 0, 0, 0.3614);
      background: rgba(249, 249, 249, 0.3);
      border-bottom-color: rgba(0, 0, 0, 0.06);
    }
  }

  &.accent {
    &:not(.disabled) {
      background: rgb(0, 95, 184);
      &:hover {
        background: rgba(0, 95, 184, 0.9);
      }
      &:active {
        background: rgba(0, 95, 184, 0.8);
      }
    }
  }

  &.critical {
    &:not(.disabled) {
      background: rgba(196, 43, 28, 1);
      &:hover {
        background: rgba(196, 43, 28, 0.9);
      }
      &:active {
        background: rgba(196, 43, 28, 0.8);
      }
    }
  }

  &.success {
    &:not(.disabled) {
      background: rgba(15, 123, 15, 1);
      &:hover {
      background: rgba(15, 123, 15, 0.9);
      }
      &:active {
      background: rgba(15, 123, 15, 0.8);
      }
    }
  }

  &.caution {
    &:not(.disabled) {
      background: rgba(157, 93, 0, 1);
      &:hover {
      background: rgba(157, 93, 0, 0.9);
      }
      &:active {
      background: rgba(157, 93, 0, 0.8);
      }
    }
  }

  &.disabled {
    cursor: not-allowed;
    border-color: transparent;
    background: rgba(0, 0, 0, 0.2169);
  }
}
</style>
