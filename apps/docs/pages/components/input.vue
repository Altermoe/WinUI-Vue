<script setup lang="ts">
definePageMeta({
  layout: false,
})
</script>

<template>
  <div class="space-y-6">
    <h2 class="text-2xl font-semibold text-gray-800">Input 输入框</h2>
    <p class="text-gray-600">输入框组件，用于获取用户文本输入。</p>

    <section class="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
      <h3 class="text-lg font-medium text-gray-800 mb-4">基础用法</h3>
      <div class="flex flex-col gap-4 max-w-sm">
        <input
          type="text"
          placeholder="请输入内容"
          class="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="text"
          placeholder="禁用状态"
          disabled
          class="px-3 py-2 border border-gray-200 rounded bg-gray-50 text-gray-400 cursor-not-allowed"
        />
      </div>
    </section>
  </div>
</template>
