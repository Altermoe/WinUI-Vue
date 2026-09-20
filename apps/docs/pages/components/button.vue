<script setup lang="ts">
import { FluentButton } from '@fluentui-vue/ui'

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
        <FluentButton appearance="primary"> Primary </FluentButton>
        <FluentButton appearance="secondary"> Secondary </FluentButton>
        <FluentButton appearance="outline"> Outline </FluentButton>
        <FluentButton appearance="subtle"> Subtle </FluentButton>
        <FluentButton appearance="transparent"> Transparent </FluentButton>
      </div>
    </section>

    <!-- 尺寸 -->
    <section
      class="bg-colorNeutralBackground1 p-fluent-xxl rounded-fluent-xl shadow-2 border border-colorNeutralStroke1"
    >
      <h3 class="text-lg font-medium text-colorNeutralForeground1 mb-4">尺寸</h3>
      <div class="flex gap-fluent-m items-center flex-wrap">
        <FluentButton size="small"> Small </FluentButton>
        <FluentButton size="medium"> Medium </FluentButton>
        <FluentButton size="large"> Large </FluentButton>
      </div>
    </section>

    <!-- 形状 -->
    <section
      class="bg-colorNeutralBackground1 p-fluent-xxl rounded-fluent-xl shadow-2 border border-colorNeutralStroke1"
    >
      <h3 class="text-lg font-medium text-colorNeutralForeground1 mb-4">形状</h3>
      <div class="flex gap-fluent-m flex-wrap">
        <FluentButton shape="rounded"> Rounded </FluentButton>
        <FluentButton shape="circular"> Circular </FluentButton>
        <FluentButton shape="square"> Square </FluentButton>
      </div>
    </section>

    <!-- 禁用状态 -->
    <section
      class="bg-colorNeutralBackground1 p-fluent-xxl rounded-fluent-xl shadow-2 border border-colorNeutralStroke1"
    >
      <h3 class="text-lg font-medium text-colorNeutralForeground1 mb-4">禁用状态</h3>
      <div class="flex gap-fluent-m flex-wrap">
        <FluentButton
          appearance="primary"
          disabled
        >
          Primary
        </FluentButton>
        <FluentButton
          appearance="secondary"
          disabled
        >
          Secondary
        </FluentButton>
        <FluentButton
          appearance="outline"
          disabled
        >
          Outline
        </FluentButton>
        <FluentButton
          appearance="subtle"
          disabled
        >
          Subtle
        </FluentButton>
        <FluentButton
          appearance="transparent"
          disabled
        >
          Transparent
        </FluentButton>
      </div>
    </section>

    <!-- 选中状态 (Toggle button) -->
    <section
      class="bg-colorNeutralBackground1 p-fluent-xxl rounded-fluent-xl shadow-2 border border-colorNeutralStroke1"
    >
      <h3 class="text-lg font-medium text-colorNeutralForeground1 mb-4">选中状态</h3>
      <div class="flex gap-fluent-m flex-wrap">
        <FluentButton
          appearance="primary"
          selected
        >
          Primary
        </FluentButton>
        <FluentButton
          appearance="secondary"
          selected
        >
          Secondary
        </FluentButton>
        <FluentButton
          appearance="outline"
          selected
        >
          Outline
        </FluentButton>
        <FluentButton
          appearance="subtle"
          selected
        >
          Subtle
        </FluentButton>
        <FluentButton
          appearance="transparent"
          selected
        >
          Transparent
        </FluentButton>
      </div>
    </section>

    <!-- 带图标 -->
    <section
      class="bg-colorNeutralBackground1 p-fluent-xxl rounded-fluent-xl shadow-2 border border-colorNeutralStroke1"
    >
      <h3 class="text-lg font-medium text-colorNeutralForeground1 mb-4">带图标</h3>
      <div class="flex gap-fluent-m flex-wrap items-center">
        <FluentButton
          appearance="primary"
          size="small"
        >
          Small
        </FluentButton>
        <FluentButton
          appearance="primary"
          size="medium"
        >
          Medium
        </FluentButton>
        <FluentButton
          appearance="primary"
          size="large"
        >
          Large
        </FluentButton>
      </div>
    </section>

    <!-- 图标后置 -->
    <section
      class="bg-colorNeutralBackground1 p-fluent-xxl rounded-fluent-xl shadow-2 border border-colorNeutralStroke1"
    >
      <h3 class="text-lg font-medium text-colorNeutralForeground1 mb-4">图标后置</h3>
      <div class="flex gap-fluent-m flex-wrap">
        <FluentButton
          appearance="primary"
          icon-position="after"
        >
          Add
        </FluentButton>
        <FluentButton
          appearance="secondary"
          icon-position="after"
        >
          Add
        </FluentButton>
      </div>
    </section>

    <!-- 纯图标 -->
    <section
      class="bg-colorNeutralBackground1 p-fluent-xxl rounded-fluent-xl shadow-2 border border-colorNeutralStroke1"
    >
      <h3 class="text-lg font-medium text-colorNeutralForeground1 mb-4">纯图标</h3>
      <div class="flex gap-fluent-m items-center flex-wrap">
        <FluentButton
          appearance="primary"
          size="small"
          icon-only
        />
        <FluentButton
          appearance="primary"
          size="medium"
          icon-only
        />
        <FluentButton
          appearance="primary"
          size="large"
          icon-only
        />
        <FluentButton
          appearance="secondary"
          size="small"
          icon-only
        />
        <FluentButton
          appearance="secondary"
          size="medium"
          icon-only
        />
        <FluentButton
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
        <FluentButton
          appearance="primary"
          block
        >
          Block Primary
        </FluentButton>
        <FluentButton
          appearance="secondary"
          block
        >
          Block Secondary
        </FluentButton>
      </div>
    </section>
  </div>
</template>
