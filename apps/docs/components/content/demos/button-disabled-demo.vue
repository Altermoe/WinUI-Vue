<script setup lang="ts">
import { FluereButton } from '@fluere-vue/ui'
</script>

<template>
  <div class="flex gap-fluent-m flex-wrap">
    <FluereButton
      appearance="primary"
      disabled
      >Primary</FluereButton
    >
    <FluereButton
      appearance="secondary"
      disabled
      >Secondary</FluereButton
    >
    <FluereButton
      appearance="outline"
      disabled
      >Outline</FluereButton
    >
    <FluereButton
      appearance="subtle"
      disabled
      >Subtle</FluereButton
    >
    <FluereButton
      appearance="transparent"
      disabled
      >Transparent</FluereButton
    >
  </div>
</template>
