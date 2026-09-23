<script setup lang="ts">
import { FluereToggleSwitch } from '@fluere-vue/ui'
import { ref } from 'vue'

const notify = ref(false)
const promo = ref(true)
</script>

<template>
  <div class="flex flex-col items-start gap-fluent-l max-w-sm">
    <FluereToggleSwitch v-model="notify">
      <template #header> 系统通知 </template>
      <template #off-content> 关 </template>
      <template #on-content> 开 </template>
      接收桌面通知
    </FluereToggleSwitch>

    <FluereToggleSwitch v-model="promo">
      <template #header> 推广与活动 </template>
      <template #off-content> Off </template>
      <template #on-content> On </template>
      允许推送产品更新
    </FluereToggleSwitch>
  </div>
</template>
