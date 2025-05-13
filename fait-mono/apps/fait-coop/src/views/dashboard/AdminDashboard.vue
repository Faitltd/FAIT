<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import Button from '../../components/ui/Button.vue'

const auth = useAuthStore()
const router = useRouter()
const isLoading = ref(true)
const users = ref([
  {
    id: 'user-001',
    name: 'John Doe',
    email: 'john@example.com',
    type: 'client',
    joinDate: '2023-01-15'
  },
  {
    id: 'user-002',
    name: 'Jane Smith',
    email: 'jane@example.com',
    type: 'service_agent',
    joinDate: '2023-02-20'
  },
  {
    id: 'user-003',
    name: 'Robert Johnson',
    email: 'robert@example.com',
    type: 'client',
    joinDate: '2023-03-05'
  },
  {
    id: 'user-004',
    name: 'Sarah Williams',
    email: 'sarah@example.com',
    type: 'service_agent',
    joinDate: '2023-03-12'
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
        <h2 class="text-2xl font-bold text-neutral-900">Admin Dashboard</h2>
      </div>

      <!-- Loading state -->
      <div v-if="isLoading" class="flex justify-center items-center h-64">
        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>

      <!-- Dashboard content -->
      <div v-else class="space-y-8">
        <!-- Stats overview -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div class="bg-white p-6 rounded-lg shadow-card">
            <h3 class="text-lg font-semibold mb-2 text-neutral-700">Total Users</h3>
            <p class="text-3xl font-bold text-primary-600">{{ users.length }}</p>
          </div>
          
          <div class="bg-white p-6 rounded-lg shadow-card">
            <h3 class="text-lg font-semibold mb-2 text-neutral-700">Active Services</h3>
            <p class="text-3xl font-bold text-secondary-600">24</p>
          </div>
          
          <div class="bg-white p-6 rounded-lg shadow-card">
            <h3 class="text-lg font-semibold mb-2 text-neutral-700">Total Revenue</h3>
            <p class="text-3xl font-bold text-accent-600">$12,450</p>
          </div>
          
          <div class="bg-white p-6 rounded-lg shadow-card">
            <h3 class="text-lg font-semibold mb-2 text-neutral-700">Pending Approvals</h3>
            <p class="text-3xl font-bold text-neutral-600">5</p>
          </div>
        </div>

        <!-- User management -->
        <div class="bg-white rounded-lg shadow-card overflow-hidden">
          <div class="p-6 border-b border-neutral-200 flex justify-between items-center">
            <h3 class="text-lg font-semibold text-neutral-900">User Management</h3>
            <Button variant="primary" size="sm">Add New User</Button>
          </div>
          
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-neutral-200">
              <thead class="bg-neutral-50">
                <tr>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Join Date
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-neutral-200">
                <tr v-for="user in users" :key="user.id">
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900">
                    {{ user.name }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-neutral-700">
                    {{ user.email }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span 
                      :class="{
                        'px-2 py-1 text-xs font-medium rounded-full': true,
                        'bg-blue-100 text-blue-800': user.type === 'client',
                        'bg-green-100 text-green-800': user.type === 'service_agent',
                        'bg-purple-100 text-purple-800': user.type === 'admin'
                      }"
                    >
                      {{ user.type.replace('_', ' ') }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-neutral-700">
                    {{ user.joinDate }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-neutral-700 space-x-2">
                    <Button variant="secondary" size="sm">Edit</Button>
                    <Button variant="outline" size="sm">Delete</Button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- System settings -->
        <div class="bg-white rounded-lg shadow-card p-6">
          <h3 class="text-lg font-semibold mb-4 text-neutral-900">System Settings</h3>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="border border-neutral-200 rounded-lg p-4">
              <h4 class="font-semibold mb-2">Platform Configuration</h4>
              <p class="text-sm text-neutral-600 mb-4">Manage global platform settings and configurations.</p>
              <Button variant="outline" size="sm">Manage Settings</Button>
            </div>
            
            <div class="border border-neutral-200 rounded-lg p-4">
              <h4 class="font-semibold mb-2">Service Categories</h4>
              <p class="text-sm text-neutral-600 mb-4">Manage service categories and classifications.</p>
              <Button variant="outline" size="sm">Manage Categories</Button>
            </div>
            
            <div class="border border-neutral-200 rounded-lg p-4">
              <h4 class="font-semibold mb-2">Token Economy</h4>
              <p class="text-sm text-neutral-600 mb-4">Configure token rewards and redemption options.</p>
              <Button variant="outline" size="sm">Manage Tokens</Button>
            </div>
            
            <div class="border border-neutral-200 rounded-lg p-4">
              <h4 class="font-semibold mb-2">Backup & Restore</h4>
              <p class="text-sm text-neutral-600 mb-4">Manage system backups and restoration points.</p>
              <Button variant="outline" size="sm">Backup Now</Button>
            </div>
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
