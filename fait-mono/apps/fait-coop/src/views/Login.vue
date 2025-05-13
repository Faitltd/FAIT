<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import Button from '../components/ui/Button.vue'
import MainLayout from '../components/layout/MainLayout.vue'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

// Form data
const email = ref('')
const password = ref('')
const rememberMe = ref(false)
const formError = ref('')
const isSubmitting = ref(false)

// Handle form submission
const handleSubmit = async () => {
  // Reset error
  formError.value = ''

  // Validate form
  if (!email.value || !password.value) {
    formError.value = 'Please enter both email and password'
    return
  }

  // Submit form
  isSubmitting.value = true
  try {
    const { success, error } = await auth.signIn(email.value, password.value)

    if (success) {
      // Redirect to dashboard or requested page
      const redirectPath = route.query.redirect?.toString() || '/dashboard'
      router.push(redirectPath)
    } else {
      formError.value = error || 'Invalid email or password'
    }
  } catch (err: any) {
    formError.value = err.message || 'An error occurred during login'
  } finally {
    isSubmitting.value = false
  }
}

// Navigate to register page
const navigateToRegister = () => {
  router.push('/register')
}
</script>

<template>
  <MainLayout>
    <div class="min-h-screen bg-neutral-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <h1 class="text-center text-3xl font-bold text-primary-600">FAIT Co-op</h1>
      <h2 class="mt-6 text-center text-2xl font-bold text-neutral-900">Sign in to your account</h2>
      <p class="mt-2 text-center text-sm text-neutral-600">
        Or
        <a @click="navigateToRegister" class="font-medium text-primary-600 hover:text-primary-500 cursor-pointer">
          create a new account
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
                autocomplete="current-password"
                required
                class="form-input"
              />
            </div>
          </div>

          <!-- Remember me & Forgot password -->
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <input
                id="remember-me"
                v-model="rememberMe"
                name="remember-me"
                type="checkbox"
                class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded"
              />
              <label for="remember-me" class="ml-2 block text-sm text-neutral-700">
                Remember me
              </label>
            </div>

            <div class="text-sm">
              <router-link to="/forgot-password" class="font-medium text-primary-600 hover:text-primary-500">
                Forgot your password?
              </router-link>
            </div>
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
              Sign in
            </Button>
          </div>
        </form>
      </div>
    </div>
  </MainLayout>
</template>
