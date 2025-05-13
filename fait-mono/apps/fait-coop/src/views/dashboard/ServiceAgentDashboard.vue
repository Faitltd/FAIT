<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import Button from '../../components/ui/Button.vue'

const auth = useAuthStore()
const router = useRouter()
const isLoading = ref(true)
const activeRequests = ref([
  {
    id: 'req-001',
    client: 'John Doe',
    service: 'Home Renovation',
    status: 'Pending',
    date: '2023-06-15'
  },
  {
    id: 'req-002',
    client: 'Jane Smith',
    service: 'Plumbing Repair',
    status: 'In Progress',
    date: '2023-06-18'
  },
  {
    id: 'req-003',
    client: 'Robert Johnson',
    service: 'Electrical Work',
    status: 'Pending',
    date: '2023-06-20'
  }
])

// Handle sign out
const handleSignOut = async () => {
  await auth.signOut()
  router.push('/')
}

// Navigate back to main dashboard
const navigateToDashboard = () => {
  router.push('/dashboard')
}

onMounted(() => {
  // Simulate loading data
  setTimeout(() => {
    isLoading.value = false
  }, 1000)
})
</script>

<template>
  <div class="min-h-screen bg-neutral-50 flex flex-col">
    <!-- Header -->
    <header class="bg-white shadow-sm">
      <div class="container-wide py-4 flex items-center justify-between">
        <div class="flex items-center">
          <h1 class="text-2xl font-bold text-primary-600">FAIT Co-op</h1>
        </div>
        <nav class="flex items-center space-x-4">
          <router-link to="/" class="text-neutral-700 hover:text-primary-600">Home</router-link>
          <Button @click="navigateToDashboard" variant="outline" size="sm">Dashboard</Button>
          <Button @click="handleSignOut" variant="outline" size="sm">Sign Out</Button>
        </nav>
      </div>
    </header>

    <!-- Main content -->
    <main class="container-wide py-8 flex-grow">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-2xl font-bold text-neutral-900">Service Agent Dashboard</h2>
      </div>

      <!-- Loading state -->
      <div v-if="isLoading" class="flex justify-center items-center h-64">
        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>

      <!-- Dashboard content -->
      <div v-else class="space-y-8">
        <!-- Stats overview -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="bg-white p-6 rounded-lg shadow-card">
            <h3 class="text-lg font-semibold mb-2 text-neutral-700">Active Requests</h3>
            <p class="text-3xl font-bold text-primary-600">{{ activeRequests.length }}</p>
          </div>
          
          <div class="bg-white p-6 rounded-lg shadow-card">
            <h3 class="text-lg font-semibold mb-2 text-neutral-700">Completed Jobs</h3>
            <p class="text-3xl font-bold text-secondary-600">12</p>
          </div>
          
          <div class="bg-white p-6 rounded-lg shadow-card">
            <h3 class="text-lg font-semibold mb-2 text-neutral-700">Client Rating</h3>
            <p class="text-3xl font-bold text-accent-600">4.8/5</p>
          </div>
        </div>

        <!-- Active requests -->
        <div class="bg-white rounded-lg shadow-card overflow-hidden">
          <div class="p-6 border-b border-neutral-200">
            <h3 class="text-lg font-semibold text-neutral-900">Active Service Requests</h3>
          </div>
          
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-neutral-200">
              <thead class="bg-neutral-50">
                <tr>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Request ID
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Service
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-neutral-200">
                <tr v-for="request in activeRequests" :key="request.id">
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900">
                    {{ request.id }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-neutral-700">
                    {{ request.client }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-neutral-700">
                    {{ request.service }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span 
                      :class="{
                        'px-2 py-1 text-xs font-medium rounded-full': true,
                        'bg-yellow-100 text-yellow-800': request.status === 'Pending',
                        'bg-blue-100 text-blue-800': request.status === 'In Progress',
                        'bg-green-100 text-green-800': request.status === 'Completed'
                      }"
                    >
                      {{ request.status }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-neutral-700">
                    {{ request.date }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-neutral-700">
                    <Button variant="secondary" size="sm">View Details</Button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>

    <!-- Footer -->
    <footer class="bg-white border-t border-neutral-200 py-6 mt-auto">
      <div class="container-wide">
        <p class="text-center text-neutral-500 text-sm">
          &copy; {{ new Date().getFullYear() }} FAIT Co-op. All rights reserved.
        </p>
      </div>
    </footer>
  </div>
</template>
