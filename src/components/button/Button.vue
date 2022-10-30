<script lang="ts" setup>
import { useConditionalltHandler } from '@/hooks'
const props = withDefaults(defineProps<{
  type?: 'accent' | 'standard' | 'text' | 'critical' | 'success' | 'caution'
  disabled?: boolean
  outline?: boolean
  icon?: string
  rounded?: boolean
  plain?: boolean
}>(), {
  type: 'standard',
  disabled: false,
  outline: false,
  icon: undefined,
  rounded: true,
  plain: false,
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
      rounded,
      plain,
    }"
    @click="handler('click', $event)"
  >
    <span v-if="icon" class="win-icon">{{ icon }}</span>
    <slot />
  </button>
</template>

<style lang="scss" scoped>
.win-button {
  --bg-hover-opacity: 0.9;
  --bg-active-opacity: 0.8;

  cursor: pointer;
  display: flex;
  border: 1px solid transparent;
  justify-content: center;
  align-items: center;
  padding: 0px 16px;
  height: 30px;
  font-size: 14px;
  line-height: 20px;
  text-align: center;
  font-weight: 400;
  background-color: transparent;
  transition-property: background-color, color;
  transition-duration: 187ms;
  transition-timing-function: ease;

  &:hover:not(.disabled) {
    &.plain {
      color: rgba(255, 255, 255, 1);
      --bg-hover-opacity: 1;
    }
  }

  &:active:not(.disabled) {
    &.plain {
      --bg-active-opacity: 0.9;
    }
  }

  .win-icon {
    transform: scale(0.8);
    padding: 0 1px;
  }

  &.rounded {
    border-radius: 4px;
  }

  &.outline:focus {
    &:not(.disabled) {
      outline: 2px solid #000;
      outline-offset: 1px;
    }
  }

  &.text {
    &:not(.disabled) {
      &:hover {
        color: #001A68;
        background-color: rgba(0, 0, 0, 0.0373);
      }

      &:active {
        color: #005FB8;
        background-color: rgba(0, 0, 0, 0.0241);
      }
    }

    &.disabled {
      color: rgba(0, 0, 0, 0.3614);
      background-color: transparent;
    }
  }

  &.plain {
    border: none;
  }

  &:not(.text) {
    border-color: rgba(255, 255, 255, 0.08);
    border-bottom-color: rgba(0, 0, 0, 0.4);
    &:not(.plain) {
      color: rgba(255, 255, 255, 1);
    }
    &:not(.disabled):active {
      color: rgba(255, 255, 255, 0.7);
      border-bottom-color: rgba(255, 255, 255, 0.08);
    }
  }

  &.standard {
    &:not(.disabled) {
      color: rgba(0, 0, 0, 0.9);
      background-color: rgba(255, 255, 255, 0.7);
      border-color: rgba(0, 0, 0, 0.06);
      border-bottom-color: rgba(0, 0, 0, 0.16);
      &:hover {
        background-color: rgba(249, 249, 249, 0.5);
      }
      &:active {
        color: rgba(0, 0, 0, 0.5);
        background-color: rgba(249, 249, 249, 0.3);
        border-bottom-color: rgba(0, 0, 0, 0.06);
      }
    }

    &.disabled {
      color: rgba(0, 0, 0, 0.3614);
      background-color: rgba(249, 249, 249, 0.3);
      border-bottom-color: rgba(0, 0, 0, 0.06);
    }
  }

  &.accent {
    &:not(.disabled) {
      &:not(.plain) {
        background-color: rgb(0, 95, 184);
      }
      &:hover {
        background-color: rgba(0, 95, 184, var(--bg-hover-opacity));
      }
      &:active {
        background-color: rgba(0, 95, 184, var(--bg-active-opacity));
      }
    }
  }

  &.critical:not(.disabled) {
    &:not(.plain) {
      background-color: rgba(196, 43, 28, 1);
    }
    &:hover {
      background-color: rgba(196, 43, 28, var(--bg-hover-opacity));
    }
    &:active {
      background-color: rgba(196, 43, 28, var(--bg-active-opacity));
    }
  }

  &.success:not(.disabled) {
    &:not(.plain) {
      background-color: rgba(15, 123, 15, 1);
    }
    &:hover {
    background-color: rgba(15, 123, 15, var(--bg-hover-opacity));
    }
    &:active {
    background-color: rgba(15, 123, 15, var(--bg-active-opacity));
    }
  }

  &.caution:not(.disabled) {
    &:not(.plain) {
      background-color: rgba(157, 93, 0, 1);
    }
    &:hover {
    background-color: rgba(157, 93, 0, var(--bg-hover-opacity));
    }
    &:active {
    background-color: rgba(157, 93, 0, var(--bg-active-opacity));
    }
  }

  &.disabled {
    cursor: not-allowed;
    border-color: transparent;
    background-color: rgba(0, 0, 0, 0.2169);
  }
}
</style>
