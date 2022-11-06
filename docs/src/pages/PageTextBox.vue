<script lang="ts" setup>
import { AppPage } from '../components'
import { Card, TextBox } from '@/components'

const text = ref('')
</script>

<template>
  <AppPage>
    <Card title="基础">
      <div class="flex flex-col flex-wrap items-start gap-2">
        <TextBox v-model="text" />
      </div>
    </Card>

    <Card title="禁用">
      <div class="flex flex-col flex-wrap items-start gap-2">
        <TextBox model-value="disabled" disabled />
      </div>
    </Card>

    <Card title="密码">
      <div class="flex flex-col flex-wrap items-start gap-2">
        <TextBox v-model="text" type="password" />
      </div>
    </Card>
  </AppPage>
</template>
