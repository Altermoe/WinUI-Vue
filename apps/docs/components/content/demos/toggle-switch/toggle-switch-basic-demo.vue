<script setup lang="ts">
import { FluereToggleSwitch } from '@fluere-vue/ui'
import { ref } from 'vue'

const wifi = ref(true)
const bluetooth = ref(false)
const vpn = ref(true)
</script>

<template>
  <div class="flex flex-col gap-fluent-l max-w-sm">
    <FluereToggleSwitch v-model="wifi"> Wi-Fi </FluereToggleSwitch>
    <FluereToggleSwitch v-model="bluetooth"> 蓝牙 </FluereToggleSwitch>
    <FluereToggleSwitch v-model="vpn"> VPN </FluereToggleSwitch>
    <p class="text-sm text-colorNeutralForeground3">
      Wi-Fi：{{ wifi }} · 蓝牙：{{ bluetooth }} · VPN：{{ vpn }}
    </p>
  </div>
</template>
