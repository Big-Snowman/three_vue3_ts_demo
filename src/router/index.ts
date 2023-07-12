import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/homeView',
      name: 'homeView',
      component: () => import('../views/HomeView.vue')
    },
    {
      path: '/carShowroom',
      component: () => import('../views/CarShowroom.vue')
    },
    {
      path: '/christmas',
      component: () => import('../views/Christmas.vue')
    },
    {
      path: '/robot',
      component: () => import('../views/Robot.vue')
    }
  ]
})

export default router
