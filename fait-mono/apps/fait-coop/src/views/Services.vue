<script setup lang="ts">
import { ref } from 'vue'
import MainLayout from '../components/layout/MainLayout.vue'
import Card from '../components/ui/Card.vue'
import Button from '../components/ui/Button.vue'

// Services data
const services = ref([
  {
    id: 1,
    title: 'Home Improvement',
    description: 'Professional home improvement services from trusted contractors in our network.',
    icon: 'home',
    color: 'primary',
    features: [
      'Verified contractors',
      'Quality assurance',
      'Transparent pricing',
      'Project management'
    ]
  },
  {
    id: 2,
    title: 'Contractor Verification',
    description: 'Verify the credentials and reputation of contractors before hiring them.',
    icon: 'check-circle',
    color: 'secondary',
    features: [
      'Background checks',
      'License verification',
      'Insurance validation',
      'Performance history'
    ]
  },
  {
    id: 3,
    title: 'Warranty Claims',
    description: 'Streamlined process for filing and managing warranty claims for completed work.',
    icon: 'shield',
    color: 'accent',
    features: [
      'Easy claim filing',
      'Fast processing',
      'Fair resolution',
      'Transparent communication'
    ]
  },
  {
    id: 4,
    title: 'Community Forum',
    description: 'Connect with other homeowners and service providers in your community.',
    icon: 'users',
    color: 'primary',
    features: [
      'Local discussions',
      'Service recommendations',
      'DIY advice',
      'Community events'
    ]
  },
  {
    id: 5,
    title: 'Project Planning',
    description: 'Tools and resources to help you plan your home improvement projects.',
    icon: 'clipboard',
    color: 'secondary',
    features: [
      'Budget calculators',
      'Timeline planning',
      'Material estimators',
      'Design inspiration'
    ]
  },
  {
    id: 6,
    title: 'Emergency Services',
    description: 'Quick access to emergency home repair services when you need them most.',
    icon: 'alert-triangle',
    color: 'accent',
    features: [
      '24/7 availability',
      'Rapid response',
      'Qualified professionals',
      'Fair emergency rates'
    ]
  }
])

// Get icon name based on service type
const getIconName = (name: string) => {
  return name;
}

// Get color class based on color name
const getColorClass = (color: string) => {
  switch (color) {
    case 'primary':
      return 'text-primary-600'
    case 'secondary':
      return 'text-secondary-600'
    case 'accent':
      return 'text-accent-600'
    default:
      return 'text-neutral-600'
  }
}
</script>

<template>
  <MainLayout>
    <!-- Hero Section -->
    <section class="py-16 bg-primary-50">
      <div class="container-wide">
        <div class="max-w-3xl mx-auto text-center">
          <h1 class="heading-1 mb-6 text-primary-900">Our Services</h1>
          <p class="text-body mb-8">
            FAIT Co-op offers a range of services designed to make home improvement projects easier, more transparent, and more reliable for homeowners and service providers alike.
          </p>
        </div>
      </div>
    </section>

    <!-- Services Grid -->
    <section class="py-16 bg-white">
      <div class="container-wide">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div v-for="service in services" :key="service.id" class="group">
            <Card variant="outline" shadow="hover" padding="lg" class="h-full transition-all duration-300 transform group-hover:-translate-y-1">
              <div class="flex flex-col h-full">
                <div :class="['mb-6', getColorClass(service.color)]">
                  <!-- Home icon -->
                  <svg v-if="service.icon === 'home'" xmlns="http://www.w3.org/2000/svg" class="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  <!-- Check circle icon -->
                  <svg v-else-if="service.icon === 'check-circle'" xmlns="http://www.w3.org/2000/svg" class="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <!-- Shield icon -->
                  <svg v-else-if="service.icon === 'shield'" xmlns="http://www.w3.org/2000/svg" class="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <!-- Users icon -->
                  <svg v-else-if="service.icon === 'users'" xmlns="http://www.w3.org/2000/svg" class="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <!-- Clipboard icon -->
                  <svg v-else-if="service.icon === 'clipboard'" xmlns="http://www.w3.org/2000/svg" class="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <!-- Alert triangle icon -->
                  <svg v-else-if="service.icon === 'alert-triangle'" xmlns="http://www.w3.org/2000/svg" class="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <!-- Default icon -->
                  <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>

                <h3 class="text-xl font-semibold mb-3">{{ service.title }}</h3>
                <p class="text-neutral-600 mb-6">{{ service.description }}</p>

                <ul class="mb-6 space-y-2 flex-grow">
                  <li v-for="(feature, index) in service.features" :key="index" class="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-500 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                    </svg>
                    <span>{{ feature }}</span>
                  </li>
                </ul>

                <router-link :to="`/services/${service.title.toLowerCase().replace(/\s+/g, '-')}`">
                  <Button variant="primary" fullWidth>Learn More</Button>
                </router-link>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-16 bg-primary-50">
      <div class="container-wide">
        <div class="max-w-3xl mx-auto text-center">
          <h2 class="heading-2 mb-6 text-primary-900">Ready to Get Started?</h2>
          <p class="text-body mb-8">
            Join FAIT Co-op today and experience the difference our community-driven approach can make for your home improvement projects.
          </p>
          <div class="flex flex-col sm:flex-row justify-center gap-4">
            <router-link to="/register">
              <Button variant="primary" size="lg">Join the Co-op</Button>
            </router-link>
            <router-link to="/contact">
              <Button variant="outline" size="lg">Contact Us</Button>
            </router-link>
          </div>
        </div>
      </div>
    </section>
  </MainLayout>
</template>
