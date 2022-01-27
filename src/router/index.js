import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

import YortleView from '@/views/YortleView.vue'

function todaysYortle() {
  const date1 = new Date("2021-06-19")
  const today = new Date()
  return Math.floor((today.getTime() - date1.getTime()) / (1000 * 60 * 60 * 24))
}

const routes = [
  {
    path: '/yortle/',
    redirect: `/yortle/${todaysYortle()}`
  },
  {
    path: '/yortle/:gameidx',
    name: 'YortleView',
    component: YortleView
  },
  {
    path: '*',
    redirect: `/yortle/${todaysYortle()}`
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
