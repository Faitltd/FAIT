<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { bookings } from '$lib/stores/bookings';
  import Button from '$lib/components/ui/Button.svelte';
  import Card from '$lib/components/ui/Card.svelte';
  
  let booking = null;
  let isLoading = true;
  let error = null;
  let isUpdating = false;
  
  // Get booking ID from URL
  const bookingId = $page.params.id;
  
  // Load booking data
  onMount(async () => {
    isLoading = true;
    error = null;
    
    const result = await bookings.getBooking(bookingId);
    
    isLoading = false;
    
    if (result.success && result.booking) {
      booking = result.booking;
    } else {
      error = result.error || 'Failed to load booking';
    }
  });
  
  // Update booking status
  async function updateStatus(status) {
    isUpdating = true;
    error = null;
    
    const result = await bookings.updateBookingStatus(bookingId, status);
    
    isUpdating = false;
    
    if (result.success) {
      // Reload booking data
      const bookingResult = await bookings.getBooking(bookingId);
      
      if (bookingResult.success && bookingResult.booking) {
        booking = bookingResult.booking;
      }
    } else {
      error = result.error || 'Failed to update booking status';
    }
  }
  
  // Format date
  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }
  
  // Format time
  function formatTime(timeString) {
    switch (timeString) {
      case 'morning':
        return '8:00 AM - 12:00 PM';
      case 'afternoon':
        return '12:00 PM - 5:00 PM';
      case 'evening':
        return '5:00 PM - 8:00 PM';
      default:
        return timeString;
    }
  }
</script>

<svelte:head>
  <title>Booking Details - FAIT</title>
  <meta name="description" content="View and manage booking details on the FAIT platform." />
</svelte:head>

<section class="bg-fait-light py-8">
  <div class="container-custom">
    <div class="mb-8">
      <Button href="/dashboard" variant="outline" class="mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
        </svg>
        Back to Dashboard
      </Button>
      <h1 class="text-3xl font-ivy font-bold text-fait-dark">Booking Details</h1>
    </div>
    
    {#if isLoading}
      <div class="bg-white rounded-lg shadow-md p-8 text-center">
        <p class="text-gray-600">Loading booking data...</p>
      </div>
    {:else if error}
      <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
        <p>{error}</p>
      </div>
    {:else if booking}
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Booking Details -->
        <div class="lg:col-span-2">
          <Card variant="elevated" padding="lg">
            <div class="flex justify-between items-start mb-6">
              <div>
                <h2 class="text-xl font-bold">{booking.serviceName}</h2>
                <div class="flex items-center mt-1">
                  <span class="px-3 py-1 text-sm rounded-full 
                    {booking.status === 'confirmed' ? 'bg-green-100 text-green-800' : 
                      booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                      booking.status === 'completed' ? 'bg-blue-100 text-blue-800' : 
                      'bg-red-100 text-red-800'}">
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </span>
                </div>
              </div>
              <p class="text-xl font-bold text-fait-blue">{booking.price}</p>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <h3 class="text-sm font-medium text-gray-500 mb-1">Client</h3>
                <p class="font-medium">{booking.clientName}</p>
              </div>
              <div>
                <h3 class="text-sm font-medium text-gray-500 mb-1">Date & Time</h3>
                <p class="font-medium">{formatDate(booking.date)}</p>
                <p class="text-sm text-gray-600">{formatTime(booking.time)}</p>
              </div>
              <div>
                <h3 class="text-sm font-medium text-gray-500 mb-1">Address</h3>
                <p class="font-medium">{booking.address}</p>
              </div>
              <div>
                <h3 class="text-sm font-medium text-gray-500 mb-1">Booked On</h3>
                <p class="font-medium">{formatDate(booking.createdAt)}</p>
              </div>
            </div>
            
            {#if booking.notes}
              <div class="mb-8">
                <h3 class="text-sm font-medium text-gray-500 mb-1">Special Instructions</h3>
                <p class="p-4 bg-gray-50 rounded-md">{booking.notes}</p>
              </div>
            {/if}
            
            <!-- Status Actions -->
            {#if booking.status === 'pending'}
              <div class="flex flex-col sm:flex-row gap-3">
                <Button 
                  variant="primary" 
                  disabled={isUpdating} 
                  on:click={() => updateStatus('confirmed')}
                >
                  {isUpdating ? 'Updating...' : 'Accept Booking'}
                </Button>
                <Button 
                  variant="outline" 
                  class="text-red-600 border-red-600 hover:bg-red-50" 
                  disabled={isUpdating} 
                  on:click={() => updateStatus('cancelled')}
                >
                  {isUpdating ? 'Updating...' : 'Decline Booking'}
                </Button>
              </div>
            {:else if booking.status === 'confirmed'}
              <div class="flex flex-col sm:flex-row gap-3">
                <Button 
                  variant="primary" 
                  disabled={isUpdating} 
                  on:click={() => updateStatus('completed')}
                >
                  {isUpdating ? 'Updating...' : 'Mark as Completed'}
                </Button>
                <Button 
                  variant="outline" 
                  class="text-red-600 border-red-600 hover:bg-red-50" 
                  disabled={isUpdating} 
                  on:click={() => updateStatus('cancelled')}
                >
                  {isUpdating ? 'Updating...' : 'Cancel Booking'}
                </Button>
              </div>
            {/if}
          </Card>
        </div>
        
        <!-- Client Info and Actions -->
        <div>
          <Card variant="elevated" padding="lg">
            <h2 class="text-xl font-bold mb-6">Client Information</h2>
            
            <div class="flex items-center mb-6">
              <div class="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xl mr-4">
                {booking.clientName.charAt(0)}
              </div>
              <div>
                <h3 class="font-bold">{booking.clientName}</h3>
                <p class="text-sm text-gray-600">Client</p>
              </div>
            </div>
            
            <div class="space-y-4 mb-6">
              <Button variant="outline" fullWidth={true}>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
                Contact Client
              </Button>
              <Button variant="outline" fullWidth={true}>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clip-rule="evenodd" />
                </svg>
                Send Message
              </Button>
            </div>
            
            <div class="border-t border-gray-200 pt-6">
              <h3 class="font-bold mb-4">Booking Timeline</h3>
              <div class="space-y-4">
                <div class="flex">
                  <div class="mr-4 flex flex-col items-center">
                    <div class="w-3 h-3 bg-green-500 rounded-full"></div>
                    <div class="w-0.5 h-full bg-gray-200"></div>
                  </div>
                  <div>
                    <p class="font-medium">Booking Created</p>
                    <p class="text-sm text-gray-600">{formatDate(booking.createdAt)}</p>
                  </div>
                </div>
                
                {#if booking.status !== 'pending'}
                  <div class="flex">
                    <div class="mr-4 flex flex-col items-center">
                      <div class="w-3 h-3 bg-green-500 rounded-full"></div>
                      <div class="w-0.5 h-full bg-gray-200"></div>
                    </div>
                    <div>
                      <p class="font-medium">Booking Confirmed</p>
                      <p class="text-sm text-gray-600">{formatDate(booking.updatedAt)}</p>
                    </div>
                  </div>
                {/if}
                
                {#if booking.status === 'completed'}
                  <div class="flex">
                    <div class="mr-4 flex flex-col items-center">
                      <div class="w-3 h-3 bg-green-500 rounded-full"></div>
                    </div>
                    <div>
                      <p class="font-medium">Service Completed</p>
                      <p class="text-sm text-gray-600">{formatDate(booking.updatedAt)}</p>
                    </div>
                  </div>
                {:else if booking.status === 'cancelled'}
                  <div class="flex">
                    <div class="mr-4 flex flex-col items-center">
                      <div class="w-3 h-3 bg-red-500 rounded-full"></div>
                    </div>
                    <div>
                      <p class="font-medium">Booking Cancelled</p>
                      <p class="text-sm text-gray-600">{formatDate(booking.updatedAt)}</p>
                    </div>
                  </div>
                {/if}
              </div>
            </div>
          </Card>
        </div>
      </div>
    {/if}
  </div>
</section>
