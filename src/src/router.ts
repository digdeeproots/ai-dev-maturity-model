import { createRouter, createWebHistory } from 'vue-router'
import SafetyMatrixView from './views/SafetyMatrixView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'safety-matrix',
      component: SafetyMatrixView,
    },
  ]
})

export default router
