<script setup lang="ts">
import { useRouter } from 'vue-router'
import Button from '../components/ui/Button.vue'
import Navbar from '../components/layout/Navbar.vue'
import Footer from '../components/layout/Footer.vue'
import MainLayout from '../components/layout/MainLayout.vue'

const router = useRouter()

const navigateToRegister = () => {
  router.push('/register')
}
</script>

<template>
  <MainLayout>

    <!-- Hero Section -->
    <section class="py-16 bg-primary-50">
      <div class="container-wide">
        <div class="max-w-3xl mx-auto text-center">
          <h1 class="heading-1 mb-6 text-primary-900">About FAIT Co-op</h1>
          <p class="text-body mb-8">
            FAIT is a cooperative platform emphasizing trust, transparency, and community, with a 'Tokens of Good FAIT' reward system and democratic governance model, starting in Denver with plans to expand nationwide.
          </p>
        </div>
      </div>
    </section>

    <!-- Mission Section -->
    <section class="py-16 bg-white">
      <div class="container-wide">
        <div class="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 class="heading-2 mb-6">Our Mission</h2>
            <p class="text-body mb-4">
              FAIT Co-op was founded with a simple mission: to create a platform where trust, transparency, and community values are at the forefront of every interaction.
            </p>
            <p class="text-body mb-4">
              We believe that by building a cooperative model, we can create a more equitable system where both service providers and clients benefit from fair practices and shared governance.
            </p>
            <p class="text-body">
              Our 'Tokens of Good FAIT' reward system encourages trustworthy behavior and allows members to earn benefits through positive contributions to the community.
            </p>
          </div>
          <div class="bg-neutral-100 p-8 rounded-lg">
            <h3 class="text-xl font-semibold mb-4">Core Values</h3>
            <ul class="space-y-4">
              <li class="flex items-start">
                <div class="flex-shrink-0 h-6 w-6 text-primary-600">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p class="ml-3 text-neutral-700"><strong>Trust:</strong> Building relationships based on reliability and integrity</p>
              </li>
              <li class="flex items-start">
                <div class="flex-shrink-0 h-6 w-6 text-primary-600">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p class="ml-3 text-neutral-700"><strong>Transparency:</strong> Open communication and honest business practices</p>
              </li>
              <li class="flex items-start">
                <div class="flex-shrink-0 h-6 w-6 text-primary-600">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p class="ml-3 text-neutral-700"><strong>Community:</strong> Fostering connections and mutual support</p>
              </li>
              <li class="flex items-start">
                <div class="flex-shrink-0 h-6 w-6 text-primary-600">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p class="ml-3 text-neutral-700"><strong>Equity:</strong> Ensuring fair treatment and opportunities for all members</p>
              </li>
              <li class="flex items-start">
                <div class="flex-shrink-0 h-6 w-6 text-primary-600">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p class="ml-3 text-neutral-700"><strong>Innovation:</strong> Continuously improving our platform and services</p>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>

  </MainLayout>
</template>
