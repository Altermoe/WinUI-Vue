<script setup lang="ts">
import { FluereScrollView } from '@fluere-vue/ui'
import { ref } from 'vue'

/* 演示常量（避免 lint no-magic-numbers） */
const BAR_ROW_COUNT = 12
const EVENT_LOG_MAX = 5
const EVENT_LOG_START = 0

/* 事件计数 */
const eventLog = ref<string[]>([])
const logEvent = (tag: string): void => {
  eventLog.value = [tag, ...eventLog.value].slice(EVENT_LOG_START, EVENT_LOG_MAX)
}
</script>

<template>
  <div>
    <div class="h-40">
      <FluereScrollView
        class="h-full"
        @view-changed="logEvent('view-changed')"
        @state-changed="logEvent(`state → ${$event}`)"
        @scroll-completed="logEvent(`scroll-completed #${$event.correlationId}`)"
      >
        <div class="space-y-fluent-s p-fluent-m">
          <div
            v-for="index in BAR_ROW_COUNT"
            :key="index"
            class="h-8 rounded-fluent-md bg-colorNeutralBackground2 border border-colorNeutralStroke2"
          />
        </div>
      </FluereScrollView>
    </div>
    <ul class="mt-fluent-m space-y-fluent-xs">
      <li
        v-for="(line, index) in eventLog"
        :key="index"
        class="text-xs font-mono text-colorNeutralForeground3"
      >
        {{ line }}
      </li>
    </ul>
  </div>
</template>
