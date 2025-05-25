<script lang="ts">
  import { onMount } from 'svelte';
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
  <title>Admin - Booking Details - FAIT</title>
  <meta name="description" content="Admin view of booking details on the FAIT platform." />
</svelte:head>

<div class="min-h-screen bg-gray-50">
  <!-- Header -->
  <header class="bg-white shadow">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center py-6">
        <div class="flex items-center">
          <a href="/admin/bookings" class="text-blue-600 hover:text-blue-700 mr-4">
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </a>
          <h1 class="text-2xl font-bold text-gray-900">Booking Details</h1>
        </div>
        {#if booking}
          <div class="text-sm text-gray-500">
            Booking #{booking.id}
          </div>
        {/if}
      </div>
    </div>
  </header>

  <!-- Main Content -->
  <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
    {#if isLoading}
      <Card variant="elevated" padding="lg">
        <div class="text-center text-gray-500">Loading booking details...</div>
      </Card>
    {:else if error}
      <Card variant="elevated" padding="lg">
        <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
        </div>
      </Card>
    {:else if booking}
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Main Booking Details -->
        <div class="lg:col-span-2">
          <Card variant="elevated" padding="lg">
            <div class="flex justify-between items-start mb-6">
              <div>
                <h2 class="text-2xl font-bold text-gray-900">{booking.service}</h2>
                <div class="flex items-center mt-2">
                  <span class="px-3 py-1 text-sm rounded-full 
                    {booking.status === 'confirmed' ? 'bg-green-100 text-green-800' : 
                      booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                      booking.status === 'completed' ? 'bg-blue-100 text-blue-800' : 
                      'bg-red-100 text-red-800'}">
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </span>
                </div>
              </div>
              <div class="text-right">
                <div class="text-2xl font-bold text-blue-600">{booking.price}</div>
                <div class="text-sm text-gray-500">Total Amount</div>
              </div>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <h3 class="text-sm font-medium text-gray-500 mb-1">Client Information</h3>
                <p class="font-medium text-lg">{booking.client}</p>
                <p class="text-sm text-gray-600">Client ID: {booking.id}-client</p>
              </div>
              <div>
                <h3 class="text-sm font-medium text-gray-500 mb-1">Service Provider</h3>
                <p class="font-medium text-lg">{booking.provider}</p>
                <p class="text-sm text-gray-600">Provider ID: {booking.id}-provider</p>
              </div>
              <div>
                <h3 class="text-sm font-medium text-gray-500 mb-1">Service Date & Time</h3>
                <p class="font-medium">{formatDate(booking.date)}</p>
                <p class="text-sm text-gray-600">{formatTime(booking.time)}</p>
              </div>
              <div>
                <h3 class="text-sm font-medium text-gray-500 mb-1">Service Address</h3>
                <p class="font-medium">{booking.address}</p>
              </div>
              <div>
                <h3 class="text-sm font-medium text-gray-500 mb-1">Booking Created</h3>
                <p class="font-medium">{formatDate(booking.created_at)}</p>
              </div>
              <div>
                <h3 class="text-sm font-medium text-gray-500 mb-1">Last Updated</h3>
                <p class="font-medium">{formatDate(booking.created_at)}</p>
              </div>
            </div>
            
            {#if booking.notes}
              <div class="mb-8">
                <h3 class="text-sm font-medium text-gray-500 mb-2">Special Instructions</h3>
                <div class="p-4 bg-gray-50 rounded-lg">
                  <p class="text-gray-700">{booking.notes}</p>
                </div>
              </div>
            {/if}
            
            <!-- Admin Actions -->
            <div class="border-t border-gray-200 pt-6">
              <h3 class="text-lg font-medium text-gray-900 mb-4">Admin Actions</h3>
              <div class="flex flex-wrap gap-3">
                {#if booking.status === 'pending'}
                  <Button 
                    variant="primary" 
                    disabled={isUpdating} 
                    on:click={() => updateStatus('confirmed')}
                  >
                    {isUpdating ? 'Updating...' : 'Approve Booking'}
                  </Button>
                  <Button 
                    variant="outline" 
                    class="text-red-600 border-red-600 hover:bg-red-50" 
                    disabled={isUpdating} 
                    on:click={() => updateStatus('cancelled')}
                  >
                    {isUpdating ? 'Updating...' : 'Reject Booking'}
                  </Button>
                {:else if booking.status === 'confirmed'}
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
                {:else if booking.status === 'completed'}
                  <Button 
                    variant="outline" 
                    disabled={isUpdating} 
                    on:click={() => updateStatus('confirmed')}
                  >
                    {isUpdating ? 'Updating...' : 'Revert to Confirmed'}
                  </Button>
                {:else if booking.status === 'cancelled'}
                  <Button 
                    variant="outline" 
                    disabled={isUpdating} 
                    on:click={() => updateStatus('pending')}
                  >
                    {isUpdating ? 'Updating...' : 'Reactivate Booking'}
                  </Button>
                {/if}
              </div>
            </div>
          </Card>
        </div>
        
        <!-- Sidebar -->
        <div class="space-y-6">
          <!-- Quick Actions -->
          <Card variant="elevated" padding="lg">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
            <div class="space-y-3">
              <Button variant="outline" fullWidth={true}>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Send Message
              </Button>
              <Button variant="outline" fullWidth={true}>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                View History
              </Button>
              <Button variant="outline" fullWidth={true}>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Generate Report
              </Button>
            </div>
          </Card>
          
          <!-- Booking Timeline -->
          <Card variant="elevated" padding="lg">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Booking Timeline</h3>
            <div class="space-y-4">
              <div class="flex">
                <div class="mr-4 flex flex-col items-center">
                  <div class="w-3 h-3 bg-green-500 rounded-full"></div>
                  <div class="w-0.5 h-full bg-gray-200"></div>
                </div>
                <div>
                  <p class="font-medium text-sm">Booking Created</p>
                  <p class="text-xs text-gray-600">{formatDate(booking.created_at)}</p>
                </div>
              </div>
              
              {#if booking.status !== 'pending'}
                <div class="flex">
                  <div class="mr-4 flex flex-col items-center">
                    <div class="w-3 h-3 bg-green-500 rounded-full"></div>
                    <div class="w-0.5 h-full bg-gray-200"></div>
                  </div>
                  <div>
                    <p class="font-medium text-sm">Status Updated</p>
                    <p class="text-xs text-gray-600">{formatDate(booking.created_at)}</p>
                  </div>
                </div>
              {/if}
              
              {#if booking.status === 'completed'}
                <div class="flex">
                  <div class="mr-4 flex flex-col items-center">
                    <div class="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <div>
                    <p class="font-medium text-sm">Service Completed</p>
                    <p class="text-xs text-gray-600">{formatDate(booking.created_at)}</p>
                  </div>
                </div>
              {:else if booking.status === 'cancelled'}
                <div class="flex">
                  <div class="mr-4 flex flex-col items-center">
                    <div class="w-3 h-3 bg-red-500 rounded-full"></div>
                  </div>
                  <div>
                    <p class="font-medium text-sm">Booking Cancelled</p>
                    <p class="text-xs text-gray-600">{formatDate(booking.created_at)}</p>
                  </div>
                </div>
              {/if}
            </div>
          </Card>
        </div>
      </div>
    {/if}
  </main>
</div>
