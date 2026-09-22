<script setup lang="ts">
import { FluereCheckbox } from '@fluere-vue/ui'
import { computed, ref } from 'vue'

const optionA = ref(true)
const optionB = ref(true)
const optionC = ref(false)
const optionValues = computed(() => [optionA.value, optionB.value, optionC.value])

const allState = computed<boolean | 'indeterminate'>(() => {
  if (optionValues.value.every(Boolean)) {
    return true
  }
  if (optionValues.value.some(Boolean)) {
    return 'indeterminate'
  }
  return false
})

const toggleAll = (value: boolean | 'indeterminate') => {
  const next = Boolean(value)
  optionA.value = next
  optionB.value = next
  optionC.value = next
}
</script>

<template>
  <div class="flex flex-col gap-fluent-l max-w-sm">
    <FluereCheckbox
      :model-value="allState"
      @update:model-value="toggleAll"
    >
      全选（不确定态）
    </FluereCheckbox>
    <div class="ml-fluent-l flex flex-col gap-fluent-s">
      <FluereCheckbox v-model="optionA"> 选项 A </FluereCheckbox>
      <FluereCheckbox v-model="optionB"> 选项 B </FluereCheckbox>
      <FluereCheckbox v-model="optionC"> 选项 C </FluereCheckbox>
    </div>
  </div>
</template>
