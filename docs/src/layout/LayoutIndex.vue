<script lang="ts" setup>
import { Base, Button, NavMenu, TextBox } from '@/components'

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

const visible = refAutoReset(true, 1000)

const isFullScreen = ref(false)
</script>

<template>
  <div class="window w-full h-full bg-transparent transition-all" :class="{ 'p-6': !isFullScreen }">
    <Transition name="app-fade" mode="out-in" appear>
      <KeepAlive>
        <Base v-if="visible" class="h-full overflow-hidden" :shadow="!isFullScreen" :bordered="!isFullScreen" :rounded="!isFullScreen">
          <div class="h-full flex flex-col">
            <div class="h-12">
              <div class="flex justify-between h-8 leading-8">
                <div class="flex-1 px-2">
                  WinUI
                </div>
                <div class="flex">
                  <Button icon="" :rounded="false" plain type="text" />
                  <Button :icon="isFullScreen ? '' : ''" :rounded="false" plain type="text" @click="isFullScreen = !isFullScreen" />
                  <Button icon="" :rounded="false" plain type="critical" @click="visible = false" />
                </div>
              </div>
            </div>

            <div class="flex-1 flex overflow-hidden">
              <div class="h-full flex flex-col p-2 gap-3 overflow-hidden">
                <a
                  class="p-1 px-3 flex items-center hover:bg-stone-200 active:bg-opacity-70 rounded transition-all duration-100 text-sm cursor-pointer select-none"
                  target="_blank"
                  href="https://github.com/Altermoe"
                >
                  <img class="h-16 aspect-square rounded-full" src="/img/gecheng.jpg" alt="avatar">
                  <div class="flex flex-col px-2">
                    <div>夕云葛城</div>
                    <svg height="18" width="18" aria-hidden="true" viewBox="0 0 16 16" version="1.1" data-view-component="true" class="octicon octicon-mark-github v-align-middle">
                      <path fill-rule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
                    </svg>
                  </div>
                </a>

                <TextBox placeholder="搜索组件（开发中）" />

                <NavMenu v-model="item" class="flex-1" :items="items">
                  <template #title="{ item: navItem }">
                    <div class="flex items-center gap-2">
                      <span class="align-middle">{{ navItem.title }}</span>
                      <span class="align-middle text-gray-500 text-xs hidden sm:inline-block">{{ navItem.name }}</span>
                    </div>
                  </template>
                </NavMenu>
              </div>

              <div class="flex-1 flex flex-col overflow-hidden">
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
      </KeepAlive>
    </Transition>
  </div>
</template>

<style lang="scss" scoped>
.window {
  transition: all 187ms ease;
}
</style>
