import { defineContentConfig, defineCollection, z } from '@nuxt/content'

export default defineContentConfig({
  collections: {
    // 与 pages/components/[...slug].vue 的 queryCollection('content') 对应，
    // 显式声明避免 @nuxt/content 回退到默认 collection 产生的启动警告。
    content: defineCollection({
      type: 'page',
      source: {
        include: '**/*.md',
        exclude: ['**/*.draft.md'],
      },
      schema: z.object({
        title: z.string(),
        description: z.string().optional(),
        nav: z.object({ title: z.string() }).optional(),
      }),
    }),
  },
})