<script setup lang="ts">
import { FluereButton, FluereSlider } from '@fluere-vue/ui'
import { ref } from 'vue'

/** 演示用的初始增益 */
const INITIAL_GAIN = 70

const gain = ref(INITIAL_GAIN)
const submitted = ref('')

const onSubmit = (event: Event) => {
  const data = new FormData(event.target as HTMLFormElement)
  submitted.value = String(data.get('gain') ?? '')
}
</script>

<template>
  <form
    class="flex flex-col gap-fluent-l max-w-sm"
    @submit.prevent="onSubmit"
  >
    <FluereSlider
      v-model="gain"
      name="gain"
      header="增益"
    />
    <div class="flex items-center gap-fluent-m">
      <FluereButton
        type="submit"
        appearance="primary"
      >
        提交
      </FluereButton>
      <span class="text-sm text-colorNeutralForeground3">
        提交到的 gain：{{ submitted || '—' }}
      </span>
    </div>
  </form>
</template>
