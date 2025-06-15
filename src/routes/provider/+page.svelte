<script>
  import { goto } from '$app/navigation';
  
  function handleSignUp() {
    goto('/provider/signup');
  }
</script>

<svelte:head>
  <title>Become a Provider - FAIT</title>
</svelte:head>

<div class="container mx-auto px-4 py-8">
  <div class="max-w-6xl mx-auto">
    <!-- Hero Section -->
    <div class="text-center mb-16">
      <h1 class="text-5xl font-bold text-gray-800 mb-6">Join the FAIT Cooperative</h1>
      <p class="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
        Become part of a professional network that values quality work, fair compensation, and community building. 
        Grow your business with FAIT's cooperative model.
      </p>
      <button 
        on:click={handleSignUp}
        class="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-8 rounded-lg text-lg"
      >
        Apply to Join
      </button>
    </div>
    
    <!-- Benefits Section -->
    <div class="grid lg:grid-cols-2 gap-12 mb-16">
      <div>
        <h2 class="text-3xl font-semibold mb-8">Why Join FAIT?</h2>
        <div class="space-y-6">
          <div class="flex items-start">
            <div class="bg-green-100 rounded-full p-2 mr-4 mt-1">
              <svg class="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
              </svg>
            </div>
            <div>
              <h3 class="text-xl font-semibold mb-2">Fair Compensation</h3>
              <p class="text-gray-600">Competitive rates with transparent pricing. Keep more of what you earn with our low platform fees.</p>
            </div>
          </div>
          
          <div class="flex items-start">
            <div class="bg-green-100 rounded-full p-2 mr-4 mt-1">
              <svg class="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
              </svg>
            </div>
            <div>
              <h3 class="text-xl font-semibold mb-2">Steady Work Flow</h3>
              <p class="text-gray-600">Access to a consistent stream of quality customers who value professional service.</p>
            </div>
          </div>
          
          <div class="flex items-start">
            <div class="bg-green-100 rounded-full p-2 mr-4 mt-1">
              <svg class="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
              </svg>
            </div>
            <div>
              <h3 class="text-xl font-semibold mb-2">Professional Support</h3>
              <p class="text-gray-600">Marketing, customer service, and business development support to help you grow.</p>
            </div>
          </div>
          
          <div class="flex items-start">
            <div class="bg-green-100 rounded-full p-2 mr-4 mt-1">
              <svg class="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
              </svg>
            </div>
            <div>
              <h3 class="text-xl font-semibold mb-2">Cooperative Ownership</h3>
              <p class="text-gray-600">As a member of our cooperative, you have a voice in how the platform operates and grows.</p>
            </div>
          </div>
        </div>
      </div>
      
      <div class="bg-gray-50 rounded-lg p-8">
        <h3 class="text-2xl font-semibold mb-6">Service Categories</h3>
        <div class="grid grid-cols-2 gap-4">
          <div class="text-center p-4 bg-white rounded-lg">
            <div class="text-3xl mb-2">🔧</div>
            <span class="text-sm font-medium">Handyman</span>
          </div>
          <div class="text-center p-4 bg-white rounded-lg">
            <div class="text-3xl mb-2">🔌</div>
            <span class="text-sm font-medium">Electrical</span>
          </div>
          <div class="text-center p-4 bg-white rounded-lg">
            <div class="text-3xl mb-2">🚿</div>
            <span class="text-sm font-medium">Plumbing</span>
          </div>
          <div class="text-center p-4 bg-white rounded-lg">
            <div class="text-3xl mb-2">🧹</div>
            <span class="text-sm font-medium">Cleaning</span>
          </div>
          <div class="text-center p-4 bg-white rounded-lg">
            <div class="text-3xl mb-2">🌿</div>
            <span class="text-sm font-medium">Landscaping</span>
          </div>
          <div class="text-center p-4 bg-white rounded-lg">
            <div class="text-3xl mb-2">🏠</div>
            <span class="text-sm font-medium">Remodeling</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Requirements Section -->
    <div class="bg-white rounded-lg shadow-lg p-8 mb-12">
      <h2 class="text-3xl font-semibold mb-8 text-center">Requirements</h2>
      <div class="grid md:grid-cols-3 gap-8">
        <div class="text-center">
          <div class="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <h3 class="text-xl font-semibold mb-2">Licensed & Insured</h3>
          <p class="text-gray-600">Valid business license and liability insurance required for all service providers.</p>
        </div>
        
        <div class="text-center">
          <div class="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
            </svg>
          </div>
          <h3 class="text-xl font-semibold mb-2">Experienced</h3>
          <p class="text-gray-600">Minimum 2 years of professional experience in your service category.</p>
        </div>
        
        <div class="text-center">
          <div class="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
            </svg>
          </div>
          <h3 class="text-xl font-semibold mb-2">Customer Focused</h3>
          <p class="text-gray-600">Commitment to quality work and excellent customer service.</p>
        </div>
      </div>
    </div>
    
    <!-- CTA Section -->
    <div class="text-center">
      <h2 class="text-3xl font-semibold mb-4">Ready to Join?</h2>
      <p class="text-xl text-gray-600 mb-8">Start your application today and become part of the FAIT cooperative.</p>
      <button 
        on:click={handleSignUp}
        class="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-8 rounded-lg text-lg"
      >
        Apply Now
      </button>
    </div>
  </div>
</div>