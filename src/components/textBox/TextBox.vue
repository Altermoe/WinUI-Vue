<script lang="ts" setup>
const props = withDefaults(defineProps<{
  modelValue?: string
  disabled?: boolean
  clearable?: boolean
  type?: 'password' | 'textarea' | 'number'
  readonly?: boolean
  placeholder?: string
}>(), {
  modelValue: undefined,
  disabled: false,
  clearable: false,
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

const ctrlVisible = computed(() => !props.readonly && !props.disabled && inputValue.value.length)
const clearVisible = computed(() => ctrlVisible.value && props.clearable)
const isPassword = computed(() => props.type === 'password')

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
      focused: focused && !readonly,
      password: isPassword,
      clear: clearVisible,
    }"
  >
    <input
      ref="inputRef"
      type="text"
      class="win-textbox__input"
      :class="{
        disabled,
      }"
      :disabled="disabled"
      :readOnly="readonly"
      :placeholder="placeholder"
      :value="inputValue"
      @input="handleInput"
    >

    <div v-if="clearVisible" class="win-textbox__ctrl_icon clear" @click="inputValue = ''">
      
    </div>

    <div v-if="ctrlVisible && isPassword" class="win-textbox__ctrl_icon">
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
  --input-border-color: rgba(0, 0, 0, 0.06) rgba(0, 0, 0, 0.06) rgba(0, 0, 0, 0.16);
  --input-bg-color: rgb(251, 251, 253);
  --input-text-color: rgba(0, 0, 0, 0.61);
  --input-width: 180px;
  --input-height: 30px;
  --input-padding: 4px 11px;
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
    --input-padding: 4px 31px 4px 11px;
  }

  &.clear {
    --input-padding: 4px 31px 4px 11px;
  }
}

.win-textbox__input {
  width: var(--input-width);
  height: var(--input-height);
  padding: var(--input-padding);
  border: 1px solid;
  border-color: var(--input-border-color);
  border-radius: 4px;
  font-size: 14px;
  transition-property: background-color;
  transition-duration: 187ms;
  transition-timing-function: ease;
  background-color: var(--input-bg-color);
  cursor: var(--cursor, text);
  color: var(--input-text-color);
  font-size: 14px;
  outline: none;

  &::placeholder {
    transition: all ease 187ms;
  }

  &:not(.disabled) {
    &:hover {
      --input-bg-color: rgb(246, 246, 246);
    }
    &:hover::placeholder {
      color: rgb(95, 95, 95);
    }

    &:focus {
      --input-bg-color: rgb(255, 255, 255);
      --input-border-color: rgba(0, 0, 0, 0.2);
    }
    &:focus::placeholder {
      color: rgb(141, 141, 141);
    }
  }

  &.disabled {
    --cursor: not-allowed;
    --input-border-color: rgba(0, 0, 0, 0.06);
    --input-bg-color: rgba(249, 249, 249, 0.3);
    --input-text-color: rgba(0, 0, 0, 0.3614);
  }
}

.win-textbox__ctrl_icon {
  position: absolute;
  cursor: pointer;
  height: 100%;
  right: 3px;
  top: 0;
  font-family: 'Segoe-UI', sans-serif;
  font-size: 12px;
  clip-path: inset(3px 0 round 4px);
  padding: 3px 5px;
  user-select: none;
  color: rgba(0, 0, 0, 0.61);
  display: flex;
  align-items: center;
  justify-content: center;

  &.clear {
    padding: 4px 5px 3px 6px;
  }

  &:hover {
    background: rgba(0, 0, 0, 0.0373);
  }

  &:active {
    background: rgba(0, 0, 0, 0.06);
    color: rgba(0, 0, 0, 0.45);
  }
}
</style>
