import Vue from 'vue'
import Router from 'vue-router'
import Main from '@comp/Main'
import Hello from '@comp/Hello'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Main',
      component: Main
    },
    {
      path: '/hello',
      name: 'Hello',
      component: Hello
    }
  ]
})
