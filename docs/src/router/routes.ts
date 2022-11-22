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
        path: '/text-box',
        name: 'TextBox',
        meta: {
          title: '文本输入',
        },
        component: () => import('../pages/PageTextBox.vue'),
      },
      {
        path: '/radio',
        name: 'Radio',
        meta: {
          title: '单选',
        },
        component: () => import('../pages/PageRadio.vue'),
      },
      {
        path: '/rating',
        name: 'Rating',
        meta: {
          title: '评分',
        },
        component: () => import('../pages/PageRating.vue'),
      },
      {
        path: '/switch',
        name: 'Switch',
        meta: {
          title: '开关',
        },
        component: () => import('../pages/PageSwitch.vue'),
      },
      {
        path: '/slider',
        name: 'Slider',
        meta: {
          title: '滑块',
        },
        component: () => import('../pages/PageSlider.vue'),
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
