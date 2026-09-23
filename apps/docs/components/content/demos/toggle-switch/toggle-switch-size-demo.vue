<script setup lang="ts">
import { FluereToggleSwitch } from '@fluere-vue/ui'
import { ref } from 'vue'

const small = ref(true)
const medium = ref(true)
const large = ref(false)
</script>

<template>
  <div class="flex flex-col items-start gap-fluent-l">
    <FluereToggleSwitch
      v-model="small"
      size="small"
    >
      small（32×16）
    </FluereToggleSwitch>
    <FluereToggleSwitch
      v-model="medium"
      size="medium"
    >
      medium（40×20 · WinUI 标准）
    </FluereToggleSwitch>
    <FluereToggleSwitch
      v-model="large"
      size="large"
    >
      large（48×24）
    </FluereToggleSwitch>
  </div>
</template>
