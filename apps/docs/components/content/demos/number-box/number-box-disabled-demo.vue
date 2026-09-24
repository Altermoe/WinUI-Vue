<script setup lang="ts">
import { FluereNumberBox } from '@fluere-vue/ui'
</script>

<template>
  <div class="flex flex-col gap-fluent-l max-w-sm">
    <FluereNumberBox
      :model-value="35"
      :min="0"
      :max="100"
      disabled
      spin-button-placement-mode="inline"
      header="禁用（含增减按钮）"
    />
    <FluereNumberBox
      :model-value="null"
      disabled
      header="禁用（无值）"
      placeholder="不可编辑"
    />
    <p class="text-sm text-colorNeutralForeground3">
      禁用时输入框落到 TextControl…Disabled 档，增减按钮移到
      …ForegroundDisabled；标题与说明同时变灰。
    </p>
  </div>
</template>
