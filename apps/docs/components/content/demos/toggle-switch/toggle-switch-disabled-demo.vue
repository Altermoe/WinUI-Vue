<script setup lang="ts">
import { FluereToggleSwitch } from '@fluere-vue/ui'
import { ref } from 'vue'

const offDisabled = ref(false)
const onDisabled = ref(true)
</script>

<template>
  <div class="flex flex-col items-start gap-fluent-l">
    <FluereToggleSwitch
      v-model="offDisabled"
      disabled
    >
      未开启（禁用）
    </FluereToggleSwitch>
    <FluereToggleSwitch
      v-model="onDisabled"
      disabled
    >
      已开启（禁用）
    </FluereToggleSwitch>
  </div>
</template>
