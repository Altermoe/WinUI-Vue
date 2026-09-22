<script setup lang="ts">
import { FluereScrollView } from '@fluere-vue/ui'

/* 演示常量（避免 lint no-magic-numbers） */
const BOTH_DIRECTION_ITEM_COUNT = 30
</script>

<template>
  <div class="h-72">
    <FluereScrollView
      class="h-full"
      content-orientation="both"
    >
      <div class="grid grid-cols-6 gap-fluent-m p-fluent-l">
        <div
          v-for="index in BOTH_DIRECTION_ITEM_COUNT"
          :key="index"
          class="h-28 rounded-fluent-md border border-colorNeutralStroke2 bg-colorNeutralBackground2 flex items-center justify-center text-colorNeutralForeground3"
        >
          {{ index }}
        </div>
      </div>
    </FluereScrollView>
  </div>
</template>
