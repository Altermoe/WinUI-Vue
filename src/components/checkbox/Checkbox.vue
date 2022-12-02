<script lang="ts" setup>
type CheckboxValue = string | number

interface CheckboxOption {
  label?: string
  value: CheckboxValue
}

const props = defineProps<{
  checked?: boolean
  disabled?: boolean
  option: CheckboxOption
}>()
</script>

<template>
  <div v-bind="$attrs" class="win-checkbox__option" :class="{ checked, disabled }">
    <div class="win-checkbox__marker" />
    <div>{{ option.label }}</div>
  </div>
</template>

<style lang="scss" scoped>
.win-checkbox__option {
  --cursor: pointer;
  --marker-bg-color: rgba(0, 0, 0, 0.0241);
  --marker-border-color: rgba(0, 0, 0, 0.4458);

  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  gap: 4px;

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
