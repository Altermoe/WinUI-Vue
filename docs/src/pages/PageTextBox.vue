<script lang="ts" setup>
import { AppPage } from '../components'
import { Card, TextBox } from '@/components'

const text = ref('')
</script>

<template>
  <AppPage>
    <Card class="w-full overflow-hidden" title="基础">
      <div class="flex flex-col flex-wrap items-start gap-2">
        <TextBox v-model="text" />
        <div class="text-ellipsis overflow-hidden w-full text-sm">
          "{{ text }}"
        </div>
      </div>
    </Card>
  </AppPage>
</template>
