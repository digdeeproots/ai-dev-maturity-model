import { createRouter, createWebHistory } from 'vue-router'
import OverviewView from './views/OverviewView.vue'
import FateChoiceDetailView from './views/FateChoiceDetailView.vue'
import PrimaryAxisView from './views/PrimaryAxisView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'overview',
      component: OverviewView
    },
    {
      path: '/axis/agency',
      name: 'primary-axis',
      component: PrimaryAxisView
    },
    {
      path: '/fate-choice/:id',
      name: 'fate-choice-detail',
      component: FateChoiceDetailView,
      props: true
    }
  ]
})

export default router
