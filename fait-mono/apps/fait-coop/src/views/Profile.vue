<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuthStore } from '../stores/auth'
import MainLayout from '../components/layout/MainLayout.vue'
import Card from '../components/ui/Card.vue'
import Button from '../components/ui/Button.vue'
import Input from '../components/ui/Input.vue'
import Avatar from '../components/ui/Avatar.vue'
import Badge from '../components/ui/Badge.vue'

const auth = useAuthStore()
const activeTab = ref('profile')

// Form data
const formData = ref({
  fullName: auth.user?.full_name || '',
  email: auth.user?.email || '',
  phone: '',
  address: '',
  city: '',
  state: '',
  zip: '',
  bio: ''
})

// Form errors
const formErrors = ref({
  fullName: '',
  email: '',
  phone: '',
})

// Loading state
const isLoading = ref(false)

// User initials
const userInitials = computed(() => {
  if (formData.value.fullName) {
    return formData.value.fullName
      .split(' ')
      .map(word => word[0])
      .slice(0, 2)
      .join('')
      .toUpperCase()
  }
  return auth.user?.email.substring(0, 2).toUpperCase() || ''
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

// Set active tab
const setActiveTab = (tab: string) => {
  activeTab.value = tab
}

// Handle form submission
const handleSubmit = async () => {
  // Reset errors
  formErrors.value = {
    fullName: '',
    email: '',
    phone: '',
  }
  
  // Validate form
  let isValid = true
  
  if (!formData.value.fullName) {
    formErrors.value.fullName = 'Full name is required'
    isValid = false
  }
  
  if (!formData.value.email) {
    formErrors.value.email = 'Email is required'
    isValid = false
  } else if (!/^\S+@\S+\.\S+$/.test(formData.value.email)) {
    formErrors.value.email = 'Invalid email format'
    isValid = false
  }
  
  if (formData.value.phone && !/^\d{10}$/.test(formData.value.phone.replace(/\D/g, ''))) {
    formErrors.value.phone = 'Invalid phone number format'
    isValid = false
  }
  
  if (!isValid) return
  
  // Submit form
  isLoading.value = true
  
  try {
    // In a real app, you would update the user profile here
    // For now, we'll just simulate a delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Show success message
    alert('Profile updated successfully')
  } catch (error) {
    console.error('Error updating profile:', error)
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <MainLayout>
    <div class="container-wide py-8">
      <div class="max-w-4xl mx-auto">
        <div class="flex items-center justify-between mb-6">
          <h1 class="text-2xl font-bold text-neutral-900">My Profile</h1>
        </div>
        
        <div class="bg-white rounded-lg shadow overflow-hidden">
          <!-- Profile header -->
          <div class="bg-primary-600 h-32 relative">
            <div class="absolute -bottom-16 left-8">
              <Avatar :initials="userInitials" size="xl" />
            </div>
          </div>
          
          <div class="pt-20 pb-6 px-8">
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 class="text-2xl font-bold text-neutral-900">{{ formData.fullName || auth.user?.email }}</h2>
                <div class="flex items-center mt-1">
                  <Badge :variant="auth.userType === 'admin' ? 'primary' : auth.userType === 'service_agent' ? 'secondary' : 'success'">
                    {{ userRoleDisplay }}
                  </Badge>
                  <span class="ml-2 text-sm text-neutral-500">Member since {{ new Date().toLocaleDateString() }}</span>
                </div>
              </div>
              <div class="mt-4 sm:mt-0">
                <Button variant="primary" size="sm">Edit Profile Picture</Button>
              </div>
            </div>
          </div>
          
          <!-- Tabs -->
          <div class="border-b border-neutral-200">
            <nav class="flex -mb-px">
              <button
                @click="setActiveTab('profile')"
                :class="[
                  activeTab === 'profile'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300',
                  'whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm'
                ]"
              >
                Profile Information
              </button>
              <button
                @click="setActiveTab('security')"
                :class="[
                  activeTab === 'security'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300',
                  'whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm'
                ]"
              >
                Security
              </button>
              <button
                @click="setActiveTab('preferences')"
                :class="[
                  activeTab === 'preferences'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300',
                  'whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm'
                ]"
              >
                Preferences
              </button>
            </nav>
          </div>
          
          <!-- Tab content -->
          <div class="p-6">
            <!-- Profile Information Tab -->
            <div v-if="activeTab === 'profile'">
              <form @submit.prevent="handleSubmit">
                <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div class="sm:col-span-2">
                    <Input
                      v-model="formData.fullName"
                      label="Full Name"
                      placeholder="Enter your full name"
                      :error="formErrors.fullName"
                      required
                      fullWidth
                    />
                  </div>
                  
                  <div>
                    <Input
                      v-model="formData.email"
                      type="email"
                      label="Email Address"
                      placeholder="Enter your email"
                      :error="formErrors.email"
                      required
                      fullWidth
                    />
                  </div>
                  
                  <div>
                    <Input
                      v-model="formData.phone"
                      label="Phone Number"
                      placeholder="Enter your phone number"
                      :error="formErrors.phone"
                      fullWidth
                    />
                  </div>
                  
                  <div class="sm:col-span-2">
                    <Input
                      v-model="formData.address"
                      label="Address"
                      placeholder="Enter your address"
                      fullWidth
                    />
                  </div>
                  
                  <div>
                    <Input
                      v-model="formData.city"
                      label="City"
                      placeholder="Enter your city"
                      fullWidth
                    />
                  </div>
                  
                  <div class="grid grid-cols-2 gap-6">
                    <div>
                      <Input
                        v-model="formData.state"
                        label="State"
                        placeholder="State"
                        fullWidth
                      />
                    </div>
                    
                    <div>
                      <Input
                        v-model="formData.zip"
                        label="ZIP Code"
                        placeholder="ZIP"
                        fullWidth
                      />
                    </div>
                  </div>
                  
                  <div class="sm:col-span-2">
                    <label for="bio" class="block text-sm font-medium text-neutral-700 mb-1">Bio</label>
                    <textarea
                      id="bio"
                      v-model="formData.bio"
                      rows="4"
                      class="block w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm placeholder-neutral-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      placeholder="Tell us about yourself"
                    ></textarea>
                  </div>
                </div>
                
                <div class="mt-6 flex justify-end">
                  <Button type="submit" variant="primary" :loading="isLoading" :disabled="isLoading">
                    Save Changes
                  </Button>
                </div>
              </form>
            </div>
            
            <!-- Security Tab -->
            <div v-else-if="activeTab === 'security'">
              <Card variant="outline" padding="lg" class="mb-6">
                <h3 class="text-lg font-medium text-neutral-900 mb-4">Change Password</h3>
                <form>
                  <div class="space-y-4">
                    <Input
                      type="password"
                      label="Current Password"
                      placeholder="Enter your current password"
                      required
                      fullWidth
                    />
                    
                    <Input
                      type="password"
                      label="New Password"
                      placeholder="Enter your new password"
                      required
                      fullWidth
                    />
                    
                    <Input
                      type="password"
                      label="Confirm New Password"
                      placeholder="Confirm your new password"
                      required
                      fullWidth
                    />
                  </div>
                  
                  <div class="mt-6">
                    <Button type="submit" variant="primary">Update Password</Button>
                  </div>
                </form>
              </Card>
              
              <Card variant="outline" padding="lg">
                <h3 class="text-lg font-medium text-neutral-900 mb-4">Two-Factor Authentication</h3>
                <p class="text-neutral-600 mb-4">Add an extra layer of security to your account by enabling two-factor authentication.</p>
                <Button variant="outline">Enable 2FA</Button>
              </Card>
            </div>
            
            <!-- Preferences Tab -->
            <div v-else-if="activeTab === 'preferences'">
              <Card variant="outline" padding="lg" class="mb-6">
                <h3 class="text-lg font-medium text-neutral-900 mb-4">Email Notifications</h3>
                <div class="space-y-4">
                  <div class="flex items-start">
                    <div class="flex items-center h-5">
                      <input id="notifications-updates" type="checkbox" class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded" checked />
                    </div>
                    <div class="ml-3 text-sm">
                      <label for="notifications-updates" class="font-medium text-neutral-700">Product updates</label>
                      <p class="text-neutral-500">Get notified about new features and updates.</p>
                    </div>
                  </div>
                  
                  <div class="flex items-start">
                    <div class="flex items-center h-5">
                      <input id="notifications-messages" type="checkbox" class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded" checked />
                    </div>
                    <div class="ml-3 text-sm">
                      <label for="notifications-messages" class="font-medium text-neutral-700">Messages</label>
                      <p class="text-neutral-500">Get notified when you receive new messages.</p>
                    </div>
                  </div>
                  
                  <div class="flex items-start">
                    <div class="flex items-center h-5">
                      <input id="notifications-services" type="checkbox" class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded" />
                    </div>
                    <div class="ml-3 text-sm">
                      <label for="notifications-services" class="font-medium text-neutral-700">Service updates</label>
                      <p class="text-neutral-500">Get notified about updates to services you've requested.</p>
                    </div>
                  </div>
                </div>
              </Card>
              
              <Card variant="outline" padding="lg">
                <h3 class="text-lg font-medium text-neutral-900 mb-4">Language and Region</h3>
                <div class="space-y-4">
                  <div>
                    <label for="language" class="block text-sm font-medium text-neutral-700 mb-1">Language</label>
                    <select id="language" class="block w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm">
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                    </select>
                  </div>
                  
                  <div>
                    <label for="timezone" class="block text-sm font-medium text-neutral-700 mb-1">Timezone</label>
                    <select id="timezone" class="block w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm">
                      <option value="utc-8">Pacific Time (UTC-8)</option>
                      <option value="utc-7">Mountain Time (UTC-7)</option>
                      <option value="utc-6">Central Time (UTC-6)</option>
                      <option value="utc-5">Eastern Time (UTC-5)</option>
                    </select>
                  </div>
                </div>
                
                <div class="mt-6">
                  <Button variant="primary">Save Preferences</Button>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  </MainLayout>
</template>
