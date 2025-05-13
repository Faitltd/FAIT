import { createRouter, createWebHistory } from 'vue-router'

// Define routes with type for Vue Router 4
const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue')
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('../views/About.vue')
  },
  {
    path: '/services',
    name: 'Services',
    component: () => import('../views/Services.vue')
  },
  {
    path: '/community',
    name: 'Community',
    component: () => import('../views/Community.vue')
  },
  {
    path: '/contact',
    name: 'Contact',
    component: () => import('../views/Contact.vue')
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue')
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/Register.vue')
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('../views/Profile.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('../views/Dashboard.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/dashboard/client',
    name: 'ClientDashboard',
    component: () => import('../views/dashboard/ClientDashboard.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/dashboard/service-agent',
    name: 'ServiceAgentDashboard',
    component: () => import('../views/dashboard/ServiceAgentDashboard.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/dashboard/admin',
    name: 'AdminDashboard',
    component: () => import('../views/dashboard/AdminDashboard.vue'),
    meta: { requiresAuth: true }
  },
  // Client dashboard routes
  {
    path: '/dashboard/client/services',
    name: 'ClientServices',
    component: () => import('../views/dashboard/ClientDashboard.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/dashboard/client/history',
    name: 'ClientHistory',
    component: () => import('../views/dashboard/ClientDashboard.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/dashboard/client/request',
    name: 'ClientRequest',
    component: () => import('../views/dashboard/ClientDashboard.vue'),
    meta: { requiresAuth: true }
  },
  // Service agent dashboard routes
  {
    path: '/dashboard/service-agent/requests',
    name: 'ServiceAgentRequests',
    component: () => import('../views/dashboard/ServiceAgentDashboard.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/dashboard/service-agent/schedule',
    name: 'ServiceAgentSchedule',
    component: () => import('../views/dashboard/ServiceAgentDashboard.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/dashboard/service-agent/clients',
    name: 'ServiceAgentClients',
    component: () => import('../views/dashboard/ServiceAgentDashboard.vue'),
    meta: { requiresAuth: true }
  },
  // Admin dashboard routes
  {
    path: '/dashboard/admin/users',
    name: 'AdminUsers',
    component: () => import('../views/dashboard/AdminDashboard.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/dashboard/admin/services',
    name: 'AdminServices',
    component: () => import('../views/dashboard/AdminDashboard.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/dashboard/admin/reports',
    name: 'AdminReports',
    component: () => import('../views/dashboard/AdminDashboard.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/dashboard/admin/settings',
    name: 'AdminSettings',
    component: () => import('../views/dashboard/AdminDashboard.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/booking',
    name: 'Booking',
    component: () => import('../views/Booking.vue')
  },
  {
    path: '/goodfait',
    name: 'GoodFait',
    component: () => import('../views/GoodFait.vue')
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../views/NotFound.vue')
  }
]

// Create router instance
const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guards
router.beforeEach((to, from, next) => {
  // Check if route requires authentication
  if (to.matched.some(record => record.meta.requiresAuth)) {
    // Check if user is authenticated
    const isAuthenticated = localStorage.getItem('user') !== null

    if (!isAuthenticated) {
      // Redirect to login page if not authenticated
      next({ name: 'Login', query: { redirect: to.fullPath } })
    } else {
      // Continue to route if authenticated
      next()
    }
  } else {
    // Continue to route if authentication not required
    next()
  }
})

export default router
