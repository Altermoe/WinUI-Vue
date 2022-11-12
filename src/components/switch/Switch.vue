<script lang="ts" setup>
const props = defineProps<{
  modelValue?: boolean
  disabled?: boolean
}>()

const emits = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
}>()

const positive = computed({
  get: () => Boolean(props.modelValue),
  set: v => emits('update:modelValue', v),
})

const toggleSwitch = () => {
  if (props.disabled)
    return
  positive.value = !positive.value
}
</script>

<template>
  <div
    class="win-switch"
    :class="{
      disabled,
      positive,
    }"
    @click="toggleSwitch"
  >
    <div class="win-switch__control">
      <div class="win-switch__thumb" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.win-switch {
  --ctrl-width: 40px;
  --ctrl-height: 20px;
  --ctrl-color: rgba(0, 0, 0, 0.4458);
  --ctrl-bg-color: rgba(0, 0, 0, 0.0241);
  --ctrl-thumb-color: rgba(0, 0, 0, 0.6063);
  --ctrl-thumb-cut: inset(4px 6px 4px 4px round var(--ctrl-height));
  --ctrl-thumb-pos: 0;
  --transition-duration: 176ms;

  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: center;

  &:hover{
    --ctrl-bg-color: rgba(0, 0, 0, 0.0578);
    --ctrl-thumb-cut: inset(3px 5px 3px 3px round var(--ctrl-height));
  }

  &:active {
    --ctrl-thumb-cut: inset(3px round var(--ctrl-height));
  }

  &.positive {
    --ctrl-thumb-pos: var(--ctrl-height);
    --ctrl-bg-color: rgba(0, 95, 184, 1);
    --ctrl-thumb-color: #fff;
    &:active {
      --ctrl-thumb-pos: calc(var(--ctrl-height) - 2px);
    }
  }
}

.win-switch__control {
  width: var(--ctrl-width);
  height: var(--ctrl-height);
  border: 1px solid var(--ctrl-color);
  background-color: var(--ctrl-bg-color);
  border-radius: var(--ctrl-height);
  transition: all ease var(--transition-duration);
  position: relative;
}

.win-switch__thumb {
  background: var(--ctrl-thumb-color);
  width: calc(var(--ctrl-height) + 2px);
  height: var(--ctrl-height);
  border-radius: var(--ctrl-height);
  transition: all ease var(--transition-duration);
  position: absolute;
  top: -1px;
  left: -1px;
  transform: translateX(var(--ctrl-thumb-pos));
  clip-path: var(--ctrl-thumb-cut);
}
</style>
