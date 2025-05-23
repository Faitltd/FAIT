<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import Modal from '$lib/components/ui/Modal.svelte';
  import BookingForm from './BookingForm.svelte';
  import type { Service } from '$lib/services/supabase';
  
  // Props
  export let open = false;
  export let service: Service | null = null;
  
  // Event dispatcher
  const dispatch = createEventDispatcher();
  
  // Handle close
  function handleClose() {
    dispatch('close');
  }
  
  // Handle booking success
  function handleBookingSuccess(event: CustomEvent) {
    dispatch('success', event.detail);
    
    // Close modal after a short delay to show success message
    setTimeout(() => {
      handleClose();
    }, 2000);
  }
</script>

<Modal 
  {open} 
  title="Book Service" 
  size="lg"
  on:close={handleClose}
>
  {#if service}
    <div class="mb-4">
      <div class="flex items-center mb-2">
        {#if service.image_url}
          <img 
            src={service.image_url} 
            alt={service.title} 
            class="w-16 h-16 object-cover rounded-md mr-4"
          />
        {/if}
        <div>
          <h4 class="text-lg font-bold">{service.title}</h4>
          <p class="text-gray-600">{service.price_type === 'hourly' ? `$${service.price}/hr` : `$${service.price}`}</p>
        </div>
      </div>
      <p class="text-gray-700">{service.description}</p>
    </div>
    
    <BookingForm 
      {service} 
      providerId={service.provider_id}
      on:success={handleBookingSuccess}
    />
  {:else}
    <p>Loading service details...</p>
  {/if}
</Modal>
