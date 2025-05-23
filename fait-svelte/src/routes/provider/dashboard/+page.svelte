<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { auth } from '$lib/stores/auth';
  import { bookings } from '$lib/stores/bookings';
  import { api } from '$lib/services/api';
  import Button from '$lib/components/ui/Button.svelte';
  import Card from '$lib/components/ui/Card.svelte';
  import { fade, fly } from 'svelte/transition';
  import type { Service } from '$lib/services/supabase';
  
  // State
  let activeTab: 'overview' | 'services' | 'bookings' | 'earnings' = 'overview';
  let services: Service[] = [];
  let isLoading = true;
  let error: string | null = null;
  
  // Stats
  let stats = {
    totalBookings: 0,
    pendingBookings: 0,
    completedBookings: 0,
    totalEarnings: 0,
    thisMonthEarnings: 0
  };
  
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
      isLoading = true;
      
      // Load provider services
      services = await api.services.getByProviderId($auth.user.id);
      
      // Load bookings
      await bookings.loadUserBookings();
      
      // Calculate stats
      calculateStats();
      
      isLoading = false;
    } catch (err) {
      console.error('Failed to load provider data:', err);
      error = err instanceof Error ? err.message : 'Failed to load provider data';
      isLoading = false;
    }
  });
  
  // Calculate dashboard stats
  function calculateStats() {
    // Get all bookings for this provider
    const providerBookings = $bookings.bookings.filter(booking => 
      booking.providerId === $auth.user?.id
    );
    
    // Total bookings
    stats.totalBookings = providerBookings.length;
    
    // Pending bookings
    stats.pendingBookings = providerBookings.filter(booking => 
      booking.status === 'pending'
    ).length;
    
    // Completed bookings
    stats.completedBookings = providerBookings.filter(booking => 
      booking.status === 'completed'
    ).length;
    
    // Total earnings (from completed bookings)
    stats.totalEarnings = providerBookings
      .filter(booking => booking.status === 'completed')
      .reduce((total, booking) => total + parseFloat(booking.price), 0);
    
    // This month earnings
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();
    
    stats.thisMonthEarnings = providerBookings
      .filter(booking => {
        const bookingDate = new Date(booking.date);
        return booking.status === 'completed' && 
               bookingDate.getMonth() === thisMonth && 
               bookingDate.getFullYear() === thisYear;
      })
      .reduce((total, booking) => total + parseFloat(booking.price), 0);
  }
  
  // Format currency
  function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }
  
  // Format date
  function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }
  
  // Handle service action
  function handleServiceAction(serviceId: string, action: 'edit' | 'view') {
    if (action === 'edit') {
      goto(`/provider/services/edit/${serviceId}`);
    } else {
      goto(`/services/${serviceId}`);
    }
  }
  
  // Handle booking action
  function handleBookingAction(bookingId: string, action: 'view' | 'confirm' | 'complete' | 'cancel') {
    if (action === 'view') {
      goto(`/bookings/${bookingId}`);
    } else if (action === 'confirm') {
      confirmBooking(bookingId);
    } else if (action === 'complete') {
      completeBooking(bookingId);
    } else if (action === 'cancel') {
      cancelBooking(bookingId);
    }
  }
  
  // Confirm booking
  async function confirmBooking(bookingId: string) {
    if (confirm('Are you sure you want to confirm this booking?')) {
      await bookings.updateBooking(bookingId, { status: 'confirmed' });
      calculateStats();
    }
  }
  
  // Complete booking
  async function completeBooking(bookingId: string) {
    if (confirm('Are you sure you want to mark this booking as completed?')) {
      await bookings.updateBooking(bookingId, { status: 'completed' });
      calculateStats();
    }
  }
  
  // Cancel booking
  async function cancelBooking(bookingId: string) {
    if (confirm('Are you sure you want to cancel this booking?')) {
      await bookings.cancelBooking(bookingId);
      calculateStats();
    }
  }
</script>

<svelte:head>
  <title>Provider Dashboard - FAIT</title>
  <meta name="description" content="Manage your services and bookings as a provider." />
</svelte:head>

<section class="bg-fait-light py-12">
  <div class="container-custom">
    <h1 class="text-3xl font-ivy font-bold text-fait-dark mb-6">Provider Dashboard</h1>
    
    {#if isLoading}
      <div class="flex justify-center items-center py-12">
        <div class="spinner"></div>
      </div>
    {:else if error}
      <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6" in:fade>
        <p>{error}</p>
        <Button variant="secondary" size="sm" class="mt-2" on:click={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    {:else}
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <!-- Sidebar -->
        <div class="lg:col-span-1">
          <Card variant="default" padding="md">
            <div class="flex flex-col space-y-2">
              <button
                class="text-left px-4 py-2 rounded-md {activeTab === 'overview' ? 'bg-fait-blue text-white' : 'hover:bg-gray-100'}"
                on:click={() => activeTab = 'overview'}
                aria-selected={activeTab === 'overview'}
                role="tab"
              >
                Overview
              </button>
              <button
                class="text-left px-4 py-2 rounded-md {activeTab === 'services' ? 'bg-fait-blue text-white' : 'hover:bg-gray-100'}"
                on:click={() => activeTab = 'services'}
                aria-selected={activeTab === 'services'}
                role="tab"
              >
                My Services
              </button>
              <button
                class="text-left px-4 py-2 rounded-md {activeTab === 'bookings' ? 'bg-fait-blue text-white' : 'hover:bg-gray-100'}"
                on:click={() => activeTab = 'bookings'}
                aria-selected={activeTab === 'bookings'}
                role="tab"
              >
                Bookings
              </button>
              <button
                class="text-left px-4 py-2 rounded-md {activeTab === 'earnings' ? 'bg-fait-blue text-white' : 'hover:bg-gray-100'}"
                on:click={() => activeTab = 'earnings'}
                aria-selected={activeTab === 'earnings'}
                role="tab"
              >
                Earnings
              </button>
            </div>
            
            <div class="mt-6 pt-6 border-t border-gray-200">
              <Button 
                variant="primary" 
                size="md" 
                fullWidth={true}
                on:click={() => goto('/provider/services/new')}
              >
                Add New Service
              </Button>
            </div>
          </Card>
        </div>
        
        <!-- Main content -->
        <div class="lg:col-span-3">
          {#if activeTab === 'overview'}
            <div in:fade>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card variant="default" padding="md" class="bg-blue-50">
                  <h3 class="text-lg font-medium text-gray-700">Total Bookings</h3>
                  <p class="text-3xl font-bold text-fait-blue mt-2">{stats.totalBookings}</p>
                </Card>
                
                <Card variant="default" padding="md" class="bg-yellow-50">
                  <h3 class="text-lg font-medium text-gray-700">Pending Bookings</h3>
                  <p class="text-3xl font-bold text-yellow-600 mt-2">{stats.pendingBookings}</p>
                </Card>
                
                <Card variant="default" padding="md" class="bg-green-50">
                  <h3 class="text-lg font-medium text-gray-700">Total Earnings</h3>
                  <p class="text-3xl font-bold text-green-600 mt-2">{formatCurrency(stats.totalEarnings)}</p>
                </Card>
              </div>
              
              <Card variant="elevated" padding="lg">
                <h2 class="text-xl font-bold mb-4">Recent Activity</h2>
                
                {#if $bookings.bookings.length === 0}
                  <p class="text-gray-600 py-4">No recent bookings found.</p>
                {:else}
                  <div class="space-y-4">
                    {#each $bookings.bookings.slice(0, 5) as booking}
                      <div class="border-b border-gray-200 pb-4 last:border-0 last:pb-0">
                        <div class="flex justify-between items-start">
                          <div>
                            <p class="font-medium">Booking for {booking.serviceId}</p>
                            <p class="text-sm text-gray-600">
                              {formatDate(booking.date)} at {booking.time}
                            </p>
                            <p class="text-sm mt-1">
                              <span class="inline-block px-2 py-1 text-xs rounded-full
                                {booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                                 booking.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                                 booking.status === 'completed' ? 'bg-green-100 text-green-800' :
                                 'bg-red-100 text-red-800'}">
                                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                              </span>
                            </p>
                          </div>
                          <div class="text-right">
                            <p class="font-bold text-fait-blue">${booking.price}</p>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              class="mt-2"
                              on:click={() => handleBookingAction(booking.id, 'view')}
                            >
                              View Details
                            </Button>
                          </div>
                        </div>
                      </div>
                    {/each}
                  </div>
                {/if}
                
                <div class="mt-4 text-center">
                  <Button 
                    variant="text" 
                    on:click={() => activeTab = 'bookings'}
                  >
                    View All Bookings
                  </Button>
                </div>
              </Card>
            </div>
          {:else if activeTab === 'services'}
            <div in:fade>
              <Card variant="elevated" padding="lg">
                <div class="flex justify-between items-center mb-6">
                  <h2 class="text-xl font-bold">My Services</h2>
                  <Button 
                    variant="primary" 
                    size="sm"
                    on:click={() => goto('/provider/services/new')}
                  >
                    Add New Service
                  </Button>
                </div>
                
                {#if services.length === 0}
                  <div class="text-center py-8 bg-gray-50 rounded-md">
                    <p class="text-gray-600 mb-4">You haven't added any services yet.</p>
                    <Button 
                      variant="primary"
                      on:click={() => goto('/provider/services/new')}
                    >
                      Add Your First Service
                    </Button>
                  </div>
                {:else}
                  <div class="space-y-6">
                    {#each services as service}
                      <div class="border rounded-md overflow-hidden">
                        <div class="flex flex-col md:flex-row">
                          {#if service.image_url}
                            <div class="w-full md:w-48 h-48 flex-shrink-0">
                              <img 
                                src={service.image_url} 
                                alt={service.title} 
                                class="w-full h-full object-cover"
                              />
                            </div>
                          {/if}
                          
                          <div class="p-4 flex-1">
                            <div class="flex justify-between items-start">
                              <div>
                                <h3 class="text-lg font-bold">{service.title}</h3>
                                <p class="text-sm text-gray-600 mt-1">
                                  {service.price_type === 'hourly' ? `$${service.price}/hr` : `$${service.price}`}
                                </p>
                              </div>
                              <span class="inline-block px-2 py-1 text-xs rounded-full
                                {service.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}">
                                {service.active ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                            
                            <p class="mt-2 text-gray-700 line-clamp-2">{service.description}</p>
                            
                            <div class="mt-4 flex justify-end space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                on:click={() => handleServiceAction(service.id, 'view')}
                              >
                                View
                              </Button>
                              <Button 
                                variant="primary" 
                                size="sm"
                                on:click={() => handleServiceAction(service.id, 'edit')}
                              >
                                Edit
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    {/each}
                  </div>
                {/if}
              </Card>
            </div>
          {:else if activeTab === 'bookings'}
            <div in:fade>
              <Card variant="elevated" padding="lg">
                <h2 class="text-xl font-bold mb-6">Manage Bookings</h2>
                
                <div class="border-b border-gray-200 mb-6">
                  <nav class="flex -mb-px">
                    <button
                      class="py-2 px-4 border-b-2 font-medium text-sm {$bookings.pendingBookings.length > 0 ? 'border-fait-blue text-fait-blue' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}"
                      on:click={() => activeTab = 'bookings'}
                    >
                      Pending
                      {#if $bookings.pendingBookings.length > 0}
                        <span class="ml-2 bg-fait-blue text-white text-xs px-2 py-0.5 rounded-full">{$bookings.pendingBookings.length}</span>
                      {/if}
                    </button>
                    
                    <button
                      class="py-2 px-4 border-b-2 font-medium text-sm {$bookings.confirmedBookings.length > 0 ? 'border-fait-blue text-fait-blue' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}"
                      on:click={() => activeTab = 'bookings'}
                    >
                      Confirmed
                      {#if $bookings.confirmedBookings.length > 0}
                        <span class="ml-2 bg-fait-blue text-white text-xs px-2 py-0.5 rounded-full">{$bookings.confirmedBookings.length}</span>
                      {/if}
                    </button>
                    
                    <button
                      class="py-2 px-4 border-b-2 font-medium text-sm border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      on:click={() => activeTab = 'bookings'}
                    >
                      Completed
                    </button>
                    
                    <button
                      class="py-2 px-4 border-b-2 font-medium text-sm border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      on:click={() => activeTab = 'bookings'}
                    >
                      Cancelled
                    </button>
                  </nav>
                </div>
                
                {#if $bookings.bookings.length === 0}
                  <div class="text-center py-8 bg-gray-50 rounded-md">
                    <p class="text-gray-600">No bookings found.</p>
                  </div>
                {:else}
                  <div class="space-y-6">
                    {#each $bookings.pendingBookings as booking}
                      <div class="border rounded-md p-4">
                        <div class="flex flex-col md:flex-row md:items-center md:justify-between">
                          <div class="mb-4 md:mb-0">
                            <div class="flex items-center mb-2">
                              <span class="text-lg font-bold">{booking.serviceId}</span>
                              <span class="ml-3 px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                                Pending
                              </span>
                            </div>
                            
                            <div class="text-sm text-gray-600">
                              <p><strong>Date:</strong> {formatDate(booking.date)}</p>
                              <p><strong>Time:</strong> {booking.time}</p>
                              <p><strong>Address:</strong> {booking.address}</p>
                              {#if booking.notes}
                                <p><strong>Notes:</strong> {booking.notes}</p>
                              {/if}
                            </div>
                          </div>
                          
                          <div class="flex flex-col space-y-2">
                            <div class="text-fait-blue font-bold text-right">
                              ${booking.price}
                            </div>
                            
                            <div class="flex space-x-2">
                              <Button 
                                variant="primary" 
                                size="sm" 
                                on:click={() => handleBookingAction(booking.id, 'confirm')}
                              >
                                Confirm
                              </Button>
                              
                              <Button 
                                variant="outline" 
                                size="sm" 
                                on:click={() => handleBookingAction(booking.id, 'cancel')}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    {/each}
                  </div>
                {/if}
              </Card>
            </div>
          {:else if activeTab === 'earnings'}
            <div in:fade>
              <Card variant="elevated" padding="lg">
                <h2 class="text-xl font-bold mb-6">Earnings</h2>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div class="bg-green-50 p-4 rounded-md">
                    <h3 class="text-lg font-medium text-gray-700">Total Earnings</h3>
                    <p class="text-3xl font-bold text-green-600 mt-2">{formatCurrency(stats.totalEarnings)}</p>
                  </div>
                  
                  <div class="bg-blue-50 p-4 rounded-md">
                    <h3 class="text-lg font-medium text-gray-700">This Month</h3>
                    <p class="text-3xl font-bold text-fait-blue mt-2">{formatCurrency(stats.thisMonthEarnings)}</p>
                  </div>
                </div>
                
                <div class="border-t border-gray-200 pt-6">
                  <h3 class="text-lg font-medium mb-4">Earnings History</h3>
                  
                  {#if $bookings.completedBookings.length === 0}
                    <p class="text-gray-600 py-4">No completed bookings found.</p>
                  {:else}
                    <div class="overflow-x-auto">
                      <table class="min-w-full divide-y divide-gray-200">
                        <thead class="bg-gray-50">
                          <tr>
                            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Service
                            </th>
                            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Date
                            </th>
                            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Client
                            </th>
                            <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Amount
                            </th>
                          </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200">
                          {#each $bookings.completedBookings as booking}
                            <tr>
                              <td class="px-6 py-4 whitespace-nowrap">
                                <div class="text-sm font-medium text-gray-900">{booking.serviceId}</div>
                              </td>
                              <td class="px-6 py-4 whitespace-nowrap">
                                <div class="text-sm text-gray-500">{formatDate(booking.date)}</div>
                              </td>
                              <td class="px-6 py-4 whitespace-nowrap">
                                <div class="text-sm text-gray-500">{booking.clientId}</div>
                              </td>
                              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <span class="text-fait-blue font-bold">${booking.price}</span>
                              </td>
                            </tr>
                          {/each}
                        </tbody>
                      </table>
                    </div>
                  {/if}
                </div>
              </Card>
            </div>
          {/if}
        </div>
      </div>
    {/if}
  </div>
</section>
