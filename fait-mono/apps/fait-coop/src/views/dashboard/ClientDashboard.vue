<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import Button from '../../components/ui/Button.vue'

const auth = useAuthStore()
const router = useRouter()

// Handle sign out
const handleSignOut = async () => {
  await auth.signOut()
  router.push('/')
}

// Mock data for projects
const projects = ref([
  {
    id: 1,
    title: 'Kitchen Renovation',
    status: 'In Progress',
    progress: 65,
    contractor: 'ABC Renovations',
    startDate: '2023-04-15',
    endDate: '2023-06-30'
  },
  {
    id: 2,
    title: 'Bathroom Remodel',
    status: 'Pending',
    progress: 0,
    contractor: 'XYZ Contractors',
    startDate: '2023-07-01',
    endDate: '2023-08-15'
  },
  {
    id: 3,
    title: 'Deck Installation',
    status: 'Completed',
    progress: 100,
    contractor: 'Outdoor Living Pros',
    startDate: '2023-03-10',
    endDate: '2023-04-05'
  }
])

// Mock data for tokens
const tokens = ref({
  balance: 250,
  earned: 350,
  spent: 100,
  history: [
    { id: 1, date: '2023-05-15', amount: 50, type: 'earned', description: 'Project completion' },
    { id: 2, date: '2023-05-10', amount: -25, type: 'spent', description: 'Service discount' },
    { id: 3, date: '2023-05-01', amount: 75, type: 'earned', description: 'Referral bonus' }
  ]
})
</script>

<template>
  <div class="min-h-screen bg-neutral-50">
    <!-- Header -->
    <header class="bg-white shadow-sm">
      <div class="container-wide py-4 flex items-center justify-between">
        <div class="flex items-center">
          <h1 class="text-2xl font-bold text-primary-600">FAIT Co-op</h1>
          <span class="ml-4 text-sm font-medium text-neutral-500">Client Dashboard</span>
        </div>
        <nav class="flex items-center space-x-4">
          <router-link to="/" class="text-neutral-700 hover:text-primary-600">Home</router-link>
          <div class="flex items-center">
            <span class="mr-2 text-sm text-neutral-600">{{ auth.user?.email }}</span>
            <Button @click="handleSignOut" variant="outline" size="sm">Sign Out</Button>
          </div>
        </nav>
      </div>
    </header>

    <!-- Main content -->
    <main class="container-wide py-8">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Sidebar -->
        <div class="lg:col-span-1">
          <div class="bg-white shadow rounded-lg p-6 mb-6">
            <div class="flex items-center mb-4">
              <div class="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                <span class="text-xl font-bold text-primary-600">{{ auth.user?.full_name?.[0] || auth.user?.email?.[0] || 'U' }}</span>
              </div>
              <div class="ml-4">
                <h2 class="text-lg font-semibold">{{ auth.user?.full_name || 'User' }}</h2>
                <p class="text-sm text-neutral-500">{{ auth.user?.email }}</p>
              </div>
            </div>
            
            <div class="border-t border-neutral-200 pt-4 mt-4">
              <h3 class="text-md font-semibold mb-2">Tokens of Good FAIT</h3>
              <div class="bg-primary-50 p-3 rounded-md">
                <div class="flex justify-between mb-1">
                  <span class="text-sm text-neutral-600">Balance</span>
                  <span class="text-sm font-semibold">{{ tokens.balance }}</span>
                </div>
                <div class="flex justify-between mb-1">
                  <span class="text-sm text-neutral-600">Earned</span>
                  <span class="text-sm font-semibold text-green-600">+{{ tokens.earned }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-sm text-neutral-600">Spent</span>
                  <span class="text-sm font-semibold text-red-600">-{{ tokens.spent }}</span>
                </div>
              </div>
            </div>
            
            <div class="border-t border-neutral-200 pt-4 mt-4">
              <h3 class="text-md font-semibold mb-2">Quick Links</h3>
              <ul class="space-y-2">
                <li>
                  <a href="#" class="text-sm text-primary-600 hover:text-primary-700">New Project Request</a>
                </li>
                <li>
                  <a href="#" class="text-sm text-primary-600 hover:text-primary-700">Find Contractors</a>
                </li>
                <li>
                  <a href="#" class="text-sm text-primary-600 hover:text-primary-700">Community Forum</a>
                </li>
                <li>
                  <a href="#" class="text-sm text-primary-600 hover:text-primary-700">Account Settings</a>
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        <!-- Main content area -->
        <div class="lg:col-span-2">
          <div class="bg-white shadow rounded-lg p-6 mb-6">
            <h2 class="text-xl font-bold mb-4">My Projects</h2>
            
            <div v-if="projects.length === 0" class="text-center py-8">
              <p class="text-neutral-500">You don't have any projects yet.</p>
              <Button class="mt-4" variant="primary">Start a New Project</Button>
            </div>
            
            <div v-else class="space-y-4">
              <div v-for="project in projects" :key="project.id" class="border border-neutral-200 rounded-lg p-4">
                <div class="flex justify-between items-start">
                  <div>
                    <h3 class="text-lg font-semibold">{{ project.title }}</h3>
                    <p class="text-sm text-neutral-500">Contractor: {{ project.contractor }}</p>
                  </div>
                  <div>
                    <span 
                      :class="{
                        'bg-yellow-100 text-yellow-800': project.status === 'In Progress',
                        'bg-blue-100 text-blue-800': project.status === 'Pending',
                        'bg-green-100 text-green-800': project.status === 'Completed'
                      }"
                      class="px-2 py-1 text-xs font-medium rounded-full"
                    >
                      {{ project.status }}
                    </span>
                  </div>
                </div>
                
                <div class="mt-3">
                  <div class="flex justify-between text-xs text-neutral-500 mb-1">
                    <span>Progress</span>
                    <span>{{ project.progress }}%</span>
                  </div>
                  <div class="w-full bg-neutral-200 rounded-full h-2">
                    <div 
                      class="bg-primary-600 h-2 rounded-full" 
                      :style="{ width: `${project.progress}%` }"
                    ></div>
                  </div>
                </div>
                
                <div class="mt-3 flex justify-between text-xs text-neutral-500">
                  <span>Start: {{ project.startDate }}</span>
                  <span>End: {{ project.endDate }}</span>
                </div>
                
                <div class="mt-3">
                  <Button variant="outline" size="sm">View Details</Button>
                </div>
              </div>
            </div>
            
            <div class="mt-6 text-center">
              <Button variant="primary">Start a New Project</Button>
            </div>
          </div>
          
          <div class="bg-white shadow rounded-lg p-6">
            <h2 class="text-xl font-bold mb-4">Recent Activity</h2>
            
            <div class="space-y-4">
              <div v-for="(transaction, index) in tokens.history" :key="transaction.id" class="flex items-start">
                <div 
                  :class="{
                    'bg-green-100 text-green-600': transaction.type === 'earned',
                    'bg-red-100 text-red-600': transaction.type === 'spent'
                  }"
                  class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                >
                  <svg v-if="transaction.type === 'earned'" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
                  </svg>
                </div>
                <div class="ml-4 flex-1">
                  <div class="flex justify-between">
                    <p class="text-sm font-medium">{{ transaction.description }}</p>
                    <p 
                      :class="{
                        'text-green-600': transaction.type === 'earned',
                        'text-red-600': transaction.type === 'spent'
                      }"
                      class="text-sm font-semibold"
                    >
                      {{ transaction.type === 'earned' ? '+' : '' }}{{ transaction.amount }}
                    </p>
                  </div>
                  <p class="text-xs text-neutral-500">{{ transaction.date }}</p>
                </div>
              </div>
            </div>
            
            <div class="mt-4 text-center">
              <a href="#" class="text-sm text-primary-600 hover:text-primary-700">View All Activity</a>
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
