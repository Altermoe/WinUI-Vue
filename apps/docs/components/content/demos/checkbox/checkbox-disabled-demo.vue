<script setup lang="ts">
import { FluereCheckbox } from '@fluere-vue/ui'
</script>

<template>
  <div class="flex flex-col gap-fluent-l max-w-sm">
    <FluereCheckbox disabled> 未勾选（禁用） </FluereCheckbox>
    <FluereCheckbox
      disabled
      :model-value="true"
    >
      已勾选（禁用）
    </FluereCheckbox>
    <FluereCheckbox
      disabled
      :model-value="'indeterminate'"
    >
      不确定（禁用）
    </FluereCheckbox>
  </div>
</template>
