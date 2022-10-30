<script lang="ts" setup>
import { Base, Layer, NavMenu } from '@/components'

const route = useRoute()
const router = useRouter()
const routes = computed(() => router.getRoutes().find(route => route.path === '/')?.children ?? [])

const items = computed(() => routes.value.map(route => ({
  title: route.meta?.title ?? '',
  name: route.name,
  value: route.path,
})))

const item = computed({
  get: () => route.path,
  set: path => router.push(path),
})
</script>

<template>
  <Base class="absolute top-6 bottom-6 left-6 right-6" shadow>
    <div class="h-full flex flex-col">
      <div class="h-12">
        <div class="flex justify-between h-8 leading-8">
          <div class="px-2">
            WinUI
          </div>
          <div>关闭</div>
        </div>
      </div>

      <div class="flex-1 flex overflow-hidden">
        <div class="h-full p-3 overflow-hidden">
          <NavMenu v-model="item" :items="items">
            <template #title="{ item: navItem }">
              <div class="flex items-center gap-2">
                <span class="align-middle">{{ navItem.title }}</span>
                <span class="align-middle text-gray-500 text-xs">{{ navItem.name }}</span>
              </div>
            </template>
          </NavMenu>
        </div>

        <div class="flex-1 flex flex-col">
          <div class="text-2xl p-4">
            {{ route.meta.title }} {{ route.name }}
          </div>
          <div class="flex-1 overflow-hidden">
            <router-view>
              <template #default="{ Component, route: componentRoute }">
                <transition name="app-slide-y" mode="out-in" appear>
                  <keep-alive>
                    <component :is="Component" :key="componentRoute.fullPath" />
                  </keep-alive>
                </transition>
              </template>
            </router-view>
          </div>
        </div>
      </div>
    </div>
  </Base>
</template>
