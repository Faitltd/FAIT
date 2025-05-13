<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import Button from '../components/ui/Button.vue'
import DashboardLayout from '../components/layout/DashboardLayout.vue'

const auth = useAuthStore()
const router = useRouter()
const isLoading = ref(true)

// Handle sign out
const handleSignOut = async () => {
  await auth.signOut()
  router.push('/')
}

// Redirect based on user type
onMounted(() => {
  isLoading.value = true

  // Check user type and redirect to appropriate dashboard
  if (auth.userType === 'admin') {
    router.push('/dashboard/admin')
  } else if (auth.userType === 'service_agent') {
    router.push('/dashboard/service-agent')
  } else if (auth.userType === 'client') {
    router.push('/dashboard/client')
  }

  isLoading.value = false
})
</script>

<template>
  <DashboardLayout>
    <!-- Main content -->
      <div v-if="isLoading" class="flex justify-center items-center h-64">
        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>

      <div v-else class="bg-white shadow rounded-lg p-6">
        <h2 class="text-2xl font-bold mb-6">Dashboard</h2>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="bg-primary-50 p-6 rounded-lg">
            <h3 class="text-lg font-semibold mb-2">Client Dashboard</h3>
            <p class="text-neutral-600 mb-4">Access your client dashboard to manage projects and services.</p>
            <router-link to="/dashboard/client">
              <Button variant="primary" size="sm">Go to Client Dashboard</Button>
            </router-link>
          </div>

          <div class="bg-secondary-50 p-6 rounded-lg">
            <h3 class="text-lg font-semibold mb-2">Service Agent Dashboard</h3>
            <p class="text-neutral-600 mb-4">Access your service agent dashboard to manage client requests.</p>
            <router-link to="/dashboard/service-agent">
              <Button variant="secondary" size="sm">Go to Service Agent Dashboard</Button>
            </router-link>
          </div>

          <div class="bg-accent-50 p-6 rounded-lg">
            <h3 class="text-lg font-semibold mb-2">Admin Dashboard</h3>
            <p class="text-neutral-600 mb-4">Access the admin dashboard to manage the platform.</p>
            <router-link to="/dashboard/admin">
              <Button variant="outline" size="sm">Go to Admin Dashboard</Button>
            </router-link>
          </div>
        </div>
      </div>
  </DashboardLayout>
</template>
