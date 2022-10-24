<script lang="ts" setup>
interface NavmenuItem {
  title: string
  value: string | number | symbol
  disabled?: boolean
}

const props = defineProps<{
  modelValue: NavmenuItem['value']
  items: NavmenuItem[]
  icon?: boolean
}>()

const emits = defineEmits<{
  (e: 'update:modelValue', v: NavmenuItem['value']): void
}>()

const activeValue = computed({
  get: () => props.modelValue,
  set: (v) => {
    emits('update:modelValue', v)
  },
})
</script>

<template>
  <div class="win-navmenu" v-bind="$attrs">
    <div
      v-for="item in items" :key="item.value"
      class="win-navmenu-item"
      :class="{
        active: item.value === activeValue,
        disabled: item.disabled,
      }"
      @click="activeValue = item.value"
    >
      <div class="win-navmenu-item-wrapper">
        <div v-if="icon" class="icon">
          
        </div>
        <div class="content">
          {{ item.title }}
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.win-navmenu {
  --item-border-color: transparent;
  --item-bg: transparent;
  --item-color: rgba(0, 0, 0, 0.9);
  --item-cursor: pointer;
  --item-marker: transparent;

  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  background: #EFF4F9;
}

.win-navmenu-item {
  padding: 2px 4px;
  cursor: var(--item-cursor);
  color: var(--item-color);

  &.disabled {
    --item-cursor: not-allowed;
    --item-color: rgba(0, 0, 0, 0.36);
    &.active {
      --item-bg: rgba(0, 0, 0, 0.0373);
      --item-marker: rgba(0, 0, 0, 0.2169);
    }
  }

  &:not(.disabled) {
    &:hover {
      --item-bg: rgba(0, 0, 0, 0.0373);
    }
    &:active {
      --item-bg: rgba(0, 0, 0, 0.0241);
      --item-color: rgba(0, 0, 0, 0.61);
    }
    &.active {
      --item-bg: rgba(0, 0, 0, 0.0373);
      --item-marker: rgba(0, 95, 184, 1);
    }
  }
}

.win-navmenu-item-wrapper {
  display: flex;
  position: relative;
  height: 36px;
  line-height: 16px;
  display: flex;
  gap: 1em;
  align-items: center;
  padding: 9px 11px;
  border-radius: 4px;
  border: 1px solid var(--item-border-color);
  background: var(--item-bg);
  box-sizing: border-box;
  font-size: 16px;

  &::before {
    content: '';
    pointer-events: none;
    position: absolute;
    left: -1px;
    top: 9px;
    bottom: 9px;
    width: 3px;
    border-radius: 3px;
    background: var(--item-marker);
  }

  .icon {
    font-family: 'Segoe-UI', sans-serif;
    font-size: 16px;
    font-weight: bold;
  }
  .content {
    height: 20px;
    line-height: 20px;
  }
}
</style>
