<script setup lang="ts">
import { FluereInput } from '@fluere-vue/ui'
</script>

<template>
  <div class="flex flex-col gap-fluent-l max-w-sm">
    <FluereInput
      invalid
      placeholder="错误输入"
      aria-describedby="input-error-hint"
    />
    <p
      id="input-error-hint"
      class="text-sm text-colorStatusDangerForeground1"
    >
      请输入有效的内容。
    </p>
  </div>
</template>
