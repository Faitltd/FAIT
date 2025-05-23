<script lang="ts">
  import { onMount } from 'svelte';
  import { auth } from '$lib/stores/auth';
  import { bookings } from '$lib/stores/bookings';
  import { goto } from '$app/navigation';
  import Button from '$lib/components/ui/Button.svelte';
  import Card from '$lib/components/ui/Card.svelte';
  import { fade, fly } from 'svelte/transition';
  
  // State
  let activeTab: 'pending' | 'confirmed' | 'completed' | 'cancelled' = 'pending';
  
  // Load bookings on mount
  onMount(async () => {
    // Check if user is authenticated
    await auth.checkAuth();
    
    if (!$auth.isAuthenticated) {
      // Redirect to login if not authenticated
      goto('/login');
      return;
    }
    
    // Load user bookings
    await bookings.loadUserBookings();
  });
  
  // Format date
  function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }
  
  // Format time
  function formatTime(timeString: string): string {
    // Assuming timeString is in 24-hour format like "14:00"
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  }
  
  // Get status badge class
  function getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }
  
  // Cancel booking
  async function cancelBooking(bookingId: string) {
    if (confirm('Are you sure you want to cancel this booking?')) {
      await bookings.cancelBooking(bookingId);
    }
  }
</script>

<svelte:head>
  <title>My Bookings - FAIT</title>
  <meta name="description" content="View and manage your service bookings." />
</svelte:head>

<section class="bg-fait-light py-12">
  <div class="container-custom">
    <h1 class="text-3xl font-ivy font-bold text-fait-dark mb-6">My Bookings</h1>
    
    {#if $bookings.isLoading}
      <div class="flex justify-center items-center py-12">
        <div class="spinner"></div>
      </div>
    {:else if $bookings.error}
      <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6" in:fade>
        <p>{$bookings.error}</p>
        <Button variant="secondary" size="sm" class="mt-2" on:click={() => bookings.loadUserBookings()}>
          Try Again
        </Button>
      </div>
    {:else}
      <!-- Tabs -->
      <div class="border-b border-gray-200 mb-6">
        <nav class="flex -mb-px">
          <button
            class="py-2 px-4 border-b-2 font-medium text-sm {activeTab === 'pending' ? 'border-fait-blue text-fait-blue' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}"
            on:click={() => activeTab = 'pending'}
          >
            Pending
            {#if $bookings.pendingBookings.length > 0}
              <span class="ml-2 bg-fait-blue text-white text-xs px-2 py-0.5 rounded-full">{$bookings.pendingBookings.length}</span>
            {/if}
          </button>
          
          <button
            class="py-2 px-4 border-b-2 font-medium text-sm {activeTab === 'confirmed' ? 'border-fait-blue text-fait-blue' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}"
            on:click={() => activeTab = 'confirmed'}
          >
            Confirmed
            {#if $bookings.confirmedBookings.length > 0}
              <span class="ml-2 bg-fait-blue text-white text-xs px-2 py-0.5 rounded-full">{$bookings.confirmedBookings.length}</span>
            {/if}
          </button>
          
          <button
            class="py-2 px-4 border-b-2 font-medium text-sm {activeTab === 'completed' ? 'border-fait-blue text-fait-blue' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}"
            on:click={() => activeTab = 'completed'}
          >
            Completed
            {#if $bookings.completedBookings.length > 0}
              <span class="ml-2 bg-fait-blue text-white text-xs px-2 py-0.5 rounded-full">{$bookings.completedBookings.length}</span>
            {/if}
          </button>
          
          <button
            class="py-2 px-4 border-b-2 font-medium text-sm {activeTab === 'cancelled' ? 'border-fait-blue text-fait-blue' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}"
            on:click={() => activeTab = 'cancelled'}
          >
            Cancelled
            {#if $bookings.cancelledBookings.length > 0}
              <span class="ml-2 bg-fait-blue text-white text-xs px-2 py-0.5 rounded-full">{$bookings.cancelledBookings.length}</span>
            {/if}
          </button>
        </nav>
      </div>
      
      <!-- Booking list -->
      {#if activeTab === 'pending' && $bookings.pendingBookings.length === 0}
        <div class="text-center py-12 bg-white rounded-lg shadow-md" in:fade>
          <h3 class="text-xl font-medium mb-2">No pending bookings</h3>
          <p class="text-gray-600 mb-4">You don't have any pending bookings at the moment.</p>
          <Button variant="primary" on:click={() => goto('/services')}>
            Browse Services
          </Button>
        </div>
      {:else if activeTab === 'confirmed' && $bookings.confirmedBookings.length === 0}
        <div class="text-center py-12 bg-white rounded-lg shadow-md" in:fade>
          <h3 class="text-xl font-medium mb-2">No confirmed bookings</h3>
          <p class="text-gray-600 mb-4">You don't have any confirmed bookings at the moment.</p>
          <Button variant="primary" on:click={() => goto('/services')}>
            Browse Services
          </Button>
        </div>
      {:else if activeTab === 'completed' && $bookings.completedBookings.length === 0}
        <div class="text-center py-12 bg-white rounded-lg shadow-md" in:fade>
          <h3 class="text-xl font-medium mb-2">No completed bookings</h3>
          <p class="text-gray-600 mb-4">You don't have any completed bookings yet.</p>
          <Button variant="primary" on:click={() => goto('/services')}>
            Browse Services
          </Button>
        </div>
      {:else if activeTab === 'cancelled' && $bookings.cancelledBookings.length === 0}
        <div class="text-center py-12 bg-white rounded-lg shadow-md" in:fade>
          <h3 class="text-xl font-medium mb-2">No cancelled bookings</h3>
          <p class="text-gray-600 mb-4">You don't have any cancelled bookings.</p>
          <Button variant="primary" on:click={() => goto('/services')}>
            Browse Services
          </Button>
        </div>
      {:else}
        <div class="space-y-4">
          {#each activeTab === 'pending' ? $bookings.pendingBookings : 
                 activeTab === 'confirmed' ? $bookings.confirmedBookings :
                 activeTab === 'completed' ? $bookings.completedBookings :
                 $bookings.cancelledBookings as booking, i}
            <Card 
              variant="default" 
              padding="md" 
              class="staggered-list-item"
              in:fly={{ y: 20, duration: 300, delay: i * 100 }}
            >
              <div class="flex flex-col md:flex-row md:items-center md:justify-between">
                <div class="mb-4 md:mb-0">
                  <div class="flex items-center mb-2">
                    <span class="text-lg font-bold">{booking.serviceId}</span>
                    <span class="ml-3 px-2 py-1 text-xs font-medium rounded-full {getStatusBadgeClass(booking.status)}">
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </span>
                  </div>
                  
                  <div class="text-sm text-gray-600">
                    <p><strong>Date:</strong> {formatDate(booking.date)}</p>
                    <p><strong>Time:</strong> {formatTime(booking.time)}</p>
                    <p><strong>Address:</strong> {booking.address}</p>
                    {#if booking.notes}
                      <p><strong>Notes:</strong> {booking.notes}</p>
                    {/if}
                  </div>
                </div>
                
                <div class="flex flex-col space-y-2">
                  <div class="text-fait-blue font-bold text-right">
                    {booking.price}
                  </div>
                  
                  {#if booking.status === 'pending' || booking.status === 'confirmed'}
                    <Button 
                      variant="outline" 
                      size="sm" 
                      on:click={() => cancelBooking(booking.id)}
                    >
                      Cancel Booking
                    </Button>
                  {/if}
                  
                  <Button 
                    variant="primary" 
                    size="sm" 
                    on:click={() => goto(`/bookings/${booking.id}`)}
                  >
                    View Details
                  </Button>
                </div>
              </div>
            </Card>
          {/each}
        </div>
      {/if}
    {/if}
  </div>
</section>
