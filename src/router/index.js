import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

import YortleView from '@/views/YortleView.vue'

const routes = [
  {
    path: '/',
    redirect: '/-1'
  },
  {
    path: '/:gameidx',
    name: 'YortleView',
    component: YortleView
  }
]

const router = new VueRouter({
  mode: 'history',
  base: '/yortle/',
  routes
})

export default router
