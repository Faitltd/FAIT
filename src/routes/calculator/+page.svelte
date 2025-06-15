<script lang="ts">
  import { goto } from '$app/navigation';
  import Button from '$lib/components/ui/Button.svelte';
  import Card from '$lib/components/ui/Card.svelte';
  
  // Redirect to estimate calculator by default
  goto('/calculator/estimate');
</script>

<svelte:head>
  <title>Calculators - FAIT</title>
  <meta name="description" content="Free instant estimates and calculators for your home improvement projects." />
</svelte:head>

<section class="bg-fait-light py-8">
  <div class="container-custom">
    <div class="text-center mb-8">
      <h1 class="text-3xl font-ivy font-bold text-fait-dark mb-4">Project Calculators</h1>
      <p class="text-lg text-gray-600">Get instant estimates for your home improvement projects</p>
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card variant="elevated" padding="lg">
        <div class="text-center">
          <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 class="text-xl font-bold mb-2">Free Instant Estimate</h3>
          <p class="text-gray-600 mb-4">Get quick estimates for various home improvement projects</p>
          <Button href="/calculator/estimate" variant="primary" fullWidth={true}>
            Get Estimate
          </Button>
        </div>
      </Card>
      
      <Card variant="elevated" padding="lg">
        <div class="text-center">
          <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h3 class="text-xl font-bold mb-2">Remodeling Calculator</h3>
          <p class="text-gray-600 mb-4">Calculate costs for kitchen, bathroom, and home remodeling</p>
          <Button href="/calculator/remodeling" variant="primary" fullWidth={true}>
            Calculate Remodeling
          </Button>
        </div>
      </Card>
      
      <Card variant="elevated" padding="lg">
        <div class="text-center">
          <div class="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h3 class="text-xl font-bold mb-2">Handyman Tasks</h3>
          <p class="text-gray-600 mb-4">Estimate costs for small repairs and handyman services</p>
          <Button href="/calculator/handyman" variant="primary" fullWidth={true}>
            Calculate Tasks
          </Button>
        </div>
      </Card>
    </div>
  </div>
</section>
