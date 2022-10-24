import { createRouter, createWebHashHistory } from 'vue-router'
import { routes } from './routes'

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior: () => ({
    behavior: 'smooth',
    top: 0,
    left: 0,
  }),
})

export { router }
