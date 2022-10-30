<script lang="ts" setup>
interface CardProps {
  title?: string
  bordered?: boolean
}
withDefaults(defineProps<CardProps>(), {
  title: '',
  bordered: true,
})

const ctx = getCurrentInstance()
</script>

<template>
  <div class="win-card" :class="{ bordered }">
    <div v-if="title" class="win-card-title">
      <slot name="title">
        {{ title }}
      </slot>
    </div>

    <div class="win-card-main">
      <slot name="default" />
    </div>

    <div v-if="ctx?.slots.footer" class="win-card-main">
      <slot name="footer" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.win-card {
  --card-padding: 1rem;
  --card-bg-color: #fff;
  --card-border-color: #E2E5EA;

  display: flex;
  flex-direction: column;
  background: var(--card-bg-color);

  &.bordered {
    border: 1px solid var(--card-border-color);
    border-radius: 8px;
  }
}

.win-card-title {
  padding: var(--card-padding) var(--card-padding) 0;
}

.win-card-main {
  padding: var(--card-padding);
}

.win-card-footer {
  padding: 0 var(--card-padding) var(--card-padding);
}
</style>
