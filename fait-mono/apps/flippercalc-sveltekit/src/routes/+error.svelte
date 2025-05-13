<script>
  import { page } from '$app/stores';
  import { AlertTriangle } from 'lucide-svelte';
</script>

<div class="min-h-[60vh] flex flex-col items-center justify-center px-4 py-16">
  <div class="text-center">
    <div class="flex justify-center mb-6">
      <div class="bg-red-100 p-3 rounded-full">
        <AlertTriangle class="w-12 h-12 text-red-600" />
      </div>
    </div>
    
    <h1 class="text-4xl font-bold text-gray-900 mb-4">
      {$page.status}: {$page.error?.message || 'Something went wrong'}
    </h1>
    
    <p class="text-xl text-gray-600 mb-8 max-w-md mx-auto">
      {#if $page.status === 404}
        The page you're looking for doesn't exist.
      {:else if $page.status === 403}
        You don't have permission to access this page.
      {:else if $page.status === 500}
        Our servers are having trouble processing your request.
      {:else}
        An unexpected error occurred. Please try again later.
      {/if}
    </p>
    
    <div class="flex flex-col sm:flex-row gap-4 justify-center">
      <a 
        href="/"
        class="inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
      >
        Go to Home
      </a>
      <button 
        on:click={() => history.back()}
        class="inline-flex justify-center items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
      >
        Go Back
      </button>
    </div>
  </div>
</div>
