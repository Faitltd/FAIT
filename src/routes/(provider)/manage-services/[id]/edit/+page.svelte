<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { services } from '$lib/stores/services';
  import ServiceForm from '$lib/components/services/ServiceForm.svelte';
  import type { ServiceFormData } from '$lib/components/services/ServiceForm.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  
  let service: ServiceFormData | null = null;
  let isSubmitting = false;
  let isLoading = true;
  let error: string | null = null;
  let showDeleteConfirm = false;
  
  // Get service ID from URL
  const serviceId = $page.params.id;
  
  // Load service data
  onMount(async () => {
    isLoading = true;
    error = null;
    
    const result = await services.getService(serviceId);
    
    isLoading = false;
    
    if (result.success && result.service) {
      // Convert to form data
      service = {
        id: result.service.id,
        title: result.service.title,
        description: result.service.description,
        category: result.service.category,
        price: result.service.price,
        priceType: result.service.priceType,
        duration: result.service.duration,
        active: result.service.active,
        imageUrl: result.service.imageUrl
      };
    } else {
      error = result.error || 'Failed to load service';
    }
  });
  
  async function handleSubmit(event: CustomEvent<ServiceFormData>) {
    const serviceData = event.detail;
    isSubmitting = true;
    error = null;
    
    // Update service
    const result = await services.updateService(serviceId, {
      title: serviceData.title,
      description: serviceData.description,
      category: serviceData.category,
      price: serviceData.price,
      priceType: serviceData.priceType,
      duration: serviceData.duration,
      active: serviceData.active,
      imageUrl: serviceData.image ? URL.createObjectURL(serviceData.image) : serviceData.imageUrl
    });
    
    isSubmitting = false;
    
    if (result.success) {
      // Redirect to provider dashboard
      goto('/dashboard');
    } else {
      error = result.error || 'Failed to update service';
    }
  }
  
  function handleCancel() {
    // Go back to provider dashboard
    goto('/dashboard');
  }
  
  async function handleDelete() {
    isSubmitting = true;
    error = null;
    
    // Delete service
    const result = await services.deleteService(serviceId);
    
    isSubmitting = false;
    
    if (result.success) {
      // Redirect to provider dashboard
      goto('/dashboard');
    } else {
      error = result.error || 'Failed to delete service';
      showDeleteConfirm = false;
    }
  }
</script>

<svelte:head>
  <title>Edit Service - FAIT</title>
  <meta name="description" content="Edit your service on the FAIT platform." />
</svelte:head>

<section class="bg-fait-light py-8">
  <div class="container-custom">
    <div class="mb-8">
      <h1 class="text-3xl font-ivy font-bold text-fait-dark mb-2">Edit Service</h1>
      <p class="text-gray-600">Update your service details or change its status.</p>
    </div>
    
    <div class="max-w-3xl mx-auto">
      {#if isLoading}
        <div class="bg-white rounded-lg shadow-md p-8 text-center">
          <p class="text-gray-600">Loading service data...</p>
        </div>
      {:else if error && !service}
        <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <p>{error}</p>
          <div class="mt-4">
            <Button href="/dashboard" variant="primary">Back to Dashboard</Button>
          </div>
        </div>
      {:else if service}
        {#if showDeleteConfirm}
          <div class="bg-white rounded-lg shadow-md p-8">
            <h2 class="text-xl font-bold mb-4">Delete Service</h2>
            <p class="text-gray-600 mb-6">Are you sure you want to delete this service? This action cannot be undone.</p>
            <div class="flex justify-end space-x-3">
              <Button type="button" variant="outline" on:click={() => showDeleteConfirm = false}>Cancel</Button>
              <Button type="button" variant="primary" class="bg-red-600 hover:bg-red-700" disabled={isSubmitting} on:click={handleDelete}>
                {isSubmitting ? 'Deleting...' : 'Delete Service'}
              </Button>
            </div>
          </div>
        {:else}
          <div class="flex justify-end mb-4">
            <Button type="button" variant="outline" class="text-red-600 border-red-600 hover:bg-red-50" on:click={() => showDeleteConfirm = true}>
              Delete Service
            </Button>
          </div>
          
          <ServiceForm 
            service={service} 
            {isSubmitting} 
            {error} 
            on:submit={handleSubmit} 
            on:cancel={handleCancel} 
          />
        {/if}
      {/if}
    </div>
  </div>
</section>
