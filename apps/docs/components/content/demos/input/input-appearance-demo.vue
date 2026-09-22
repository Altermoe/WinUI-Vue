<script setup lang="ts">
import { FluereInput } from '@fluere-vue/ui'
</script>

<template>
  <div class="flex flex-col gap-fluent-l max-w-sm">
    <FluereInput
      appearance="outline"
      placeholder="Outline（默认）"
    />
    <FluereInput
      appearance="underline"
      placeholder="Underline（下划线）"
    />
  </div>
</template>
