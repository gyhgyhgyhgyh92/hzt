import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/HomeView.vue'),
    meta: { title: '首页', breadcrumb: ['首页'] }
  },
  {
    path: '/cases',
    name: 'Cases',
    component: () => import('@/views/CasesView.vue'),
    meta: { title: 'AI产品案例分析', breadcrumb: ['首页', 'AI产品案例分析'] }
  },
  {
    path: '/prd',
    name: 'Prd',
    component: () => import('@/views/PrdView.vue'),
    meta: { title: 'PRD模板库', breadcrumb: ['首页', 'PRD模板库'] }
  },
  {
    path: '/persona',
    name: 'Persona',
    component: () => import('@/views/PersonaView.vue'),
    meta: { title: '用户画像构建', breadcrumb: ['首页', '用户画像构建工具'] }
  },
  {
    path: '/prototype',
    name: 'Prototype',
    component: () => import('@/views/PrototypeView.vue'),
    meta: { title: '产品原型设计', breadcrumb: ['首页', '产品原型设计基础'] }
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('@/views/AboutView.vue'),
    meta: { title: '关于', breadcrumb: ['首页', '关于'] }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/views/ProfileView.vue'),
    meta: { title: '个人资料', breadcrumb: ['首页', '个人资料'] }
  },
  {
    path: '/stats',
    name: 'Stats',
    component: () => import('@/views/StatsView.vue'),
    meta: { title: '数据统计', breadcrumb: ['首页', '数据统计与分析'] }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to) => {
  document.title = `${to.meta.title || '校园文档助手'} - 好铁汁`
})

export default router
