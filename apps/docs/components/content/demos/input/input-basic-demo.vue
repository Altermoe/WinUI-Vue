<script setup lang="ts">
import { FluereInput } from '@fluere-vue/ui'
import { ref } from 'vue'

const value = ref('')
</script>

<template>
  <div class="flex flex-col gap-fluent-l max-w-sm">
    <FluereInput
      v-model="value"
      placeholder="请输入内容"
    />
    <p class="text-sm text-colorNeutralForeground3">当前值：{{ value || '（空）' }}</p>
    <FluereInput
      placeholder="禁用状态"
      disabled
    />
  </div>
</template>
