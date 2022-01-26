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
  },
  {
    path: '*',
    redirect: '/yortle/-1'
  }
]

const router = new VueRouter({
  mode: 'history',
  base: '/',
  routes
})
router.beforeResolve((to, from, next) => {
  // console.log("from: ", from)
  // console.log("to: ", to)
  // console.log("next: ", next)
  next()
})

export default router
