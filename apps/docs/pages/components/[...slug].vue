<script setup lang="ts">
// 渲染 @nuxt/content 目录下、位于 /components/* 的内容（.md/.ipynb 等），
// 沿用「Components」布局。已实现组件的文档均已迁移为 content 驱动
// （button/input/scroll-view/icons …），此 catch-all 统一渲染它们。
definePageMeta({
  layout: 'components',
})

const route = useRoute()

const { data: doc } = await useAsyncData(
  () => `content-${route.path}`,
  () => queryCollection('content').where('path', '=', route.path).first(),
)
</script>

<template>
  <div>
    <ContentRenderer
      v-if="doc"
      :value="doc"
      class="space-y-fluent-xxl"
    />
    <p
      v-else
      class="text-colorNeutralForeground2"
    >
      未找到内容：{{ route.path }}
    </p>
  </div>
</template>
