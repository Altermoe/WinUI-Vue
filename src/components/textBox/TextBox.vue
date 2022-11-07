<script lang="ts" setup>
const props = withDefaults(defineProps<{
  modelValue?: string
  disabled?: boolean
  type?: 'password' | 'textarea' | 'number'
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

const inputRef = ref<HTMLInputElement | null>(null)
const { focused } = useFocus(inputRef)

const handleInput = (ev: Event) => {
  inputValue.value = (ev.target as HTMLInputElement).value
}
</script>

<template>
  <div
    v-bind="$attrs"
    class="win-textbox"
    :class="{
      focused,
      password: type === 'password',
    }"
  >
    <input
      ref="inputRef"
      :class="{ disabled }"
      class="win-textbox__input" :value="inputValue" :disabled="disabled" @input="handleInput"
    >

    <div v-if="!disabled && type === 'password'" class="win-textbox__pwd-show-toggle">
      
    </div>
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
  --border-color: rgba(0, 0, 0, 0.06) rgba(0, 0, 0, 0.06) rgba(0, 0, 0, 0.16);
  --bg-color: initial;
  --text-width: 180px;
  --text-height: 30px;
  --text-padding: 4px 11px;
  --text-color: #000;
  --cursor: normal;

  position: relative;
  overflow: hidden;

  &.focused::before {
    content: '';
    pointer-events: none;
    position: absolute;
    width: 100%;
    height: 4px;
    bottom: 0;
    left: 0;
    border-bottom: 2px solid #005FB8;
    border-bottom-left-radius: 4px;
    border-bottom-right-radius: 4px;
    animation: expand-center forwards;
    animation-duration: 187ms;
  }

  &.password {
    --text-padding: 4px 31px 4px 11px;
  }
}

.win-textbox__input {
  width: var(--text-width);
  height: var(--text-height);
  padding: var(--text-padding);
  border: 1px solid;
  border-color: var(--border-color);
  border-radius: 4px;
  font-size: 14px;
  transition-property: background-color;
  transition-duration: 187ms;
  transition-timing-function: ease;
  background-color: var(--bg-color);
  cursor: var(--cursor, text);
  color: var(--text-color);
  font-size: 14px;
  outline: none;

  &:not(.disabled) {
    &:hover {
      --bg-color: #F9F9F9;
    }

    &:focus {
      --bg-color: initial;
      --border-color: rgba(0, 0, 0, 0.2);
    }
  }

  &.disabled {
    --cursor: not-allowed;
    --border-color: rgba(0, 0, 0, 0.06);
    --bg-color: rgba(249, 249, 249, 0.3);
    --text-color: rgba(0, 0, 0, 0.3614);
  }
}

.win-textbox__pwd-show-toggle {
  position: absolute;
  cursor: pointer;
  height: 100%;
  border-radius: 4px;
  right: 3px;
  top: 0;
  font-family: 'Segoe-UI', sans-serif;
  font-size: 16px;
  clip-path: inset(3px 0 round 4px);
  padding: 3px 5px;
  user-select: none;

  &:hover {
    background: rgba(0, 0, 0, 0.0373);
  }

  &:active {
    background: rgba(0, 0, 0, 0.06);
  }
}
</style>
