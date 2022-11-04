<script lang="ts" setup>
const props = withDefaults(defineProps<{
  modelValue?: string
  disabled?: boolean
}>(), {
  modelValue: undefined,
  disabled: false,
})

const emits = defineEmits<{
  (e: 'update:modelValue', v: string): void
  (e: 'change', v: string): void
}>()

/** 当外部没有传入绑定值时使用内部状态管理 */
const internalValue = ref('')

const inputValue = computed({
  get: () => props.modelValue === undefined ? internalValue.value : props.modelValue,
  set: (v) => {
    if (props.modelValue === undefined) {
      internalValue.value = v
      emits('change', v)
      return
    }
    emits('update:modelValue', v)
  },
})

const inputRef = ref<HTMLElement | null>(null)
const { focused } = useFocus(inputRef)

const handleInput = (ev: Event) => {
  inputValue.value = (ev.target as HTMLInputElement).value
}
</script>

<template>
  <div
    class="win-textbox"
    tabindex="0"
    :class="{
      focused,
      disabled,
    }"
    @click="focused = true"
  >
    <input ref="inputRef" class="win-textbox__input" @input="handleInput">
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
  transition-duration: 187ms;
  transition-timing-function: ease;

  &:not(.disabled) {
    border-color: rgba(0, 0, 0, 0.06);
    border-bottom-color: rgba(0, 0, 0, 0.16);
    cursor: text;

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
        animation-duration: 187ms;
      }
    }
  }

  .disabled {
    cursor: not-allowed;
  }
}

.win-textbox__input {
  width: 100%;
  background-color: transparent;
  outline: none;
}
</style>