<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import Avatar from '../ui/Avatar.vue'

const auth = useAuthStore()
const router = useRouter()
const isSidebarOpen = ref(true)

// Toggle sidebar
const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
}

// Handle sign out
const handleSignOut = async () => {
  await auth.signOut()
  router.push('/')
}

// User display name
const userDisplayName = computed(() => {
  if (!auth.user) return ''
  return auth.user.full_name || auth.user.email
})

// User initials
const userInitials = computed(() => {
  if (!auth.user) return ''
  if (auth.user.full_name) {
    return auth.user.full_name
      .split(' ')
      .map(word => word[0])
      .slice(0, 2)
      .join('')
      .toUpperCase()
  }
  return auth.user.email.substring(0, 2).toUpperCase()
})

// User role display
const userRoleDisplay = computed(() => {
  if (!auth.userType) return ''

  if (auth.userType === 'admin') {
    return 'Administrator'
  } else if (auth.userType === 'service_agent') {
    return 'Service Agent'
  } else if (auth.userType === 'client') {
    return 'Client'
  }

  return auth.userType
})

// Navigation items based on user role
const navItems = computed(() => {
  const items = [
    { name: 'Dashboard', path: '/dashboard', icon: 'home' }
  ]

  if (auth.userType === 'admin') {
    items.push(
      { name: 'Users', path: '/dashboard/admin/users', icon: 'users' },
      { name: 'Services', path: '/dashboard/admin/services', icon: 'briefcase' },
      { name: 'Reports', path: '/dashboard/admin/reports', icon: 'bar-chart' },
      { name: 'Settings', path: '/dashboard/admin/settings', icon: 'settings' }
    )
  } else if (auth.userType === 'service_agent') {
    items.push(
      { name: 'Service Requests', path: '/dashboard/service-agent/requests', icon: 'clipboard' },
      { name: 'Schedule', path: '/dashboard/service-agent/schedule', icon: 'calendar' },
      { name: 'Clients', path: '/dashboard/service-agent/clients', icon: 'users' }
    )
  } else if (auth.userType === 'client') {
    items.push(
      { name: 'My Services', path: '/dashboard/client/services', icon: 'package' },
      { name: 'Service History', path: '/dashboard/client/history', icon: 'clock' },
      { name: 'Request Service', path: '/dashboard/client/request', icon: 'plus-circle' }
    )
  }

  items.push(
    { name: 'Profile', path: '/profile', icon: 'user' },
    { name: 'Messages', path: '/messages', icon: 'message-circle' }
  )

  return items
})

// Get icon name based on menu item
const getIconName = (name: string) => {
  return name;
}
</script>

<template>
  <div class="min-h-screen bg-neutral-50 flex">
    <!-- Sidebar -->
    <aside :class="['bg-white border-r border-neutral-200 transition-all duration-300', isSidebarOpen ? 'w-64' : 'w-20']">
      <div class="h-full flex flex-col">
        <!-- Sidebar header -->
        <div class="flex items-center justify-between h-16 px-4 border-b border-neutral-200">
          <router-link to="/" class="flex items-center">
            <h1 :class="['font-bold text-primary-600 transition-all duration-300', isSidebarOpen ? 'text-xl' : 'text-sm']">
              {{ isSidebarOpen ? 'FAIT Co-op' : 'FC' }}
            </h1>
          </router-link>
          <button @click="toggleSidebar" class="p-1 rounded-md text-neutral-400 hover:text-neutral-500 hover:bg-neutral-100 focus:outline-none">
            <svg v-if="isSidebarOpen" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>

        <!-- User profile -->
        <div :class="['flex items-center p-4 border-b border-neutral-200', isSidebarOpen ? 'flex-row' : 'flex-col']">
          <Avatar :initials="userInitials" size="md" />
          <div v-if="isSidebarOpen" class="ml-3 overflow-hidden">
            <p class="text-sm font-medium text-neutral-900 truncate">{{ userDisplayName }}</p>
            <p class="text-xs text-neutral-500 truncate">{{ userRoleDisplay }}</p>
          </div>
        </div>

        <!-- Navigation -->
        <nav class="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          <router-link
            v-for="item in navItems"
            :key="item.name"
            :to="item.path"
            :class="[
              $route.path === item.path
                ? 'bg-primary-50 text-primary-600'
                : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900',
              'group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-200'
            ]"
          >
            <span class="mr-3 flex-shrink-0">
              <!-- Home icon -->
              <svg v-if="item.icon === 'home'" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
              <!-- Users icon -->
              <svg v-else-if="item.icon === 'users'" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
              </svg>
              <!-- Briefcase icon -->
              <svg v-else-if="item.icon === 'briefcase'" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clip-rule="evenodd" />
                <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
              </svg>
              <!-- User icon -->
              <svg v-else-if="item.icon === 'user'" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
              </svg>
              <!-- Message circle icon -->
              <svg v-else-if="item.icon === 'message-circle'" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clip-rule="evenodd" />
              </svg>
              <!-- Calendar icon -->
              <svg v-else-if="item.icon === 'calendar'" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd" />
              </svg>
              <!-- Chart bar icon -->
              <svg v-else-if="item.icon === 'chart-bar'" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
              </svg>
              <!-- Cog icon -->
              <svg v-else-if="item.icon === 'cog'" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd" />
              </svg>
              <!-- Plus circle icon -->
              <svg v-else-if="item.icon === 'plus-circle'" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clip-rule="evenodd" />
              </svg>
              <!-- Default icon -->
              <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd" />
              </svg>
            </span>
            <span v-if="isSidebarOpen" class="truncate">{{ item.name }}</span>
          </router-link>

          <button
            @click="handleSignOut"
            class="w-full text-left text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-200"
          >
            <span class="mr-3 flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H3zm11 3a1 1 0 10-2 0v6.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L14 12.586V6z" clip-rule="evenodd" />
              </svg>
            </span>
            <span v-if="isSidebarOpen" class="truncate">Sign Out</span>
          </button>
        </nav>
      </div>
    </aside>

    <!-- Main content -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- Header -->
      <header class="bg-white shadow-sm z-10">
        <div class="px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <h1 class="text-2xl font-semibold text-neutral-900">
            <slot name="header">Dashboard</slot>
          </h1>

          <div class="flex items-center space-x-4">
            <!-- Notifications -->
            <button class="p-1 rounded-full text-neutral-400 hover:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
              <span class="sr-only">View notifications</span>
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>

            <!-- Help -->
            <button class="p-1 rounded-full text-neutral-400 hover:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
              <span class="sr-only">Help</span>
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <!-- Page content -->
      <main class="flex-1 overflow-y-auto bg-neutral-50 p-4 sm:p-6 lg:p-8">
        <slot></slot>
      </main>

      <!-- Footer -->
      <footer class="bg-white border-t border-neutral-200 py-4">
        <div class="px-4 sm:px-6 lg:px-8">
          <p class="text-center text-neutral-500 text-sm">
            &copy; {{ new Date().getFullYear() }} FAIT Co-op. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  </div>
</template>

<style scoped>
/* Transition for sidebar */
.sidebar-enter-active,
.sidebar-leave-active {
  transition: width 0.3s ease-out;
}

.sidebar-enter-from,
.sidebar-leave-to {
  width: 0;
}
</style>
