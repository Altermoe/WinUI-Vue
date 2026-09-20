<script setup lang="ts">
definePageMeta({
  layout: false,
})
</script>

<template>
  <div class="space-y-fluent-xxl">
    <h2 class="text-2xl font-semibold text-colorNeutralForeground1">Input 输入框</h2>
    <p class="text-colorNeutralForeground2">输入框组件，用于获取用户文本输入。</p>

    <section
      class="bg-colorNeutralBackground1 p-fluent-xxl rounded-fluent-xl shadow-2 border border-colorNeutralStroke1"
    >
      <h3 class="text-lg font-medium text-colorNeutralForeground1 mb-4">基础用法</h3>
      <div class="flex flex-col gap-fluent-l max-w-sm">
        <input
          type="text"
          placeholder="请输入内容"
          class="px-fluent-m py-fluent-s border border-colorNeutralStroke1 rounded-fluent-md bg-colorNeutralBackground1 text-colorNeutralForeground1 placeholder:text-colorNeutralForeground4 focus:outline-none focus:ring-2 focus:ring-colorCompoundBrandStroke"
        />
        <input
          type="text"
          placeholder="禁用状态"
          disabled
          class="px-fluent-m py-fluent-s border border-colorNeutralStrokeDisabled rounded-fluent-md bg-colorNeutralBackgroundDisabled text-colorNeutralForegroundDisabled cursor-not-allowed"
        />
      </div>
    </section>
  </div>
</template>
