<script setup lang="ts">
import { FluereRadioButton, FluereRadioGroup } from '@fluere-vue/ui'
import { ref } from 'vue'

const color = ref('red')
</script>

<template>
  <div class="flex flex-col gap-fluent-l max-w-sm">
    <FluereRadioGroup v-model="color">
      <FluereRadioButton value="red">番茄红</FluereRadioButton>
      <FluereRadioButton value="teal">蓝绿</FluereRadioButton>
      <FluereRadioButton value="blue">星辰蓝</FluereRadioButton>
    </FluereRadioGroup>
    <p class="text-sm text-colorNeutralForeground3">当前：{{ color }}</p>
  </div>
</template>
