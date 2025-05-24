<script lang="ts">
  import { onMount } from 'svelte';
  import { auth } from '$lib/stores/auth';
  import { bookings, bookingsStore } from '$lib/stores/bookings';
  import Button from '$lib/components/ui/Button.svelte';
  import Card from '$lib/components/ui/Card.svelte';
  
  // Filter states
  let statusFilter = 'all';
  let searchTerm = '';
  
  // Reactive values
  $: filteredBookings = $bookingsStore.bookings.filter(booking => {
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    const matchesSearch = !searchTerm || 
      booking.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.provider.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.client.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });
  
  // Handle booking actions
  async function updateBookingStatus(id: string, status: string) {
    const result = await bookings.updateBookingStatus(id, status);
    if (!result.success) {
      alert('Failed to update booking status');
    }
  }
  
  async function cancelBooking(id: string) {
    const result = await bookings.cancelBooking(id);
    if (!result.success) {
      alert('Failed to cancel booking');
    }
  }
  
  // Format date
  function formatDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  }
  
  onMount(async () => {
    // Load all bookings for admin
    if ($auth.isAuthenticated && $auth.user) {
      await bookings.loadBookings($auth.user.id, 'admin');
    }
  });
</script>

<svelte:head>
  <title>Admin - Manage Bookings - FAIT</title>
  <meta name="description" content="Admin dashboard for managing all bookings on the FAIT platform." />
</svelte:head>

<div class="min-h-screen bg-gray-50">
  <!-- Header -->
  <header class="bg-white shadow">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center py-6">
        <div class="flex items-center">
          <a href="/admin" class="text-blue-600 hover:text-blue-700 mr-4">
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </a>
          <h1 class="text-2xl font-bold text-gray-900">Manage Bookings</h1>
        </div>
        <div class="text-sm text-gray-500">
          Total Bookings: {$bookingsStore.bookings.length}
        </div>
      </div>
    </div>
  </header>

  <!-- Main Content -->
  <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
    <!-- Filters and Search -->
    <div class="bg-white shadow rounded-lg mb-6">
      <div class="px-6 py-4">
        <div class="flex flex-col sm:flex-row gap-4">
          <!-- Search -->
          <div class="flex-1">
            <label for="search" class="sr-only">Search bookings</label>
            <input
              type="text"
              id="search"
              bind:value={searchTerm}
              placeholder="Search by service, provider, or client..."
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <!-- Status Filter -->
          <div class="sm:w-48">
            <label for="status" class="sr-only">Filter by status</label>
            <select
              id="status"
              bind:value={statusFilter}
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
      <Card variant="elevated" padding="md">
        <div class="text-center">
          <div class="text-2xl font-bold text-blue-600">
            {$bookingsStore.bookings.filter(b => b.status === 'pending').length}
          </div>
          <div class="text-sm text-gray-500">Pending</div>
        </div>
      </Card>
      
      <Card variant="elevated" padding="md">
        <div class="text-center">
          <div class="text-2xl font-bold text-green-600">
            {$bookingsStore.bookings.filter(b => b.status === 'confirmed').length}
          </div>
          <div class="text-sm text-gray-500">Confirmed</div>
        </div>
      </Card>
      
      <Card variant="elevated" padding="md">
        <div class="text-center">
          <div class="text-2xl font-bold text-purple-600">
            {$bookingsStore.bookings.filter(b => b.status === 'completed').length}
          </div>
          <div class="text-sm text-gray-500">Completed</div>
        </div>
      </Card>
      
      <Card variant="elevated" padding="md">
        <div class="text-center">
          <div class="text-2xl font-bold text-red-600">
            {$bookingsStore.bookings.filter(b => b.status === 'cancelled').length}
          </div>
          <div class="text-sm text-gray-500">Cancelled</div>
        </div>
      </Card>
    </div>

    <!-- Bookings List -->
    {#if $bookingsStore.isLoading}
      <Card variant="elevated" padding="lg">
        <div class="text-center text-gray-500">Loading bookings...</div>
      </Card>
    {:else if filteredBookings.length === 0}
      <Card variant="elevated" padding="lg">
        <div class="text-center text-gray-500">
          {searchTerm || statusFilter !== 'all' ? 'No bookings match your filters' : 'No bookings found'}
        </div>
      </Card>
    {:else}
      <div class="space-y-4">
        {#each filteredBookings as booking}
          <Card variant="elevated" padding="md">
            <div class="flex flex-col lg:flex-row justify-between">
              <div class="flex-1">
                <div class="flex items-center mb-2">
                  <h3 class="text-lg font-bold mr-3">{booking.service}</h3>
                  <span class="px-2 py-1 text-xs rounded-full 
                    {booking.status === 'confirmed' ? 'bg-green-100 text-green-800' : 
                      booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                      booking.status === 'completed' ? 'bg-purple-100 text-purple-800' :
                      'bg-red-100 text-red-800'}">
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </span>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                  <div>
                    <strong>Client:</strong> {booking.client}
                  </div>
                  <div>
                    <strong>Provider:</strong> {booking.provider}
                  </div>
                  <div>
                    <strong>Date:</strong> {formatDate(booking.date)} ({booking.time})
                  </div>
                  <div>
                    <strong>Price:</strong> {booking.price}
                  </div>
                  <div>
                    <strong>Address:</strong> {booking.address}
                  </div>
                  <div>
                    <strong>Booked:</strong> {formatDate(booking.created_at)}
                  </div>
                </div>
                
                {#if booking.notes}
                  <div class="mt-2 text-sm text-gray-600">
                    <strong>Notes:</strong> {booking.notes}
                  </div>
                {/if}
              </div>
              
              <div class="mt-4 lg:mt-0 lg:ml-6 flex flex-col gap-2 lg:w-48">
                <Button variant="primary" href={`/admin/bookings/${booking.id}`} size="sm">
                  View Details
                </Button>
                
                {#if booking.status === 'pending'}
                  <Button 
                    variant="outline" 
                    size="sm"
                    on:click={() => updateBookingStatus(booking.id, 'confirmed')}
                  >
                    Approve
                  </Button>
                {/if}
                
                {#if booking.status !== 'cancelled' && booking.status !== 'completed'}
                  <Button 
                    variant="outline" 
                    size="sm"
                    class="text-red-600 border-red-600 hover:bg-red-50"
                    on:click={() => cancelBooking(booking.id)}
                  >
                    Cancel
                  </Button>
                {/if}
              </div>
            </div>
          </Card>
        {/each}
      </div>
    {/if}
  </main>
</div>
