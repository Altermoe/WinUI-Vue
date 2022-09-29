<script lang="ts" setup>
withDefaults(defineProps<{
  type?: 'accent' | 'standard'
  disabled?: boolean
  nofocus?: boolean
}>(), {
  type: 'standard',
  disabled: false,
  nofocus: false,
})

const emits = defineEmits<{
  (e: 'click', ev: MouseEvent): void
}>()

const handleClick = (ev: MouseEvent) => {

}
</script>

<template>
  <button
    v-bind="$attrs"
    type="button"
    class="win-button"
    :disabled="disabled"
    :aria-disabled="disabled"
    :class="{
      accent: type === 'accent',
      standard: type === 'standard',
      disabled,
      nofocus,
    }"
  >
    <slot />
  </button>
</template>

<style lang="scss" scoped>
.win-button {
  cursor: pointer;
  display: flex;
  border: 1px solid;
  justify-content: center;
  align-items: center;
  padding: 5px 12px 7px;
  border-radius: 4px;
  height: 32px;
  outline: none;
  font-size: 14px;
  line-height: 20px;
  text-align: center;
  font-weight: 400;

  &:focus {
    outline: 2px solid #000;
    outline-offset: 1px;
  }

  &.accent {
    color: rgba(255, 255, 255, 1);
    background: rgb(0, 95, 184);
    border-color: rgba(255, 255, 255, 0.08);
    border-bottom-color: rgba(0, 0, 0, 0.4);

    &:hover {
      background: rgba(0, 95, 184, 0.9);
    }

    &:active {
      color: rgba(255, 255, 255, 0.7);
      background: rgba(0, 95, 184, 0.8);
      border-bottom-color: rgba(255, 255, 255, 0.08);
    }

    &.disabled {
      background: rgba(0, 0, 0, 0.2169);
      border-color: transparent;
    }
  }

  &.standard {
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

    &.disabled {
      color: rgba(0, 0, 0, 0.3614);
      background: rgba(249, 249, 249, 0.3);
      border-bottom-color: rgba(0, 0, 0, 0.06);
    }
  }

  &.disabled {
    cursor: not-allowed;
  }

  &.nofocus {
    outline: none;
  }
}
</style>
