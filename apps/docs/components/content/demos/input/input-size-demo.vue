<script setup lang="ts">
import { FluereInput } from '@fluere-vue/ui'
</script>

<template>
  <div class="flex flex-col gap-fluent-l max-w-sm">
    <FluereInput
      size="small"
      placeholder="Small (24px)"
    />
    <FluereInput
      size="medium"
      placeholder="Medium (32px)"
    />
    <FluereInput
      size="large"
      placeholder="Large (40px)"
    />
  </div>
</template>
