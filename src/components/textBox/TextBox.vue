<script lang="ts" setup>
defineProps<{
  modelValue?: string
}>()

defineEmits<{
  (e: 'update:modelValue', v: string): void
}>()

const inputRef = ref<HTMLElement | null>(null)
const { focused } = useFocus(inputRef)
</script>

<template>
  <div class="win-textbox" :class="{ focused }" tabindex="0">
    <input ref="inputRef" class="win-textbox__input">
  </div>
</template>

<style lang="scss" scoped>
@keyframes expand-center {
  from {
    clip-path: inset(50% 50% 0 50%);
  }
  to {
    clip-path: inset(50% 0 0 0);
  }
}

.win-textbox {
  padding: 4px 11px;
  border: 1px solid transparent;
  border-radius: 4px;
  font-size: 14px;
  position: relative;
  transition-property: background-color;
  transition-duration: 177ms;
  transition-timing-function: ease;

  &:not(.disabled) {
    border-color: rgba(0, 0, 0, 0.06);
    border-bottom-color: rgba(0, 0, 0, 0.45);

    &:hover {
      background-color: #F9F9F9;
    }

    &.focused {
      background-color: initial;
    border-color: rgba(0, 0, 0, 0.2);

      &::after {
        content: '';
        position: absolute;
        width: calc(100% + 2px);
        height: 4px;
        bottom: -1px;
        left: -1px;
        border-bottom: 2px solid #005FB8;
        border-bottom-left-radius: 4px;
        border-bottom-right-radius: 4px;
        animation: expand-center forwards;
        animation-duration: 177ms;
      }
    }
  }

  .win-textbox__input {
    background-color: transparent;
    border-radius: 4px;
    outline: none;
  }
}
</style>
