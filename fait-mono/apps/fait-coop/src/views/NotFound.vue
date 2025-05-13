<script setup lang="ts">
import { useRouter } from 'vue-router'
import Button from '../components/ui/Button.vue'

const router = useRouter()

const goHome = () => {
  router.push('/')
}

const goBack = () => {
  router.back()
}
</script>

<template>
  <div class="min-h-screen bg-neutral-50 flex flex-col justify-center items-center px-4 py-12">
    <div class="text-center">
      <h1 class="text-9xl font-bold text-primary-600">404</h1>
      <h2 class="mt-4 text-3xl font-bold text-neutral-900">Page Not Found</h2>
      <p class="mt-2 text-lg text-neutral-600">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <div class="mt-8 flex flex-col sm:flex-row justify-center gap-4">
        <Button @click="goHome" variant="primary">Go Home</Button>
        <Button @click="goBack" variant="outline">Go Back</Button>
      </div>
    </div>
  </div>
</template>
