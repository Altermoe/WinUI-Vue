<script setup lang="ts">
import { FluereRadioButton, FluereRadioGroup } from '@fluere-vue/ui'
import { ref } from 'vue'

const plan = ref('free')
const network = ref('5g')
</script>

<template>
  <div class="flex flex-col gap-fluent-l max-w-sm">
    <!-- 整组禁用 -->
    <div class="flex flex-col gap-fluent-s">
      <p class="text-sm text-colorNeutralForeground2">整组禁用</p>
      <FluereRadioGroup
        v-model="plan"
        disabled
      >
        <FluereRadioButton value="free">免费版</FluereRadioButton>
        <FluereRadioButton value="pro">专业版</FluereRadioButton>
      </FluereRadioGroup>
    </div>
    <!-- 单个禁用：组可用，仅某一项不可选 -->
    <div class="flex flex-col gap-fluent-s">
      <p class="text-sm text-colorNeutralForeground2">单选项禁用</p>
      <FluereRadioGroup v-model="network">
        <FluereRadioButton value="wifi">Wi-Fi</FluereRadioButton>
        <FluereRadioButton value="5g">蜂窝网络（5G）</FluereRadioButton>
        <FluereRadioButton value="offline">
          飞行模式<span class="text-colorNeutralForegroundDisabled">（维护中）</span>
        </FluereRadioButton>
        <FluereRadioButton
          value="ethernet"
          disabled
        >
          以太网
        </FluereRadioButton>
      </FluereRadioGroup>
    </div>
  </div>
</template>
