<script>
  import { supabase } from '$lib/supabase.js';
  import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
  
  let isLoading = false;
  let submitted = false;
  let formData = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    businessName: '',
    serviceCategory: '',
    experience: '',
    licenseNumber: '',
    insuranceProvider: '',
    description: ''
  };
  
  const serviceCategories = [
    'Handyman Services',
    'Electrical Services',
    'Plumbing Services',
    'Cleaning Services',
    'Landscaping',
    'Home Improvement'
  ];
  
  async function handleSubmit() {
    isLoading = true;
    
    try {
      // Here you would typically save to Supabase
      console.log('Provider application submitted:', formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      submitted = true;
    } catch (error) {
      console.error('Application error:', error);
    } finally {
      isLoading = false;
    }
  }
</script>

<svelte:head>
  <title>Provider Application - FAIT</title>
</svelte:head>

<div class="container mx-auto px-4 py-8">
  <div class="max-w-3xl mx-auto">
    {#if submitted}
      <div class="text-center">
        <div class="bg-green-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
          <svg class="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        
        <h1 class="text-3xl font-bold text-gray-800 mb-4">Application Submitted!</h1>
        <p class="text-xl text-gray-600 mb-8">
          Thank you for your interest in joining FAIT. We'll review your application and contact you within 3-5 business days.
        </p>
        
        <a href="/" class="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg">
          Return Home
        </a>
      </div>
    {:else}
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold text-gray-800 mb-4">Provider Application</h1>
        <p class="text-xl text-gray-600">Join the FAIT cooperative and grow your business</p>
      </div>
      
      <form on:submit|preventDefault={handleSubmit} class="bg-white rounded-lg shadow-lg p-8">
        <div class="grid md:grid-cols-2 gap-6">
          <!-- Personal Information -->
          <div>
            <label for="firstName" class="block text-sm font-medium text-gray-700 mb-2">First Name</label>
            <input
              type="text"
              id="firstName"
              bind:value={formData.firstName}
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label for="lastName" class="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
            <input
              type="text"
              id="lastName"
              bind:value={formData.lastName}
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              id="email"
              bind:value={formData.email}
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label for="phone" class="block text-sm font-medium text-gray-700 mb-2">Phone</label>
            <input
              type="tel"
              id="phone"
              bind:value={formData.phone}
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <!-- Business Information -->
          <div>
            <label for="businessName" class="block text-sm font-medium text-gray-700 mb-2">Business Name</label>
            <input
              type="text"
              id="businessName"
              bind:value={formData.businessName}
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label for="serviceCategory" class="block text-sm font-medium text-gray-700 mb-2">Service Category</label>
            <select
              id="serviceCategory"
              bind:value={formData.serviceCategory}
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a category</option>
              {#each serviceCategories as category}
                <option value={category}>{category}</option>
              {/each}
            </select>
          </div>
          
          <div>
            <label for="experience" class="block text-sm font-medium text-gray-700 mb-2">Years of Experience</label>
            <input
              type="number"
              id="experience"
              bind:value={formData.experience}
              min="1"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label for="licenseNumber" class="block text-sm font-medium text-gray-700 mb-2">License Number</label>
            <input
              type="text"
              id="licenseNumber"
              bind:value={formData.licenseNumber}
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        
        <div class="mt-6">
          <label for="insuranceProvider" class="block text-sm font-medium text-gray-700 mb-2">Insurance Provider</label>
          <input
            type="text"
            id="insuranceProvider"
            bind:value={formData.insuranceProvider}
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div class="mt-6">
          <label for="description" class="block text-sm font-medium text-gray-700 mb-2">Tell us about your business</label>
          <textarea
            id="description"
            bind:value={formData.description}
            rows="4"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Describe your services, experience, and what makes you unique..."
          ></textarea>
        </div>
        
        <div class="mt-8">
          <button
            type="submit"
            disabled={isLoading}
            class="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            {#if isLoading}
              <LoadingSpinner size="small" color="white" />
            {:else}
              Submit Application
            {/if}
          </button>
        </div>
      </form>
    {/if}
  </div>
</div>