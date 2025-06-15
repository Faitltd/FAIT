<script lang="ts">
  import { goto } from '$app/navigation';
  import { auth } from '$lib/stores/auth';
  import { services } from '$lib/stores/services';
  import ServiceForm from '$lib/components/services/ServiceForm.svelte';
  import type { ServiceFormData } from '$lib/components/services/ServiceForm.svelte';
  
  let isSubmitting = false;
  let error: string | null = null;
  
  async function handleSubmit(event: CustomEvent<ServiceFormData>) {
    const serviceData = event.detail;
    isSubmitting = true;
    error = null;
    
    // Add provider ID from auth store
    const providerId = $auth.user?.id || '';
    
    // Create service
    const result = await services.createService({
      ...serviceData,
      providerId,
      imageUrl: serviceData.image ? URL.createObjectURL(serviceData.image) : '/images/default-service.jpg'
    });
    
    isSubmitting = false;
    
    if (result.success) {
      // Redirect to provider dashboard
      goto('/dashboard');
    } else {
      error = result.error || 'Failed to create service';
    }
  }
  
  function handleCancel() {
    // Go back to provider dashboard
    goto('/dashboard');
  }
</script>

<svelte:head>
  <title>Create New Service - FAIT</title>
  <meta name="description" content="Create a new service to offer on the FAIT platform." />
</svelte:head>

<section class="bg-fait-light py-8">
  <div class="container-custom">
    <div class="mb-8">
      <h1 class="text-3xl font-ivy font-bold text-fait-dark mb-2">Create New Service</h1>
      <p class="text-gray-600">Add a new service to offer to clients on the FAIT platform.</p>
    </div>
    
    <div class="max-w-3xl mx-auto">
      <ServiceForm 
        {isSubmitting} 
        {error} 
        on:submit={handleSubmit} 
        on:cancel={handleCancel} 
      />
    </div>
  </div>
</section>
