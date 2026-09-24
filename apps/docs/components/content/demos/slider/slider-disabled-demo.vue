<script setup lang="ts">
import { FluereSlider } from '@fluere-vue/ui'
</script>

<template>
  <div class="flex flex-col gap-fluent-l max-w-sm">
    <FluereSlider
      :model-value="35"
      disabled
      header="禁用（可交互态已关闭）"
    />
    <FluereSlider
      :model-value="0"
      disabled
      header="禁用（最小值）"
    />
    <FluereSlider
      :model-value="100"
      disabled
      header="禁用（最大值）"
    />
    <p class="text-sm text-colorNeutralForeground3">
      禁用时轨道、数值填充、滑块与标题一起落到 …Disabled 档；滑块移到 …Disabled 尺寸（对应 WinUI
      Disabled 状态里内点放大到 14px）。
    </p>
  </div>
</template>
