<script lang="ts" setup>
import { NavMenu } from '@/components'

const items = [
  { title: '北京', value: 'beijing' },
  { title: '上海', value: 'shanghai' },
  { title: '广州', value: 'guangzhou' },
  { title: '深圳', value: 'shenzhen' },
]

const item = ref('shanghai')
</script>

<template>
  <div class="h-full flex flex-col">
    <div class="flex">
      Header
    </div>
    <div class="flex-1 flex">
      <div class="flex">
        <NavMenu v-model="item" class="w-20" :items="items" />
      </div>
      <div class="flex-1">
        <router-view />
      </div>
    </div>
  </div>
</template>
