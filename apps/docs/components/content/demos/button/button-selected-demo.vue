<script setup lang="ts">
import { FluereButton } from '@fluere-vue/ui'
</script>

<template>
  <div class="flex gap-fluent-m flex-wrap">
    <FluereButton
      appearance="primary"
      selected
      >Primary</FluereButton
    >
    <FluereButton
      appearance="secondary"
      selected
      >Secondary</FluereButton
    >
    <FluereButton
      appearance="outline"
      selected
      >Outline</FluereButton
    >
    <FluereButton
      appearance="subtle"
      selected
      >Subtle</FluereButton
    >
    <FluereButton
      appearance="transparent"
      selected
      >Transparent</FluereButton
    >
  </div>
</template>
