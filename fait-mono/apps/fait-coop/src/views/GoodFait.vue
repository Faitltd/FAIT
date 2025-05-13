<script setup lang="ts">
import { ref } from 'vue'
import MainLayout from '../components/layout/MainLayout.vue'
import Card from '../components/ui/Card.vue'
import Button from '../components/ui/Button.vue'
import Badge from '../components/ui/Badge.vue'

// Token economy data
const tokenStats = ref({
  totalTokens: 1250000,
  activeUsers: 3750,
  averageHolding: 333,
  projectsCompleted: 850
})

// Token benefits
const tokenBenefits = ref([
  {
    title: 'Service Discounts',
    description: 'Use FAIT tokens to receive discounts on services provided through the co-op.',
    icon: 'discount'
  },
  {
    title: 'Voting Rights',
    description: 'Participate in governance decisions about the future of the co-op.',
    icon: 'vote'
  },
  {
    title: 'Reward Sharing',
    description: 'Earn a share of the co-op\'s profits based on your token holdings.',
    icon: 'reward'
  },
  {
    title: 'Priority Access',
    description: 'Get priority access to new services and features before they\'re widely available.',
    icon: 'access'
  }
])

// How it works steps
const howItWorksSteps = ref([
  {
    title: 'Join the Co-op',
    description: 'Sign up and become a member of the FAIT Co-op community.',
    icon: 'join'
  },
  {
    title: 'Earn Tokens',
    description: 'Earn FAIT tokens by participating in the community, providing services, or completing projects.',
    icon: 'earn'
  },
  {
    title: 'Use Tokens',
    description: 'Spend your tokens on services, discounts, or hold them for governance rights.',
    icon: 'use'
  },
  {
    title: 'Grow Together',
    description: 'As the co-op grows, the value of your tokens and benefits increase.',
    icon: 'grow'
  }
])

// FAQ items
const faqItems = ref([
  {
    question: 'What are FAIT tokens?',
    answer: 'FAIT tokens are the digital currency used within the FAIT Co-op ecosystem. They represent your stake in the cooperative and can be used for various benefits including discounts, voting rights, and reward sharing.'
  },
  {
    question: 'How do I earn FAIT tokens?',
    answer: 'You can earn FAIT tokens by providing services through the co-op, referring new members, participating in community activities, or completing projects. Tokens can also be purchased directly.'
  },
  {
    question: 'What can I do with my FAIT tokens?',
    answer: 'FAIT tokens can be used to receive discounts on services, participate in governance voting, earn a share of co-op profits, and gain priority access to new features and services.'
  },
  {
    question: 'Are FAIT tokens transferable?',
    answer: 'Yes, FAIT tokens can be transferred between co-op members. This allows for a flexible economy within the community where members can exchange value directly.'
  },
  {
    question: 'How is the value of FAIT tokens determined?',
    answer: 'The value of FAIT tokens is determined by the overall health and growth of the co-op, the demand for services, and the utility provided by the tokens. As the co-op grows, the value of tokens is expected to increase.'
  }
])

// Active FAQ item
const activeFaqItem = ref(0)

// Toggle FAQ item
const toggleFaqItem = (index: number) => {
  activeFaqItem.value = activeFaqItem.value === index ? -1 : index
}

// Get icon name based on benefit type
const getIconName = (name: string) => {
  return name;
}
</script>

<template>
  <MainLayout>
    <!-- Hero Section -->
    <section class="py-16 bg-primary-50">
      <div class="container-wide">
        <div class="max-w-3xl mx-auto text-center">
          <Badge variant="primary" class="mb-4">Token Economy</Badge>
          <h1 class="heading-1 mb-6 text-primary-900">GoodFAIT Tokens</h1>
          <p class="text-body mb-8">
            The backbone of our cooperative economy. GoodFAIT tokens represent your stake in the co-op and provide access to exclusive benefits and services.
          </p>
          <div class="flex flex-col sm:flex-row justify-center gap-4">
            <Button variant="primary" size="lg">Get Tokens</Button>
            <Button variant="outline" size="lg">Learn More</Button>
          </div>
        </div>
      </div>
    </section>

    <!-- Stats Section -->
    <section class="py-16 bg-white">
      <div class="container-wide">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <Card variant="outline" padding="lg" class="text-center">
            <h3 class="text-4xl font-bold text-primary-600 mb-2">{{ tokenStats.totalTokens.toLocaleString() }}</h3>
            <p class="text-neutral-600">Total Tokens in Circulation</p>
          </Card>

          <Card variant="outline" padding="lg" class="text-center">
            <h3 class="text-4xl font-bold text-primary-600 mb-2">{{ tokenStats.activeUsers.toLocaleString() }}</h3>
            <p class="text-neutral-600">Active Token Holders</p>
          </Card>

          <Card variant="outline" padding="lg" class="text-center">
            <h3 class="text-4xl font-bold text-primary-600 mb-2">{{ tokenStats.averageHolding.toLocaleString() }}</h3>
            <p class="text-neutral-600">Average Token Holding</p>
          </Card>

          <Card variant="outline" padding="lg" class="text-center">
            <h3 class="text-4xl font-bold text-primary-600 mb-2">{{ tokenStats.projectsCompleted.toLocaleString() }}</h3>
            <p class="text-neutral-600">Projects Completed with Tokens</p>
          </Card>
        </div>
      </div>
    </section>

    <!-- Benefits Section -->
    <section class="py-16 bg-neutral-50">
      <div class="container-wide">
        <div class="max-w-3xl mx-auto text-center mb-12">
          <Badge variant="secondary" class="mb-4">Benefits</Badge>
          <h2 class="heading-2 mb-6 text-neutral-900">What Can You Do With GoodFAIT Tokens?</h2>
          <p class="text-body">
            GoodFAIT tokens are more than just a digital currency. They're your key to unlocking the full potential of the FAIT Co-op ecosystem.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card
            v-for="benefit in tokenBenefits"
            :key="benefit.title"
            variant="outline"
            padding="lg"
            shadow="hover"
            class="transition-all duration-300 hover:-translate-y-1"
          >
            <div class="flex flex-col items-center text-center">
              <div class="text-primary-600 mb-4">
                <!-- Discount icon -->
                <svg v-if="benefit.icon === 'discount'" xmlns="http://www.w3.org/2000/svg" class="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <!-- Vote icon -->
                <svg v-else-if="benefit.icon === 'vote'" xmlns="http://www.w3.org/2000/svg" class="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <!-- Reward icon -->
                <svg v-else-if="benefit.icon === 'reward'" xmlns="http://www.w3.org/2000/svg" class="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                </svg>
                <!-- Access icon -->
                <svg v-else-if="benefit.icon === 'access'" xmlns="http://www.w3.org/2000/svg" class="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
                <!-- Default icon -->
                <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 class="text-xl font-semibold mb-2">{{ benefit.title }}</h3>
              <p class="text-neutral-600">{{ benefit.description }}</p>
            </div>
          </Card>
        </div>
      </div>
    </section>

    <!-- How It Works Section -->
    <section class="py-16 bg-white">
      <div class="container-wide">
        <div class="max-w-3xl mx-auto text-center mb-12">
          <Badge variant="primary" class="mb-4">Process</Badge>
          <h2 class="heading-2 mb-6 text-neutral-900">How It Works</h2>
          <p class="text-body">
            Getting started with GoodFAIT tokens is simple. Follow these steps to begin your journey in our cooperative economy.
          </p>
        </div>

        <div class="relative">
          <!-- Connection Line -->
          <div class="hidden md:block absolute top-24 left-0 w-full h-1 bg-primary-200 z-0"></div>

          <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div
              v-for="(step, index) in howItWorksSteps"
              :key="step.title"
              class="relative z-10"
            >
              <div class="flex flex-col items-center text-center">
                <div class="bg-white p-4 rounded-full border-2 border-primary-500 text-primary-600 mb-4">
                  <!-- Join icon -->
                  <svg v-if="step.icon === 'join'" xmlns="http://www.w3.org/2000/svg" class="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  <!-- Earn icon -->
                  <svg v-else-if="step.icon === 'earn'" xmlns="http://www.w3.org/2000/svg" class="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <!-- Use icon -->
                  <svg v-else-if="step.icon === 'use'" xmlns="http://www.w3.org/2000/svg" class="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  <!-- Grow icon -->
                  <svg v-else-if="step.icon === 'grow'" xmlns="http://www.w3.org/2000/svg" class="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  <!-- Default icon -->
                  <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 class="text-xl font-semibold mb-2">{{ step.title }}</h3>
                <p class="text-neutral-600">{{ step.description }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- FAQ Section -->
    <section class="py-16 bg-neutral-50">
      <div class="container-wide">
        <div class="max-w-3xl mx-auto text-center mb-12">
          <Badge variant="secondary" class="mb-4">FAQ</Badge>
          <h2 class="heading-2 mb-6 text-neutral-900">Frequently Asked Questions</h2>
          <p class="text-body">
            Have questions about GoodFAIT tokens? Find answers to the most common questions below.
          </p>
        </div>

        <div class="max-w-3xl mx-auto">
          <Card variant="outline" padding="none">
            <div
              v-for="(item, index) in faqItems"
              :key="index"
              :class="['border-b border-neutral-200 last:border-b-0', index === activeFaqItem ? 'bg-primary-50' : '']"
            >
              <button
                @click="toggleFaqItem(index)"
                class="w-full px-6 py-4 text-left flex items-center justify-between focus:outline-none"
              >
                <h3 class="text-lg font-medium">{{ item.question }}</h3>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  :class="['h-5 w-5 transition-transform duration-200', index === activeFaqItem ? 'transform rotate-180' : '']"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
              </button>
              <div
                v-if="index === activeFaqItem"
                class="px-6 pb-4 text-neutral-600 animate-slide-up"
              >
                <p>{{ item.answer }}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-16 bg-primary-600 text-white">
      <div class="container-wide">
        <div class="max-w-3xl mx-auto text-center">
          <h2 class="heading-2 mb-6">Ready to Join the GoodFAIT Economy?</h2>
          <p class="text-xl opacity-90 mb-8">
            Start earning and using GoodFAIT tokens today to unlock the full potential of the FAIT Co-op.
          </p>
          <div class="flex flex-col sm:flex-row justify-center gap-4">
            <Button variant="white" size="lg">Create an Account</Button>
            <Button variant="outline-white" size="lg">Learn More</Button>
          </div>
        </div>
      </div>
    </section>
  </MainLayout>
</template>
