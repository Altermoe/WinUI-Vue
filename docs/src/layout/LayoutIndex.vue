<script lang="ts" setup>
import { Base, Layer, NavMenu } from '@/components'

const route = useRoute()
const router = useRouter()
const routes = computed(() => router.getRoutes().find(route => route.path === '/')?.children ?? [])

const items = computed(() => routes.value.map(route => ({
  title: route.meta?.title ?? '',
  value: route.path,
})))

const item = computed({
  get: () => route.path,
  set: path => router.push(path),
})
</script>

<template>
  <Base class="absolute top-6 bottom-6 left-6 right-6 overflow-hidden" shadow>
    <div class="h-full flex flex-col">
      <div class="flex h-12">
        <div class="title h-12 py-2 px-4">
          WinUI
        </div>
      </div>
      <div class="flex-1 flex">
        <div class="flex">
          <NavMenu v-model="item" class="" :items="items" />
        </div>
        <Layer class="flex-1" rtl bt bl>
          <router-view />
        </Layer>
      </div>
    </div>
  </Base>
</template>
