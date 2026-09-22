<script setup lang="ts">
// 渲染 @nuxt/content 目录下、位于 /components/* 的内容（.md/.ipynb 等），
// 沿用「Components」布局。已存在的静态页面（scroll-view/input/icons …）优先级更高，
// 此 catch-all 只兜住 content/ 里声明的组件文档。
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
