<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import Card from '$lib/components/ui/Card.svelte';
  import { auth } from '$lib/stores/auth';
  import { bookings } from '$lib/stores/bookings';
  import type { Service } from '$lib/services/supabase';
  import { onMount } from 'svelte';
  
  // Props
  export let service: Service;
  export let providerId: string;
  
  // Local state
  let date = '';
  let time = '';
  let address = '';
  let notes = '';
  let formErrors: Record<string, string> = {};
  let showSuccessMessage = false;
  
  // Get today's date in YYYY-MM-DD format for min date
  const today = new Date().toISOString().split('T')[0];
  
  // Get available time slots
  const timeSlots = [
    '09:00', '10:00', '11:00', '12:00', '13:00', 
    '14:00', '15:00', '16:00', '17:00', '18:00'
  ];
  
  // Event dispatcher
  const dispatch = createEventDispatcher();
  
  // Validate form
  function validateForm(): boolean {
    formErrors = {};
    
    if (!date) {
      formErrors.date = 'Date is required';
    }
    
    if (!time) {
      formErrors.time = 'Time is required';
    }
    
    if (!address) {
      formErrors.address = 'Address is required';
    }
    
    return Object.keys(formErrors).length === 0;
  }
  
  // Handle form submission
  async function handleSubmit() {
    if (!validateForm()) return;
    
    if (!$auth.user) {
      formErrors.auth = 'You must be logged in to book a service';
      return;
    }
    
    const bookingData = {
      serviceId: service.id,
      providerId: providerId,
      clientId: $auth.user.id,
      date,
      time,
      status: 'pending' as const,
      price: service.price.toString(),
      address,
      notes
    };
    
    const result = await bookings.createBooking(bookingData);
    
    if (result.success) {
      showSuccessMessage = true;
      
      // Reset form
      date = '';
      time = '';
      address = '';
      notes = '';
      
      // Notify parent component
      dispatch('success', { booking: result.booking });
    }
  }
  
  // Format price display
  $: priceDisplay = service.price_type === 'hourly' 
    ? `$${service.price}/hr` 
    : `$${service.price}`;
</script>

<Card variant="elevated" padding="lg" class="booking-form {$$props.class || ''}">
  <h3 class="text-xl font-bold mb-4">Book {service.title}</h3>
  
  {#if showSuccessMessage}
    <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
      <p class="font-medium">Booking successful!</p>
      <p>Your booking request has been sent to the service provider.</p>
    </div>
  {/if}
  
  {#if $bookings.error}
    <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
      <p>{$bookings.error}</p>
    </div>
  {/if}
  
  {#if formErrors.auth}
    <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
      <p>{formErrors.auth}</p>
      <a href="/login" class="text-red-700 underline">Log in</a> or 
      <a href="/register" class="text-red-700 underline">create an account</a> to book services.
    </div>
  {/if}
  
  <form on:submit|preventDefault={handleSubmit} class="space-y-4">
    <div class="flex flex-col md:flex-row gap-4">
      <!-- Date selection -->
      <div class="flex-1">
        <label for="booking-date" class="block text-sm font-medium text-gray-700 mb-1">Date</label>
        <input 
          type="date" 
          id="booking-date" 
          bind:value={date} 
          min={today}
          class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-fait-blue
            {formErrors.date ? 'border-red-500' : ''}"
        />
        {#if formErrors.date}
          <p class="text-red-500 text-xs mt-1">{formErrors.date}</p>
        {/if}
      </div>
      
      <!-- Time selection -->
      <div class="flex-1">
        <label for="booking-time" class="block text-sm font-medium text-gray-700 mb-1">Time</label>
        <select 
          id="booking-time" 
          bind:value={time}
          class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-fait-blue
            {formErrors.time ? 'border-red-500' : ''}"
        >
          <option value="">Select a time</option>
          {#each timeSlots as slot}
            <option value={slot}>{slot}</option>
          {/each}
        </select>
        {#if formErrors.time}
          <p class="text-red-500 text-xs mt-1">{formErrors.time}</p>
        {/if}
      </div>
    </div>
    
    <!-- Address -->
    <div>
      <label for="booking-address" class="block text-sm font-medium text-gray-700 mb-1">Address</label>
      <input 
        type="text" 
        id="booking-address" 
        bind:value={address} 
        placeholder="Enter the service location"
        class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-fait-blue
          {formErrors.address ? 'border-red-500' : ''}"
      />
      {#if formErrors.address}
        <p class="text-red-500 text-xs mt-1">{formErrors.address}</p>
      {/if}
    </div>
    
    <!-- Notes -->
    <div>
      <label for="booking-notes" class="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
      <textarea 
        id="booking-notes" 
        bind:value={notes} 
        rows="3"
        placeholder="Any special instructions or details"
        class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-fait-blue"
      ></textarea>
    </div>
    
    <!-- Price summary -->
    <div class="bg-gray-50 p-4 rounded-md">
      <div class="flex justify-between items-center">
        <span class="font-medium">Price:</span>
        <span class="text-fait-blue font-bold">{priceDisplay}</span>
      </div>
      <p class="text-sm text-gray-600 mt-1">
        {service.price_type === 'hourly' 
          ? 'Final price may vary based on actual service duration.' 
          : 'Fixed price for the entire service.'}
      </p>
    </div>
    
    <!-- Submit button -->
    <Button 
      type="submit" 
      variant="primary" 
      fullWidth={true} 
      loading={$bookings.isLoading}
      disabled={$bookings.isLoading || !$auth.user}
      animate={true}
    >
      Book Now
    </Button>
  </form>
</Card>
