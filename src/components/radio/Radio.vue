<script lang="ts" setup>
const props = defineProps<{
  label?: string
  value: string | number
  disabled?: boolean
  checked?: boolean
}>()

const emitValue = inject('emitValue') as (v: string | number) => void

const updateValue = () => {
  if (props.disabled)
    return
  emitValue(props.value)
}
</script>

<template>
  <div class="win-radio" :class="{ disabled, checked }" @click="updateValue">
    <div class="win-radio__input" :value="value" />
    {{ label }}
  </div>
</template>

<style lang="scss" scoped>
.win-radio {
  --radio-border-color: rgba(0, 0, 0, 0.45);
  --radio-bg-color: transparent;
  --radio-marker-color: transparent;
  --radio-marker-radius: 4px;

  display: flex;
  align-items: center;
  gap: 0.5em;
  cursor: pointer;

  .disabled {
    cursor: not-allowed;
  }

  &:not(.disabled) {
    &:hover{
      --radio-marker-radius: 5px;
    }

    &:active {
      --radio-marker-color: #fff;
      --radio-marker-radius: 3px;
    }

    &:not(.checked):hover {
      --radio-bg-color: rgba(0, 0, 0, 0.0578);
      --radio-marker-radius: 3px;
    }

    &:not(.checked):active {
      --radio-border-color: rgba(0, 0, 0, 0.2169);
      --radio-bg-color: rgba(0, 0, 0, 0.0924);
    }

    &.checked {
      --radio-bg-color: rgba(0, 95, 184, 1);
      --radio-marker-color: #fff;
      --radio-border-color: transparent;
    }

    &.checked:active {
      --radio-bg-color: rgba(0, 95, 184, 0.8);
    }
  }
}

.win-radio__input {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 1px solid var(--radio-border-color);
  background: var(--radio-bg-color);
  transition: all ease 187ms;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: var(--radio-marker-color);
    clip-path: circle(var(--radio-marker-radius));
    transition: all ease 83ms;
  }

  .disabled {
    cursor: not-allowed;
  }
}
</style>
