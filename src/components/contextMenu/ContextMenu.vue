<script lang="ts" setup>
import { set } from 'lodash'
import type { ContextMenuItem } from '.'

const props = withDefaults(defineProps<{
  items?: ContextMenuItem[]
  visible: boolean
}>(), {
  items: () => [],
})

const emits = defineEmits<{
  (e: 'update:visible', v: boolean): void
  (e: 'itemClick', v: any, ev: MouseEvent): void
}>()

const internalVisible = computed({
  get: () => props.visible,
  set: v => emits('update:visible', v),
})

const initItemMap = (items: ContextMenuItem[], itemMap: Record<ContextMenuItem['key'], any> = {}, parents: ContextMenuItem['key'][] = []) => {
  items.forEach((item) => {
    set(itemMap, [...parents, item.key], item)
  })
  return itemMap
}

const itemMap = computed(() => initItemMap(props.items))

const test = (ev: MouseEvent) => {
  const path = ev.composedPath()
  const item = path.find((ele) => {
    return (ele as HTMLElement).dataset?.contextkey
  })
  if (!item)
    return
  const key = (item as HTMLElement).dataset?.contextkey
  if (!key)
    return
  internalVisible.value = false
  emits('itemClick', itemMap.value[key], ev)
}
</script>

<template>
  <div v-if="internalVisible" class="win-contextmenu" v-bind="$attrs" @click="test">
    <div class="win-contextmenu-group">
      <div v-for="item in items" :key="item.key" :data-contextkey="item.key" class="win-contextmenu-item">
        <div class="win-contextmenu-item-wrapper">
          {{ item.title }}
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.win-contextmenu {
  padding: 1px;
  display: flex;
  flex-direction: column;
  background: rgba(252, 252, 252, 0.85);
  filter: drop-shadow(0px 8px 16px rgba(0, 0, 0, 0.14));
  backdrop-filter: blur(30px);
  border: 1px solid rgba(0, 0, 0, 0.0578);
  border-radius: 8px;
}

.win-contextmenu-group {
  &:not(:first-of-type) {
    padding-top: 2px;
  }
  &:not(:last-of-type) {
    padding-bottom: 2px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.0803);
  }
}

.win-contextmenu-item {
  padding: 3px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  line-height: 20px;

  &:hover {
    .win-contextmenu-item-wrapper {
      background: rgba(0, 0, 0, 0.0373);
    }
  }

  .win-contextmenu-item-wrapper {
    padding: 6px 11px 8px;
    border-radius: 4px;
  }
}
</style>
