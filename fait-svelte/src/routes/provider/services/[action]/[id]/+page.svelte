<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { auth } from '$lib/stores/auth';
  import { api } from '$lib/services/api';
  import Button from '$lib/components/ui/Button.svelte';
  import Card from '$lib/components/ui/Card.svelte';
  import { fade } from 'svelte/transition';
  import type { Service } from '$lib/services/supabase';
  
  // Get action and ID from URL
  $: action = $page.params.action;
  $: serviceId = $page.params.id;
  
  // Form state
  let formData = {
    title: '',
    description: '',
    category: '',
    price: '',
    price_type: 'fixed',
    duration: '',
    active: true,
    image_url: ''
  };
  
  let formErrors: Record<string, string> = {};
  let isLoading = true;
  let isSaving = false;
  let error: string | null = null;
  let success = false;
  
  // Categories
  const categories = [
    { value: 'cleaning', label: 'Cleaning' },
    { value: 'handyman', label: 'Handyman' },
    { value: 'gardening', label: 'Gardening' },
    { value: 'moving', label: 'Moving' },
    { value: 'electrical', label: 'Electrical' },
    { value: 'plumbing', label: 'Plumbing' },
    { value: 'painting', label: 'Painting' },
    { value: 'assembly', label: 'Furniture Assembly' },
    { value: 'delivery', label: 'Delivery' },
    { value: 'other', label: 'Other' }
  ];
  
  // Initialize on mount
  onMount(async () => {
    // Check if user is authenticated
    await auth.checkAuth();
    
    if (!$auth.user) {
      // Redirect to login if not authenticated
      goto('/login');
      return;
    }
    
    // Check if user is a provider
    if ($auth.user.role !== 'provider') {
      // Redirect to home if not a provider
      goto('/');
      return;
    }
    
    try {
      // If editing, load service data
      if (action === 'edit' && serviceId) {
        const service = await api.services.getById(serviceId);
        
        // Check if service belongs to this provider
        if (service.provider_id !== $auth.user.id) {
          throw new Error('You do not have permission to edit this service');
        }
        
        // Populate form data
        formData = {
          title: service.title,
          description: service.description,
          category: service.category,
          price: service.price.toString(),
          price_type: service.price_type,
          duration: service.duration.toString(),
          active: service.active,
          image_url: service.image_url || ''
        };
      }
      
      isLoading = false;
    } catch (err) {
      console.error('Failed to load service:', err);
      error = err instanceof Error ? err.message : 'Failed to load service';
      isLoading = false;
    }
  });
  
  // Validate form
  function validateForm(): boolean {
    formErrors = {};
    
    if (!formData.title) {
      formErrors.title = 'Title is required';
    }
    
    if (!formData.description) {
      formErrors.description = 'Description is required';
    }
    
    if (!formData.category) {
      formErrors.category = 'Category is required';
    }
    
    if (!formData.price) {
      formErrors.price = 'Price is required';
    } else if (isNaN(parseFloat(formData.price)) || parseFloat(formData.price) <= 0) {
      formErrors.price = 'Price must be a positive number';
    }
    
    if (!formData.duration) {
      formErrors.duration = 'Duration is required';
    } else if (isNaN(parseInt(formData.duration)) || parseInt(formData.duration) <= 0) {
      formErrors.duration = 'Duration must be a positive number';
    }
    
    return Object.keys(formErrors).length === 0;
  }
  
  // Handle form submission
  async function handleSubmit() {
    if (!validateForm()) return;
    
    try {
      isSaving = true;
      
      // Prepare service data
      const serviceData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        price: parseFloat(formData.price),
        price_type: formData.price_type,
        duration: parseInt(formData.duration),
        active: formData.active,
        image_url: formData.image_url,
        provider_id: $auth.user?.id
      };
      
      if (action === 'edit' && serviceId) {
        // Update existing service
        await api.services.update(serviceId, serviceData);
      } else {
        // Create new service
        await api.services.create(serviceData);
      }
      
      success = true;
      
      // Redirect to dashboard after a short delay
      setTimeout(() => {
        goto('/provider/dashboard');
      }, 2000);
    } catch (err) {
      console.error('Failed to save service:', err);
      error = err instanceof Error ? err.message : 'Failed to save service';
    } finally {
      isSaving = false;
    }
  }
</script>

<svelte:head>
  <title>{action === 'edit' ? 'Edit' : 'Add'} Service - FAIT</title>
  <meta name="description" content="{action === 'edit' ? 'Edit' : 'Add'} a service as a provider." />
</svelte:head>

<section class="bg-fait-light py-12">
  <div class="container-custom">
    <div class="mb-6">
      <Button variant="outline" size="sm" on:click={() => goto('/provider/dashboard')}>
        &larr; Back to Dashboard
      </Button>
    </div>
    
    <h1 class="text-3xl font-ivy font-bold text-fait-dark mb-6">
      {action === 'edit' ? 'Edit' : 'Add New'} Service
    </h1>
    
    {#if isLoading}
      <div class="flex justify-center items-center py-12">
        <div class="spinner"></div>
      </div>
    {:else if error}
      <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6" in:fade>
        <p>{error}</p>
        <Button variant="secondary" size="sm" class="mt-2" on:click={() => goto('/provider/dashboard')}>
          Return to Dashboard
        </Button>
      </div>
    {:else}
      <div class="max-w-3xl mx-auto">
        <Card variant="elevated" padding="lg">
          {#if success}
            <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6" in:fade>
              <p class="font-medium">Service {action === 'edit' ? 'updated' : 'created'} successfully!</p>
              <p>Redirecting to dashboard...</p>
            </div>
          {/if}
          
          <form on:submit|preventDefault={handleSubmit} class="space-y-6">
            <!-- Title -->
            <div>
              <label for="title" class="block text-sm font-medium text-gray-700 mb-1">Service Title</label>
              <input 
                type="text" 
                id="title" 
                bind:value={formData.title} 
                class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-fait-blue
                  {formErrors.title ? 'border-red-500' : ''}"
                aria-describedby={formErrors.title ? 'title-error' : undefined}
              />
              {#if formErrors.title}
                <p id="title-error" class="text-red-500 text-xs mt-1">{formErrors.title}</p>
              {/if}
            </div>
            
            <!-- Category -->
            <div>
              <label for="category" class="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select 
                id="category" 
                bind:value={formData.category}
                class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-fait-blue
                  {formErrors.category ? 'border-red-500' : ''}"
                aria-describedby={formErrors.category ? 'category-error' : undefined}
              >
                <option value="">Select a category</option>
                {#each categories as category}
                  <option value={category.value}>{category.label}</option>
                {/each}
              </select>
              {#if formErrors.category}
                <p id="category-error" class="text-red-500 text-xs mt-1">{formErrors.category}</p>
              {/if}
            </div>
            
            <!-- Description -->
            <div>
              <label for="description" class="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea 
                id="description" 
                bind:value={formData.description} 
                rows="4"
                class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-fait-blue
                  {formErrors.description ? 'border-red-500' : ''}"
                aria-describedby={formErrors.description ? 'description-error' : undefined}
              ></textarea>
              {#if formErrors.description}
                <p id="description-error" class="text-red-500 text-xs mt-1">{formErrors.description}</p>
              {/if}
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Price -->
              <div>
                <label for="price" class="block text-sm font-medium text-gray-700 mb-1">Price</label>
                <div class="flex">
                  <span class="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                    $
                  </span>
                  <input 
                    type="text" 
                    id="price" 
                    bind:value={formData.price} 
                    class="flex-1 min-w-0 block w-full px-4 py-2 border border-gray-300 rounded-none rounded-r-md focus:outline-none focus:ring-2 focus:ring-fait-blue
                      {formErrors.price ? 'border-red-500' : ''}"
                    aria-describedby={formErrors.price ? 'price-error' : undefined}
                  />
                </div>
                {#if formErrors.price}
                  <p id="price-error" class="text-red-500 text-xs mt-1">{formErrors.price}</p>
                {/if}
              </div>
              
              <!-- Price Type -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Price Type</label>
                <div class="flex space-x-4">
                  <label class="inline-flex items-center">
                    <input 
                      type="radio" 
                      name="price_type" 
                      value="fixed" 
                      bind:group={formData.price_type}
                      class="h-4 w-4 text-fait-blue focus:ring-fait-blue border-gray-300"
                    />
                    <span class="ml-2 text-gray-700">Fixed Price</span>
                  </label>
                  <label class="inline-flex items-center">
                    <input 
                      type="radio" 
                      name="price_type" 
                      value="hourly" 
                      bind:group={formData.price_type}
                      class="h-4 w-4 text-fait-blue focus:ring-fait-blue border-gray-300"
                    />
                    <span class="ml-2 text-gray-700">Hourly Rate</span>
                  </label>
                </div>
              </div>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Duration -->
              <div>
                <label for="duration" class="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
                <input 
                  type="number" 
                  id="duration" 
                  bind:value={formData.duration} 
                  min="1"
                  class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-fait-blue
                    {formErrors.duration ? 'border-red-500' : ''}"
                  aria-describedby={formErrors.duration ? 'duration-error' : undefined}
                />
                {#if formErrors.duration}
                  <p id="duration-error" class="text-red-500 text-xs mt-1">{formErrors.duration}</p>
                {/if}
              </div>
              
              <!-- Image URL -->
              <div>
                <label for="image_url" class="block text-sm font-medium text-gray-700 mb-1">Image URL (optional)</label>
                <input 
                  type="text" 
                  id="image_url" 
                  bind:value={formData.image_url} 
                  class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-fait-blue"
                />
              </div>
            </div>
            
            <!-- Active Status -->
            <div class="flex items-center">
              <input 
                type="checkbox" 
                id="active" 
                bind:checked={formData.active}
                class="h-4 w-4 text-fait-blue focus:ring-fait-blue border-gray-300 rounded"
              />
              <label for="active" class="ml-2 block text-sm text-gray-700">
                Service is active and available for booking
              </label>
            </div>
            
            <div class="flex justify-end space-x-2">
              <Button 
                type="button" 
                variant="outline" 
                on:click={() => goto('/provider/dashboard')}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                variant="primary"
                loading={isSaving}
                disabled={isSaving || success}
              >
                {action === 'edit' ? 'Update' : 'Create'} Service
              </Button>
            </div>
          </form>
        </Card>
      </div>
    {/if}
  </div>
</section>
