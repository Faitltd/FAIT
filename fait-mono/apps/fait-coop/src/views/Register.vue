<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import Button from '../components/ui/Button.vue'
import MainLayout from '../components/layout/MainLayout.vue'

const auth = useAuthStore()
const router = useRouter()

// Form data
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const fullName = ref('')
const userType = ref('client')
const formError = ref('')
const isSubmitting = ref(false)

// Handle form submission
const handleSubmit = async () => {
  // Reset error
  formError.value = ''

  // Validate form
  if (!email.value || !password.value || !confirmPassword.value || !fullName.value) {
    formError.value = 'Please fill in all fields'
    return
  }

  if (password.value !== confirmPassword.value) {
    formError.value = 'Passwords do not match'
    return
  }

  if (password.value.length < 8) {
    formError.value = 'Password must be at least 8 characters long'
    return
  }

  // Submit form
  isSubmitting.value = true
  try {
    const userData = {
      full_name: fullName.value,
      user_type: userType.value
    }

    const { success, error } = await auth.signUp(email.value, password.value, userData)

    if (success) {
      // Redirect to dashboard
      router.push('/dashboard')
    } else {
      formError.value = error || 'Registration failed'
    }
  } catch (err: any) {
    formError.value = err.message || 'An error occurred during registration'
  } finally {
    isSubmitting.value = false
  }
}

// Navigate to login page
const navigateToLogin = () => {
  router.push('/login')
}
</script>

<template>
  <MainLayout>
    <div class="min-h-screen bg-neutral-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <h1 class="text-center text-3xl font-bold text-primary-600">FAIT Co-op</h1>
      <h2 class="mt-6 text-center text-2xl font-bold text-neutral-900">Create your account</h2>
      <p class="mt-2 text-center text-sm text-neutral-600">
        Or
        <a @click="navigateToLogin" class="font-medium text-primary-600 hover:text-primary-500 cursor-pointer">
          sign in to your existing account
        </a>
      </p>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
        <!-- Error message -->
        <div v-if="formError" class="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
          {{ formError }}
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Full Name field -->
          <div>
            <label for="full-name" class="block text-sm font-medium text-neutral-700">Full name</label>
            <div class="mt-1">
              <input
                id="full-name"
                v-model="fullName"
                name="full-name"
                type="text"
                autocomplete="name"
                required
                class="form-input"
              />
            </div>
          </div>

          <!-- Email field -->
          <div>
            <label for="email" class="block text-sm font-medium text-neutral-700">Email address</label>
            <div class="mt-1">
              <input
                id="email"
                v-model="email"
                name="email"
                type="email"
                autocomplete="email"
                required
                class="form-input"
              />
            </div>
          </div>

          <!-- Password field -->
          <div>
            <label for="password" class="block text-sm font-medium text-neutral-700">Password</label>
            <div class="mt-1">
              <input
                id="password"
                v-model="password"
                name="password"
                type="password"
                autocomplete="new-password"
                required
                class="form-input"
              />
            </div>
          </div>

          <!-- Confirm Password field -->
          <div>
            <label for="confirm-password" class="block text-sm font-medium text-neutral-700">Confirm password</label>
            <div class="mt-1">
              <input
                id="confirm-password"
                v-model="confirmPassword"
                name="confirm-password"
                type="password"
                autocomplete="new-password"
                required
                class="form-input"
              />
            </div>
          </div>

          <!-- User Type field -->
          <div>
            <label for="user-type" class="block text-sm font-medium text-neutral-700">I am a</label>
            <div class="mt-1">
              <select
                id="user-type"
                v-model="userType"
                name="user-type"
                required
                class="form-input"
              >
                <option value="client">Client looking for services</option>
                <option value="service_agent">Service provider</option>
              </select>
            </div>
          </div>

          <!-- Terms and conditions -->
          <div class="flex items-center">
            <input
              id="terms"
              name="terms"
              type="checkbox"
              required
              class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded"
            />
            <label for="terms" class="ml-2 block text-sm text-neutral-700">
              I agree to the
              <a href="#" class="font-medium text-primary-600 hover:text-primary-500">Terms and Conditions</a>
              and
              <a href="#" class="font-medium text-primary-600 hover:text-primary-500">Privacy Policy</a>
            </label>
          </div>

          <!-- Submit button -->
          <div>
            <Button
              type="submit"
              variant="primary"
              :loading="isSubmitting"
              :disabled="isSubmitting"
              fullWidth
            >
              Create account
            </Button>
          </div>
        </form>
      </div>
    </div>
  </MainLayout>
</template>
