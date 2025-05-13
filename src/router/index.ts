import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'
import Dashboard from '@/views/Dashboard.vue'
import Stations from '@/views/Stations.vue'
import { useAuthStore } from '@/stores/auth'

// Define routes for the power grid application
const routes = [
  {
    path: '/',
    redirect: '/dashboard',
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: {
      requiresAuth: false
    }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/stations',
    name: 'Stations',
    component: Stations,
    meta: {
      requiresAuth: true
    }
  },
//   {
//     path: '/stations',
//     name: 'Stations',
//     component: () => import('../views/Stations.vue'),
//     meta: {
//       requiresAuth: true
//     }
//   },
//   {
//     path: '/outages',
//     name: 'Outages',
//     component: () => import('../views/Outages.vue'),
//     meta: {
//       requiresAuth: true
//     }
//   },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../views/NotFound.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guard for authentication
router.beforeEach((to, from, next) => {
    const authStore = useAuthStore();
    const isAuthenticated = authStore.isAuthenticated; //localStorage.getItem('power-grid-auth-token')
  
  // If route requires authentication and user is not authenticated, redirect to login
  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ name: 'Login', query: { redirect: to.fullPath } })
  } else if (to.path === '/login' && isAuthenticated) {
    // If user is already logged in and trying to access login page, redirect to dashboard
    next({ name: 'Dashboard' })
  } else {
    next()
  }
})

export default router