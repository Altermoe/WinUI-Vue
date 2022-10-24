import type { RouteRecordRaw } from 'vue-router'

export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../layout/LayoutIndex.vue'),
    children: [
      {
        path: '/button',
        name: 'Button',
        component: () => import('../pages/PageButton.vue'),
      },
    ],
  },
]
