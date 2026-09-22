<script setup lang="ts">
import { FluereCheckbox } from '@fluere-vue/ui'
import { ref } from 'vue'

const agree = ref(false)
const subscribe = ref(true)
</script>

<template>
  <div class="flex flex-col gap-fluent-l max-w-sm">
    <FluereCheckbox v-model="agree"> 同意服务条款 </FluereCheckbox>
    <FluereCheckbox v-model="subscribe"> 订阅产品更新 </FluereCheckbox>
    <p class="text-sm text-colorNeutralForeground3">同意：{{ agree }} · 订阅：{{ subscribe }}</p>
  </div>
</template>
