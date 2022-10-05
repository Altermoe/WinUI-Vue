<script lang="ts" setup>
import type { DropdownItem } from './types'
import { ContextMenu } from '@/components'
import { useConditionalltHandler } from '@/hooks'

const props = withDefaults(defineProps<{
  items?: DropdownItem[]
  disabled?: boolean
  modelValue?: any
}>(), {
  items: () => [],
  disabled: false,
  modelValue: '',
})

const emits = defineEmits<{
  (e: 'click', ev: MouseEvent): void
  (e: 'update:modelValue', v: any): void
}>()

const selectedItem = computed(() => props.items.find(item => item.value === props.modelValue))
const inputContent = computed(() => {
  if (!selectedItem.value)
    return props.modelValue
  return selectedItem.value.title ?? selectedItem.value.value
})

const visible = ref(false)
const { handler } = useConditionalltHandler<MouseEvent>(emits, {
  disabled: toRef(props, 'disabled'),
  preventDefault: true,
  onClick: () => (visible.value = !visible.value),
})

const internalItems = computed(() => props.items.map(({ title = '', key, value }) => ({
  title,
  key,
  value,
})))

const handleItemClick = (item: DropdownItem) => {
  emits('update:modelValue', item.value)
}
</script>

<template>
  <div class="win-dropdown">
    <div
      tabindex="0"
      class="win-dropdown-wrapper"
      :class="{
        disabled,
      }"
      @click="handler('click', $event)"
    >
      <div class="win-dropdown-input">
        {{ inputContent }}
      </div>

      <div class="win-dropdown-arrow">
        
      </div>
    </div>

    <transition name="slide-y">
      <ContextMenu
        v-model:visible="visible"
        class="win-dropdown-contextmenu"
        :items="internalItems"
        @item-click="handleItemClick"
      />
    </transition>
  </div>
</template>

<style lang="scss" scoped>
.win-dropdown {
  position: relative;
}

.win-dropdown-wrapper {
  border: 1px solid transparent;
  border-radius: 4px;
  height: 30px;
  padding: 4px 11px;
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
  display: flex;
  user-select: none;

  &:not(.disabled) {
    cursor: pointer;
    background: rgba(255, 255, 255, 0.7);
    border-color: rgba(0, 0, 0, 0.06);
    border-bottom-color: rgba(0, 0, 0, 0.16);

    &:hover {
      background: rgba(249, 249, 249, 0.5);
    }

    &:active {
      color: rgba(0, 0, 0, 0.6063);
      border-bottom-color: rgba(0, 0, 0, 0.06);
      background: rgba(249, 249, 249, 0.3);
    }

    &:focus {
      outline: 2px solid #000;
      outline-offset: 1px;
    }
  }

  &.disabled {
    cursor: not-allowed;
    color: rgba(0, 0, 0, 0.3614);
    border-color: rgba(0, 0, 0, 0.0578);
  }
}

.win-dropdown-input {
  width: 76px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  gap: 8px;
}

.win-dropdown-arrow {
  font-family: 'Segoe-UI';
}

.win-dropdown-contextmenu {
  position: absolute;
  left: -50%;
  top: calc(100% + 9px);
  width: 200%;
  height: auto;
}
</style>
