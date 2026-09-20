<template>
  <div class="min-h-screen bg-colorNeutralBackground2 p-fluent-xxxl">
    <div class="max-w-4xl mx-auto">
      <h1 class="text-3xl font-bold text-colorNeutralForeground1 mb-6">Components 组件</h1>
      <nav class="flex gap-fluent-l mb-8">
        <NuxtLink
          to="/components/button"
          class="px-fluent-l py-fluent-s bg-colorNeutralBackground1 border border-colorNeutralStroke2 rounded-fluent-md hover:bg-colorNeutralBackground1Hover transition-colors text-colorNeutralForeground1"
        >
          Button 按钮
        </NuxtLink>
        <NuxtLink
          to="/components/input"
          class="px-fluent-l py-fluent-s bg-colorNeutralBackground1 border border-colorNeutralStroke2 rounded-fluent-md hover:bg-colorNeutralBackground1Hover transition-colors text-colorNeutralForeground1"
        >
          Input 输入框
        </NuxtLink>
      </nav>
      <NuxtPage />
    </div>
  </div>
</template>
