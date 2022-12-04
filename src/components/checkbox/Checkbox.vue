<script lang="ts" setup>
const props = withDefaults(defineProps<{
  modelValue?: boolean
  disabled?: boolean
  indeterminate?: boolean
  label?: string
}>(), {
  modelValue: undefined,
})

const emits = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
}>()

const cache = ref<boolean>(false)

const internalBind = computed({
  get: () => props.modelValue === undefined ? cache.value : props.modelValue,
  set: (v) => {
    if (props.modelValue === undefined) {
      cache.value = v
      return
    }
    emits('update:modelValue', v)
  },
})

const toggleValue = () => {
  if (props.disabled)
    return
  internalBind.value = !internalBind.value
}
</script>

<template>
  <div
    v-bind="$attrs"
    class="win-checkbox__option"
    :class="{ checked: internalBind, disabled, indeterminate }"
    @click="toggleValue"
  >
    <div class="win-checkbox__marker win-icon" />
    <div>{{ label }}</div>
  </div>
</template>

<style lang="scss" scoped>
.win-checkbox__option {
  --cursor: pointer;
  --color: rgba(0, 0, 0, 0.3614);
  --marker-text: '';
  --marker-bg-color: rgba(0, 0, 0, 0.0241);
  --marker-font-color: transparent;
  --marker-border-color: rgba(0, 0, 0, 0.4458);

  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  gap: 8px;
  cursor: var(--cursor);

  &.indeterminate {
    --marker-text: '';
  }

  &.disabled {
    --cursor: not-allowed;
    --marker-bg-color: transparent;
    &.checked {
      --marker-bg-color: rgba(0, 0, 0, 0.2169);
      --marker-border-color: transparent;
      --marker-font-color: #FFF;
    }
  }

  &:not(.disabled) {
    &:hover {
      --marker-bg-color: rgba(0, 0, 0, 0.0578);
    }

    &.checked {
      --marker-bg-color: #005FB8;
      --marker-border-color: transparent;
      --marker-font-color: #FFF;
    }

    &:not(.checked):active {
      --marker-bg-color: rgba(0, 0, 0, 0.0924);
      --marker-border-color: rgba(0, 0, 0, 0.2169);
      --marker-font-color: rgba(255, 255, 255, 0.7);
    }

    &.checked:active {
      --marker-bg-color: rgba(0, 95, 184, 0.8);
    }
  }
}

.win-checkbox__marker {
  width: 20px;
  height: 20px;
  border: 1px solid var(--marker-border-color);
  border-radius: 4px;
  background-color: var(--marker-bg-color);
  position: relative;
  color: var(--marker-font-color);

  &::before {
    content: var(--marker-text);
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    font-size: 12px;
    line-height: 14px;
    display: grid;
    place-items: center;
  }
}
</style>
