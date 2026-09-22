<script setup lang="ts">
import {
  FluentIconAdd20Filled,
  FluentIconCheckmarkCircle24Filled,
  FluentIconDelete24Regular,
  FluentIconSearch20Regular,
  FluentIconSettings24Regular,
} from '@fluere-vue/icons'
import { FluereButton } from '@fluere-vue/ui'
</script>

<template>
  <div class="flex gap-fluent-l items-center flex-wrap text-colorNeutralForeground1">
    <FluentIconAdd20Filled />
    <FluentIconSearch20Regular />
    <FluentIconSettings24Regular />
    <FluentIconDelete24Regular />
    <FluentIconCheckmarkCircle24Filled />
    <FluereButton
      appearance="primary"
      :icon="FluentIconAdd20Filled"
    >
      Add
    </FluereButton>
  </div>
</template>
