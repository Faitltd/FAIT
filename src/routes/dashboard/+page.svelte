<script>
  import { supabase } from '$lib/supabase.js';
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  
  let user = null;
  let bookings = [];
  let isLoading = true;
  
  onMount(async () => {
    // Check authentication
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      goto('/login');
      return;
    }
    
    user = session.user;
    
    // Load user bookings (mock data for now)
    setTimeout(() => {
      bookings = [
        {
          id: 1,
          service: 'Handyman Services',
          provider: 'John Smith',
          date: '2024-01-15',
          time: '10:00 AM',
          status: 'confirmed',
          price: '$150'
        },
        {
          id: 2,
          service: 'Cleaning Services',
          provider: 'Clean Team Pro',
          date: '2024-01-20',
          time: '2:00 PM',
          status: 'pending',
          price: '$75'
        }
      ];
      isLoading = false;
    }, 1000);
  });
  
  function getStatusColor(status) {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }
</script>

<svelte:head>
  <title>Dashboard - FAIT</title>
</svelte:head>

<div class="container mx-auto px-4 py-8">
  <div class="max-w-6xl mx-auto">
    <!-- Welcome Section -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-800 mb-2">
        Welcome back{#if user}, {user.email.split('@')[0]}{/if}!
      </h1>
      <p class="text-gray-600">Manage your bookings and account settings</p>
    </div>
    
    <!-- Quick Actions -->
    <div class="grid md:grid-cols-4 gap-6 mb-8">
      <a href="/services" class="bg-blue-600 hover:bg-blue-700 text-white p-6 rounded-lg text-center transition-colors">
        <div class="text-3xl mb-2">🔍</div>
        <h3 class="font-semibold">Find Services</h3>
      </a>
      
      <a href="/bookings" class="bg-green-600 hover:bg-green-700 text-white p-6 rounded-lg text-center transition-colors">
        <div class="text-3xl mb-2">📅</div>
        <h3 class="font-semibold">My Bookings</h3>
      </a>
      
      <a href="/messages" class="bg-purple-600 hover:bg-purple-700 text-white p-6 rounded-lg text-center transition-colors">
        <div class="text-3xl mb-2">💬</div>
        <h3 class="font-semibold">Messages</h3>
      </a>
      
      <a href="/profile" class="bg-gray-600 hover:bg-gray-700 text-white p-6 rounded-lg text-center transition-colors">
        <div class="text-3xl mb-2">⚙️</div>
        <h3 class="font-semibold">Settings</h3>
      </a>
    </div>
    
    <!-- Recent Bookings -->
    <div class="bg-white rounded-lg shadow-lg p-6">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-semibold text-gray-800">Recent Bookings</h2>
        <a href="/bookings" class="text-blue-600 hover:text-blue-700 font-medium">View All</a>
      </div>
      
      {#if isLoading}
        <div class="text-center py-8">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p class="mt-2 text-gray-600">Loading bookings...</p>
        </div>
      {:else if bookings.length > 0}
        <div class="space-y-4">
          {#each bookings as booking}
            <div class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div class="flex justify-between items-start">
                <div>
                  <h3 class="font-semibold text-gray-800">{booking.service}</h3>
                  <p class="text-gray-600">Provider: {booking.provider}</p>
                  <p class="text-gray-600">{booking.date} at {booking.time}</p>
                </div>
                <div class="text-right">
                  <span class="inline-block px-3 py-1 rounded-full text-sm font-medium {getStatusColor(booking.status)}">
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </span>
                  <p class="text-lg font-semibold text-gray-800 mt-1">{booking.price}</p>
                </div>
              </div>
            </div>
          {/each}
        </div>
      {:else}
        <div class="text-center py-8">
          <div class="text-4xl mb-4">📅</div>
          <h3 class="text-xl font-semibold text-gray-800 mb-2">No bookings yet</h3>
          <p class="text-gray-600 mb-4">Start by browsing our services and booking your first appointment.</p>
          <a href="/services" class="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg">
            Browse Services
          </a>
        </div>
      {/if}
    </div>
  </div>
</div>