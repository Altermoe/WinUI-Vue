<template>
  <div class="min-h-screen bg-gray-50 p-8">
    <div class="max-w-4xl mx-auto">
      <h1 class="text-3xl font-bold text-gray-900 mb-6">Components 组件</h1>
      <nav class="flex gap-4 mb-8">
        <NuxtLink
          to="/components/button"
          class="px-4 py-2 bg-white border border-gray-200 rounded hover:bg-gray-100 transition-colors"
        >
          Button 按钮
        </NuxtLink>
        <NuxtLink
          to="/components/input"
          class="px-4 py-2 bg-white border border-gray-200 rounded hover:bg-gray-100 transition-colors"
        >
          Input 输入框
        </NuxtLink>
      </nav>
      <NuxtPage />
    </div>
  </div>
</template>
