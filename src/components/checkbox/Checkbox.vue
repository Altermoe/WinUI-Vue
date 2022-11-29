<script lang="ts" setup>
type CheckboxValue = string | number

interface CheckboxOption {
  label?: string
  value: CheckboxValue
}

const props = defineProps<{
  modelValue?: CheckboxValue[]
  options?: CheckboxOption[]
}>()

const emits = defineEmits<{
  (e: 'update:modelValue', v: CheckboxValue[]): void
}>()

const cache = ref<CheckboxValue[]>([])

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
</script>

<template>
  <div class="win-checkbox checked">
    <div class="win-checkbox__marker" />
  </div>
</template>

<style lang="scss" scoped>
.win-checkbox {
  --cursor: pointer;
  --marker-bg-color: rgba(0, 0, 0, 0.0241);
  --marker-border-color: rgba(0, 0, 0, 0.4458);

  &.disabled {
    --cursor: not-allowed;
    --marker-bg-color: transparent;
  }

  &:hover {
    --marker-bg-color: rgba(0, 0, 0, 0.0578);
  }

  &:active {
    --marker-bg-color: rgba(0, 0, 0, 0.0924);
    --marker-border-color: rgba(0, 0, 0, 0.2169);
  }
}

.win-checkbox__marker {
  width: 20px;
  height: 20px;
  border: 1px solid var(--marker-border-color);
  border-radius: 4px;
  background-color: var(--marker-bg-color);
  cursor: var(--cursor);
}
</style>
