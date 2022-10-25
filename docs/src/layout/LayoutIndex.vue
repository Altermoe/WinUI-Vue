<script lang="ts" setup>
import { NavMenu } from '@/components'

const router = useRouter()
const routes = computed(() => router.getRoutes().find(route => route.path === '/')?.children ?? [])

const items = computed(() => routes.value.map(route => ({
  title: route.meta?.title ?? '',
  value: route.path,
})))

const item = ref(items.value[0].value)
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
