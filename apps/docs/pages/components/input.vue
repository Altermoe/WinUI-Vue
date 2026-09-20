<script setup lang="ts">
import { FluereInput } from '@fluere-vue/ui'
import { ref } from 'vue'

definePageMeta({
  layout: 'components',
})

const value = ref('')
</script>

<template>
  <div class="space-y-fluent-xxl">
    <h2 class="text-2xl font-semibold text-colorNeutralForeground1">Input 输入框</h2>
    <p class="text-colorNeutralForeground2">输入框组件，用于获取用户文本输入。</p>

    <!-- 基础用法 -->
    <section
      class="bg-colorNeutralBackground1 p-fluent-xxl rounded-fluent-xl shadow-2 border border-colorNeutralStroke1"
    >
      <h3 class="text-lg font-medium text-colorNeutralForeground1 mb-4">基础用法</h3>
      <div class="flex flex-col gap-fluent-l max-w-sm">
        <FluereInput
          v-model="value"
          placeholder="请输入内容"
        />
        <p class="text-sm text-colorNeutralForeground3">当前值：{{ value || '（空）' }}</p>
        <FluereInput
          placeholder="禁用状态"
          disabled
        />
      </div>
    </section>

    <!-- 尺寸 -->
    <section
      class="bg-colorNeutralBackground1 p-fluent-xxl rounded-fluent-xl shadow-2 border border-colorNeutralStroke1"
    >
      <h3 class="text-lg font-medium text-colorNeutralForeground1 mb-4">尺寸</h3>
      <div class="flex flex-col gap-fluent-l max-w-sm">
        <FluereInput
          size="small"
          placeholder="Small (24px)"
        />
        <FluereInput
          size="medium"
          placeholder="Medium (32px)"
        />
        <FluereInput
          size="large"
          placeholder="Large (40px)"
        />
      </div>
    </section>

    <!-- 外观 -->
    <section
      class="bg-colorNeutralBackground1 p-fluent-xxl rounded-fluent-xl shadow-2 border border-colorNeutralStroke1"
    >
      <h3 class="text-lg font-medium text-colorNeutralForeground1 mb-4">外观</h3>
      <div class="flex flex-col gap-fluent-l max-w-sm">
        <FluereInput
          appearance="outline"
          placeholder="Outline（默认）"
        />
        <FluereInput
          appearance="underline"
          placeholder="Underline（下划线）"
        />
      </div>
    </section>

    <!-- 错误状态 -->
    <section
      class="bg-colorNeutralBackground1 p-fluent-xxl rounded-fluent-xl shadow-2 border border-colorNeutralStroke1"
    >
      <h3 class="text-lg font-medium text-colorNeutralForeground1 mb-4">错误状态</h3>
      <div class="flex flex-col gap-fluent-l max-w-sm">
        <FluereInput
          invalid
          placeholder="错误输入"
          aria-describedby="input-error-hint"
        />
        <p
          id="input-error-hint"
          class="text-sm text-colorStatusDangerForeground1"
        >
          请输入有效的内容。
        </p>
      </div>
    </section>
  </div>
</template>
