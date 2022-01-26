import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

import YortleView from '@/views/YortleView.vue'

const routes = [
  {
    path: '/yortle/',
    redirect: '/yortle/-1'
  },
  {
    path: '/yortle/:gameidx',
    name: 'YortleView',
    component: YortleView
  }
]

const router = new VueRouter({
  mode: 'history',
  base: '/',
  routes
})

export default router
