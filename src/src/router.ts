import { createRouter, createWebHistory } from 'vue-router'
import OverviewView from './views/OverviewView.vue'
import FateChoiceDetailView from './views/FateChoiceDetailView.vue'
import PrimaryAxisView from './views/PrimaryAxisView.vue'
import ProtoA from './views/ProtoA.vue'
import ProtoB from './views/ProtoB.vue'
import ProtoC from './views/ProtoC.vue'

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
    },
    { path: '/proto-a', name: 'proto-a', component: ProtoA },
    { path: '/proto-b', name: 'proto-b', component: ProtoB },
    { path: '/proto-c', name: 'proto-c', component: ProtoC },
  ]
})

export default router
