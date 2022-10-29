import type { RouteRecordRaw } from 'vue-router'

export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    redirect: '/button',
    component: () => import('../layout/LayoutIndex.vue'),
    children: [
      {
        path: '/button',
        name: 'Button',
        meta: {
          title: '按钮',
        },
        component: () => import('../pages/PageButton.vue'),
      },
      {
        path: '/dropdown',
        name: 'Dropdown',
        meta: {
          title: '下拉菜单',
        },
        component: () => import('../pages/PageDropdown.vue'),
      },
    ],
  },
]