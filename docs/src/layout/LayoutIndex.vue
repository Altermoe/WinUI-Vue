<script lang="ts" setup>
import { WindowAside } from '../components'
import { Base, Button, NavMenu, TextBox } from '@/components'

const route = useRoute()
const router = useRouter()
const routes = computed(() => router.getRoutes().find(route => route.path === '/')?.children ?? [])

const items = computed(() => routes.value.filter(item => !item.meta?.hidden).map(route => ({
  title: route.meta?.title ?? '',
  name: route.name,
  value: route.path,
})))

const item = computed({
  get: () => route.path,
  set: path => router.push(path),
})

const visible = refAutoReset(true, 1000)

const isFullScreen = ref(true)
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
                <WindowAside />

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
