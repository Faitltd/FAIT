<script setup lang="ts">
import { useAuthStore } from '../stores/auth'
import Button from '../components/ui/Button.vue'
import Navbar from '../components/layout/Navbar.vue'
import Footer from '../components/layout/Footer.vue'
import { useRouter } from 'vue-router'

const auth = useAuthStore()
const router = useRouter()

const navigateToLogin = () => {
  router.push('/login')
}

const navigateToRegister = () => {
  router.push('/register')
}

const navigateToDashboard = () => {
  router.push('/dashboard')
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-primary-50 to-white">
    <!-- Header -->
    <Navbar />

    <!-- Hero Section -->
    <section class="py-16 md:py-24">
      <div class="container-wide">
        <div class="max-w-3xl mx-auto text-center">
          <h1 class="heading-1 mb-6 text-primary-900">Welcome to FAIT Co-op Platform</h1>
          <p class="text-body mb-8">
            A cooperative platform emphasizing trust, transparency, and community, with a 'Tokens of Good FAIT' reward system and democratic governance model.
          </p>
          <div class="flex flex-col sm:flex-row justify-center gap-4">
            <Button @click="navigateToRegister" variant="primary" size="lg">Join the Co-op</Button>
            <Button @click="navigateToLogin" variant="outline" size="lg">Member Login</Button>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="py-16 bg-white">
      <div class="container-wide">
        <h2 class="heading-2 text-center mb-12">Why Choose FAIT Co-op?</h2>
        <div class="grid md:grid-cols-3 gap-8">
          <div class="bg-white p-6 rounded-lg shadow-card hover:shadow-card-hover transition-shadow">
            <div class="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 class="text-xl font-semibold mb-2">Trust & Transparency</h3>
            <p class="text-neutral-600">We prioritize open communication and honest business practices in all our interactions.</p>
          </div>

          <div class="bg-white p-6 rounded-lg shadow-card hover:shadow-card-hover transition-shadow">
            <div class="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 class="text-xl font-semibold mb-2">Community-Driven</h3>
            <p class="text-neutral-600">Our cooperative model ensures that members have a voice in governance and decision-making.</p>
          </div>

          <div class="bg-white p-6 rounded-lg shadow-card hover:shadow-card-hover transition-shadow">
            <div class="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 class="text-xl font-semibold mb-2">Tokens of Good FAIT</h3>
            <p class="text-neutral-600">Earn rewards through trustworthy behavior and redeem them for discounts, perks, and more.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <Footer />
  </div>
</template>
