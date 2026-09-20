<script setup lang="ts">
import { FluereButton } from '@fluere-vue/ui'

definePageMeta({
  layout: 'components',
})
</script>

<template>
  <div class="space-y-fluent-xxl">
    <h2 class="text-2xl font-semibold text-colorNeutralForeground1">Button 按钮</h2>
    <p class="text-colorNeutralForeground2">按钮组件，用于触发操作。</p>

    <!-- 外观变体 -->
    <section
      class="bg-colorNeutralBackground1 p-fluent-xxl rounded-fluent-xl shadow-2 border border-colorNeutralStroke1"
    >
      <h3 class="text-lg font-medium text-colorNeutralForeground1 mb-4">外观变体</h3>
      <div class="flex gap-fluent-m flex-wrap">
        <FluereButton appearance="primary"> Primary </FluereButton>
        <FluereButton appearance="secondary"> Secondary </FluereButton>
        <FluereButton appearance="outline"> Outline </FluereButton>
        <FluereButton appearance="subtle"> Subtle </FluereButton>
        <FluereButton appearance="transparent"> Transparent </FluereButton>
      </div>
    </section>

    <!-- 尺寸 -->
    <section
      class="bg-colorNeutralBackground1 p-fluent-xxl rounded-fluent-xl shadow-2 border border-colorNeutralStroke1"
    >
      <h3 class="text-lg font-medium text-colorNeutralForeground1 mb-4">尺寸</h3>
      <div class="flex gap-fluent-m items-center flex-wrap">
        <FluereButton size="small"> Small </FluereButton>
        <FluereButton size="medium"> Medium </FluereButton>
        <FluereButton size="large"> Large </FluereButton>
      </div>
    </section>

    <!-- 形状 -->
    <section
      class="bg-colorNeutralBackground1 p-fluent-xxl rounded-fluent-xl shadow-2 border border-colorNeutralStroke1"
    >
      <h3 class="text-lg font-medium text-colorNeutralForeground1 mb-4">形状</h3>
      <div class="flex gap-fluent-m flex-wrap">
        <FluereButton shape="rounded"> Rounded </FluereButton>
        <FluereButton shape="circular"> Circular </FluereButton>
        <FluereButton shape="square"> Square </FluereButton>
      </div>
    </section>

    <!-- 禁用状态 -->
    <section
      class="bg-colorNeutralBackground1 p-fluent-xxl rounded-fluent-xl shadow-2 border border-colorNeutralStroke1"
    >
      <h3 class="text-lg font-medium text-colorNeutralForeground1 mb-4">禁用状态</h3>
      <div class="flex gap-fluent-m flex-wrap">
        <FluereButton
          appearance="primary"
          disabled
        >
          Primary
        </FluereButton>
        <FluereButton
          appearance="secondary"
          disabled
        >
          Secondary
        </FluereButton>
        <FluereButton
          appearance="outline"
          disabled
        >
          Outline
        </FluereButton>
        <FluereButton
          appearance="subtle"
          disabled
        >
          Subtle
        </FluereButton>
        <FluereButton
          appearance="transparent"
          disabled
        >
          Transparent
        </FluereButton>
      </div>
    </section>

    <!-- 选中状态 (Toggle button) -->
    <section
      class="bg-colorNeutralBackground1 p-fluent-xxl rounded-fluent-xl shadow-2 border border-colorNeutralStroke1"
    >
      <h3 class="text-lg font-medium text-colorNeutralForeground1 mb-4">选中状态</h3>
      <div class="flex gap-fluent-m flex-wrap">
        <FluereButton
          appearance="primary"
          selected
        >
          Primary
        </FluereButton>
        <FluereButton
          appearance="secondary"
          selected
        >
          Secondary
        </FluereButton>
        <FluereButton
          appearance="outline"
          selected
        >
          Outline
        </FluereButton>
        <FluereButton
          appearance="subtle"
          selected
        >
          Subtle
        </FluereButton>
        <FluereButton
          appearance="transparent"
          selected
        >
          Transparent
        </FluereButton>
      </div>
    </section>

    <!-- 带图标 -->
    <section
      class="bg-colorNeutralBackground1 p-fluent-xxl rounded-fluent-xl shadow-2 border border-colorNeutralStroke1"
    >
      <h3 class="text-lg font-medium text-colorNeutralForeground1 mb-4">带图标</h3>
      <div class="flex gap-fluent-m flex-wrap items-center">
        <FluereButton
          appearance="primary"
          size="small"
        >
          Small
        </FluereButton>
        <FluereButton
          appearance="primary"
          size="medium"
        >
          Medium
        </FluereButton>
        <FluereButton
          appearance="primary"
          size="large"
        >
          Large
        </FluereButton>
      </div>
    </section>

    <!-- 图标后置 -->
    <section
      class="bg-colorNeutralBackground1 p-fluent-xxl rounded-fluent-xl shadow-2 border border-colorNeutralStroke1"
    >
      <h3 class="text-lg font-medium text-colorNeutralForeground1 mb-4">图标后置</h3>
      <div class="flex gap-fluent-m flex-wrap">
        <FluereButton
          appearance="primary"
          icon-position="after"
        >
          Add
        </FluereButton>
        <FluereButton
          appearance="secondary"
          icon-position="after"
        >
          Add
        </FluereButton>
      </div>
    </section>

    <!-- 纯图标 -->
    <section
      class="bg-colorNeutralBackground1 p-fluent-xxl rounded-fluent-xl shadow-2 border border-colorNeutralStroke1"
    >
      <h3 class="text-lg font-medium text-colorNeutralForeground1 mb-4">纯图标</h3>
      <div class="flex gap-fluent-m items-center flex-wrap">
        <FluereButton
          appearance="primary"
          size="small"
          icon-only
        />
        <FluereButton
          appearance="primary"
          size="medium"
          icon-only
        />
        <FluereButton
          appearance="primary"
          size="large"
          icon-only
        />
        <FluereButton
          appearance="secondary"
          size="small"
          icon-only
        />
        <FluereButton
          appearance="secondary"
          size="medium"
          icon-only
        />
        <FluereButton
          appearance="secondary"
          size="large"
          icon-only
        />
      </div>
    </section>

    <!-- 块级 -->
    <section
      class="bg-colorNeutralBackground1 p-fluent-xxl rounded-fluent-xl shadow-2 border border-colorNeutralStroke1"
    >
      <h3 class="text-lg font-medium text-colorNeutralForeground1 mb-4">块级按钮</h3>
      <div class="space-y-fluent-s">
        <FluereButton
          appearance="primary"
          block
        >
          Block Primary
        </FluereButton>
        <FluereButton
          appearance="secondary"
          block
        >
          Block Secondary
        </FluereButton>
      </div>
    </section>
  </div>
</template>
