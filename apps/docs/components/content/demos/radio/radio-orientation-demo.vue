<script setup lang="ts">
import { FluereRadioButton, FluereRadioGroup } from '@fluere-vue/ui'
import { ref } from 'vue'

const align = ref('left')
</script>

<template>
  <div class="flex flex-col gap-fluent-l max-w-md">
    <FluereRadioGroup
      v-model="align"
      orientation="horizontal"
      class="flex-wrap"
    >
      <FluereRadioButton value="left">左对齐</FluereRadioButton>
      <FluereRadioButton value="center">居中</FluereRadioButton>
      <FluereRadioButton value="right">右对齐</FluereRadioButton>
    </FluereRadioGroup>
    <p class="text-sm text-colorNeutralForeground3">对齐：{{ align }}</p>
  </div>
</template>
