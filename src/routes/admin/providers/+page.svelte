<script lang="ts">
  import { onMount } from 'svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import Card from '$lib/components/ui/Card.svelte';
  
  // Mock provider data
  const providers = [
    {
      id: '1',
      name: 'Service Provider',
      email: 'provider@fait.com',
      phone: '(555) 123-4567',
      services: ['Home Cleaning', 'Office Cleaning'],
      rating: 4.8,
      totalJobs: 45,
      status: 'active',
      joinDate: '2023-01-15',
      verified: true
    },
    {
      id: '2',
      name: 'Assembly Experts',
      email: 'assembly@experts.com',
      phone: '(555) 234-5678',
      services: ['Furniture Assembly', 'IKEA Assembly'],
      rating: 4.6,
      totalJobs: 32,
      status: 'active',
      joinDate: '2023-02-20',
      verified: true
    },
    {
      id: '3',
      name: 'Green Gardens Co-op',
      email: 'info@greengardens.com',
      phone: '(555) 345-6789',
      services: ['Lawn Mowing', 'Garden Maintenance', 'Landscaping'],
      rating: 4.9,
      totalJobs: 67,
      status: 'active',
      joinDate: '2023-01-08',
      verified: true
    },
    {
      id: '4',
      name: 'Fix It Fast',
      email: 'contact@fixitfast.com',
      phone: '(555) 456-7890',
      services: ['Plumbing', 'Electrical', 'Handyman'],
      rating: 4.5,
      totalJobs: 28,
      status: 'pending',
      joinDate: '2023-06-10',
      verified: false
    }
  ];
  
  // Filter states
  let statusFilter = 'all';
  let searchTerm = '';
  
  // Reactive filtered providers
  $: filteredProviders = providers.filter(provider => {
    const matchesStatus = statusFilter === 'all' || provider.status === statusFilter;
    const matchesSearch = !searchTerm || 
      provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      provider.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      provider.services.some(service => service.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesStatus && matchesSearch;
  });
  
  // Handle provider actions
  function approveProvider(id: string) {
    console.log(`Approving provider ${id}`);
    // In a real app, this would call an API
  }
  
  function suspendProvider(id: string) {
    console.log(`Suspending provider ${id}`);
    // In a real app, this would call an API
  }
  
  function verifyProvider(id: string) {
    console.log(`Verifying provider ${id}`);
    // In a real app, this would call an API
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
</script>

<svelte:head>
  <title>Admin - Manage Providers - FAIT</title>
  <meta name="description" content="Admin dashboard for managing service providers on the FAIT platform." />
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
          <h1 class="text-2xl font-bold text-gray-900">Manage Providers</h1>
        </div>
        <div class="text-sm text-gray-500">
          Total Providers: {providers.length}
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
            <label for="search" class="sr-only">Search providers</label>
            <input
              type="text"
              id="search"
              bind:value={searchTerm}
              placeholder="Search by name, email, or services..."
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
              <option value="active">Active</option>
              <option value="pending">Pending Approval</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
      <Card variant="elevated" padding="md">
        <div class="text-center">
          <div class="text-2xl font-bold text-green-600">
            {providers.filter(p => p.status === 'active').length}
          </div>
          <div class="text-sm text-gray-500">Active</div>
        </div>
      </Card>
      
      <Card variant="elevated" padding="md">
        <div class="text-center">
          <div class="text-2xl font-bold text-yellow-600">
            {providers.filter(p => p.status === 'pending').length}
          </div>
          <div class="text-sm text-gray-500">Pending</div>
        </div>
      </Card>
      
      <Card variant="elevated" padding="md">
        <div class="text-center">
          <div class="text-2xl font-bold text-blue-600">
            {providers.filter(p => p.verified).length}
          </div>
          <div class="text-sm text-gray-500">Verified</div>
        </div>
      </Card>
      
      <Card variant="elevated" padding="md">
        <div class="text-center">
          <div class="text-2xl font-bold text-purple-600">
            {providers.reduce((sum, p) => sum + p.totalJobs, 0)}
          </div>
          <div class="text-sm text-gray-500">Total Jobs</div>
        </div>
      </Card>
    </div>

    <!-- Providers List -->
    {#if filteredProviders.length === 0}
      <Card variant="elevated" padding="lg">
        <div class="text-center text-gray-500">
          {searchTerm || statusFilter !== 'all' ? 'No providers match your filters' : 'No providers found'}
        </div>
      </Card>
    {:else}
      <div class="space-y-4">
        {#each filteredProviders as provider}
          <Card variant="elevated" padding="md">
            <div class="flex flex-col lg:flex-row justify-between">
              <div class="flex-1">
                <div class="flex items-center mb-2">
                  <h3 class="text-lg font-bold mr-3">{provider.name}</h3>
                  <span class="px-2 py-1 text-xs rounded-full 
                    {provider.status === 'active' ? 'bg-green-100 text-green-800' : 
                      provider.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-red-100 text-red-800'}">
                    {provider.status.charAt(0).toUpperCase() + provider.status.slice(1)}
                  </span>
                  {#if provider.verified}
                    <span class="ml-2 px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                      Verified
                    </span>
                  {/if}
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                  <div>
                    <strong>Email:</strong> {provider.email}
                  </div>
                  <div>
                    <strong>Phone:</strong> {provider.phone}
                  </div>
                  <div>
                    <strong>Rating:</strong> ⭐ {provider.rating}/5.0
                  </div>
                  <div>
                    <strong>Total Jobs:</strong> {provider.totalJobs}
                  </div>
                  <div>
                    <strong>Joined:</strong> {formatDate(provider.joinDate)}
                  </div>
                </div>
                
                <div class="text-sm text-gray-600">
                  <strong>Services:</strong> {provider.services.join(', ')}
                </div>
              </div>
              
              <div class="mt-4 lg:mt-0 lg:ml-6 flex flex-col gap-2 lg:w-48">
                <Button variant="primary" href={`/admin/providers/${provider.id}`} size="sm">
                  View Details
                </Button>
                
                {#if provider.status === 'pending'}
                  <Button 
                    variant="outline" 
                    size="sm"
                    on:click={() => approveProvider(provider.id)}
                  >
                    Approve
                  </Button>
                {/if}
                
                {#if !provider.verified}
                  <Button 
                    variant="outline" 
                    size="sm"
                    on:click={() => verifyProvider(provider.id)}
                  >
                    Verify
                  </Button>
                {/if}
                
                {#if provider.status === 'active'}
                  <Button 
                    variant="outline" 
                    size="sm"
                    class="text-red-600 border-red-600 hover:bg-red-50"
                    on:click={() => suspendProvider(provider.id)}
                  >
                    Suspend
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
