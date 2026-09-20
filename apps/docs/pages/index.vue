<script setup lang="ts">
const navLinks = [
  { label: 'Docs', to: '/components' },
  { label: 'Components', to: '/components/button' },
]

const features = [
  {
    title: 'Accessibility out of the box.',
    subtitle: '遵循 WAI-ARIA 设计规范',
    items: [
      'WAI-ARIA compliant',
      'Keyboard navigation',
      'Focus management',
      'Screen reader support',
    ],
  },
  {
    title: 'Save time. Ship faster.',
    subtitle: '精心打磨的组件体系',
    items: ['丰富的基础组件', '一致的 API 设计', '开箱即用', '可组合的结构'],
  },
  {
    title: 'Developer Experience First.',
    subtitle: 'Unstyled, Customizable, Familiar API',
    items: [
      '完全可定制的样式',
      '与 UnoCSS 无缝集成',
      'TypeScript 类型友好',
      'Fluent Design 令牌系统',
    ],
  },
]

const stats = [
  { value: '40+', label: 'Components 组件' },
  { value: '100%', label: 'TypeScript 类型' },
  { value: 'MIT', label: 'License 许可' },
]

const ctLinks = [
  {
    title: 'Install and Setup',
    desc: '了解如何在项目中安装和配置 WinUI-Vue，并构建和样式化你的第一个组件。',
    to: '/components',
  },
  {
    title: 'Browse components',
    desc: '查看 WinUI-Vue 提供的所有组件和工具。',
    to: '/components/button',
  },
  {
    title: 'Explore Themes',
    desc: '探索 Fluent Design 主题系统和设计令牌。',
    to: '/components',
  },
]
</script>

<template>
  <div class="min-h-screen bg-neutral-background1 text-neutral-foreground1 font-base">
    <!-- Nav -->
    <header
      class="sticky top-0 z-10 backdrop-blur-md bg-neutral-background1/80 border-b border-neutral-stroke1"
    >
      <div class="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        <div class="flex items-center gap-8">
          <NuxtLink
            to="/"
            class="flex items-center gap-2 font-semibold text-lg"
          >
            <div
              class="w-6 h-6 rounded bg-brand-background text-brand-foreground-inverted flex items-center justify-center text-xs font-bold"
            >
              W
            </div>
            WinUI-Vue
          </NuxtLink>
          <nav class="hidden md:flex items-center gap-6 text-sm text-neutral-foreground2">
            <NuxtLink
              v-for="link in navLinks"
              :key="link.to"
              :to="link.to"
              class="hover:text-neutral-foreground1 transition-colors"
            >
              {{ link.label }}
            </NuxtLink>
          </nav>
        </div>
        <div class="flex items-center gap-3 text-sm">
          <span class="text-neutral-foreground3">v0.0.1</span>
          <a
            href="https://github.com/"
            target="_blank"
            rel="noopener"
            class="px-3 py-1.5 rounded-md border border-neutral-stroke1 hover:bg-neutral-background1-hover transition-colors text-neutral-foreground2"
          >
            GitHub
          </a>
        </div>
      </div>
    </header>

    <main>
      <!-- Hero -->
      <section class="relative overflow-hidden">
        <div class="absolute inset-0 -z-10">
          <div
            class="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full bg-brand-background/10 blur-[120px]"
          ></div>
        </div>
        <div class="max-w-4xl mx-auto px-6 pt-24 pb-20 text-center">
          <a
            href="#"
            class="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-neutral-stroke1 bg-neutral-background2 text-xs text-neutral-foreground2 mb-8 hover:border-brand-stroke1 transition-colors"
          >
            <span class="w-1.5 h-1.5 rounded-full bg-brand-background"></span>
            New: Button & Input 组件已发布
            <span class="text-neutral-foreground3">→</span>
          </a>
          <h1 class="text-5xl md:text-6xl font-bold tracking-tight leading-tight mb-6">
            Craft accessible web apps
            <br />
            <span
              class="bg-gradient-to-r from-brand-foreground1 to-compound-brand-foreground1 bg-clip-text text-transparent"
            >
              with Vue 3
            </span>
          </h1>
          <p class="text-lg text-neutral-foreground2 max-w-2xl mx-auto mb-10 leading-relaxed">
            一个基于
            <a
              href="#"
              class="text-brand-foreground-link hover:underline"
              >Fluent Design 2</a
            >
            设计规范的开源组件库， 提供
            <a
              href="#"
              class="text-brand-foreground-link hover:underline"
              >无样式</a
            >、
            <a
              href="#"
              class="text-brand-foreground-link hover:underline"
              >可组合</a
            >
            的组件， 以及丰富的
            <a
              href="#"
              class="text-brand-foreground-link hover:underline"
              >使用示例</a
            >， 随时可以集成到你的项目中。
          </p>
          <div class="flex items-center justify-center gap-4">
            <NuxtLink
              to="/components"
              class="px-5 py-2.5 rounded-md bg-brand-background text-brand-foreground-on-brand font-medium hover:bg-brand-background-hover active:bg-brand-background-pressed transition-colors"
            >
              Get started
            </NuxtLink>
            <NuxtLink
              to="/components/button"
              class="px-5 py-2.5 rounded-md border border-neutral-stroke1 text-neutral-foreground1 font-medium hover:bg-neutral-background1-hover transition-colors"
            >
              Explore components
            </NuxtLink>
          </div>
        </div>
      </section>

      <!-- Code preview -->
      <section class="max-w-4xl mx-auto px-6 pb-24">
        <div class="rounded-lg border border-neutral-stroke1 overflow-hidden shadow-8">
          <div
            class="flex items-center gap-1.5 px-4 h-9 bg-neutral-background3 border-b border-neutral-stroke1"
          >
            <div class="w-3 h-3 rounded-full bg-[#ff5f57]"></div>
            <div class="w-3 h-3 rounded-full bg-[#febc2e]"></div>
            <div class="w-3 h-3 rounded-full bg-[#28c840]"></div>
            <span class="ml-3 text-xs text-neutral-foreground3 font-mono">App.vue</span>
          </div>
          <pre
            class="bg-neutral-background2 p-6 text-sm font-mono leading-relaxed overflow-x-auto"
          ><code><span class="text-neutral-foreground3">&lt;script setup lang="ts"&gt;</span>
<span class="text-brand-foreground1">import</span> { Button } <span class="text-brand-foreground1">from</span> <span class="text-status-success-foreground1">'@winui-vue/ui'</span>
<span class="text-neutral-foreground3">&lt;/script&gt;</span>

<span class="text-neutral-foreground3">&lt;template&gt;</span>
  <span class="text-status-success-foreground1">&lt;Button</span> <span class="text-brand-foreground1">appearance</span>=<span class="text-status-danger-foreground1">"primary"</span><span class="text-status-success-foreground1">&gt;</span>
    Click me
  <span class="text-status-success-foreground1">&lt;/Button&gt;</span>
<span class="text-neutral-foreground3">&lt;/template&gt;</span></code></pre>
        </div>
      </section>

      <!-- Features -->
      <section class="border-t border-neutral-stroke1 py-24">
        <div class="max-w-6xl mx-auto px-6">
          <div class="grid md:grid-cols-3 gap-8">
            <div
              v-for="feature in features"
              :key="feature.title"
              class="space-y-4"
            >
              <h3 class="text-xl font-semibold">{{ feature.title }}</h3>
              <p class="text-sm text-neutral-foreground2">{{ feature.subtitle }}</p>
              <ul class="space-y-2 pt-2">
                <li
                  v-for="item in feature.items"
                  :key="item"
                  class="flex items-center gap-2 text-sm text-neutral-foreground2"
                >
                  <svg
                    class="w-4 h-4 text-brand-foreground1"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path
                      d="M20 6 9 17l-5-5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                  {{ item }}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <!-- Stats -->
      <section class="border-t border-neutral-stroke1 py-20">
        <div class="max-w-4xl mx-auto px-6">
          <div class="grid grid-cols-3 gap-8 text-center">
            <div
              v-for="stat in stats"
              :key="stat.label"
              class="space-y-2"
            >
              <div
                class="text-4xl md:text-5xl font-bold bg-gradient-to-r from-brand-foreground1 to-compound-brand-foreground1 bg-clip-text text-transparent"
              >
                {{ stat.value }}
              </div>
              <div class="text-sm text-neutral-foreground3">{{ stat.label }}</div>
            </div>
          </div>
        </div>
      </section>

      <!-- CTA cards -->
      <section class="border-t border-neutral-stroke1 py-24">
        <div class="max-w-6xl mx-auto px-6">
          <h2 class="text-3xl font-bold text-center mb-4">Ready to get started?</h2>
          <p class="text-neutral-foreground2 text-center mb-12 max-w-xl mx-auto">
            无论你是在构建内部工具还是面向客户的产品，WinUI-Vue 都能帮你快速打造流畅的用户界面。
          </p>
          <div class="grid md:grid-cols-3 gap-6">
            <NuxtLink
              v-for="card in ctLinks"
              :key="card.title"
              :to="card.to"
              class="group p-6 rounded-lg border border-neutral-stroke1 bg-neutral-background1 hover:bg-neutral-background1-hover hover:border-brand-stroke1 transition-all"
            >
              <h3 class="font-semibold mb-2 group-hover:text-brand-foreground1 transition-colors">
                {{ card.title }} →
              </h3>
              <p class="text-sm text-neutral-foreground2 leading-relaxed">
                {{ card.desc }}
              </p>
            </NuxtLink>
          </div>
        </div>
      </section>
    </main>

    <!-- Footer -->
    <footer class="border-t border-neutral-stroke1 py-10">
      <div
        class="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-neutral-foreground3"
      >
        <div class="flex items-center gap-2">
          <div
            class="w-5 h-5 rounded bg-brand-background text-brand-foreground-on-brand flex items-center justify-center text-xs font-bold"
          >
            W
          </div>
          WinUI-Vue
        </div>
        <div>© 2026 WinUI-Vue. MIT License.</div>
      </div>
    </footer>
  </div>
</template>
