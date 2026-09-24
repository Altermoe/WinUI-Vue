<script setup lang="ts">
import type { FluereComboboxItem } from '@fluere-vue/ui'
import { FluereButton, FluereCombobox } from '@fluere-vue/ui'
import { ref } from 'vue'

const SHIPPING: FluereComboboxItem<string>[] = [
  { value: 'standard', text: '标准配送（3-5 天）' },
  { value: 'express', text: '次日达' },
  { value: 'pickup', text: '自提点自取' },
]

const shipping = ref<string | null>('standard')
const submitted = ref('')

const onSubmit = (): void => {
  submitted.value = `提交的配送方式：${shipping.value ?? '（空）'}`
}
</script>

<template>
  <form
    class="flex flex-col gap-fluent-l max-w-xs"
    @submit.prevent="onSubmit"
  >
    <FluereCombobox
      v-model="shipping"
      :items="SHIPPING"
      name="shipping"
      header="配送方式"
    />
    <FluereButton
      type="submit"
      appearance="primary"
    >
      提交
    </FluereButton>
    <p
      v-if="submitted"
      class="text-sm text-colorNeutralForeground3"
    >
      {{ submitted }}
    </p>
  </form>
</template>
