<script lang="ts">
  import { onMount } from 'svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import Card from '$lib/components/ui/Card.svelte';
  
  // Mock user data
  const users = [
    {
      id: '1',
      name: 'Admin User',
      email: 'admin@fait.com',
      role: 'admin',
      status: 'active',
      joinDate: '2023-01-01',
      lastLogin: '2023-06-25',
      totalBookings: 0
    },
    {
      id: '2',
      name: 'John Smith',
      email: 'john@example.com',
      role: 'client',
      status: 'active',
      joinDate: '2023-03-15',
      lastLogin: '2023-06-24',
      totalBookings: 3
    },
    {
      id: '3',
      name: 'Jane Doe',
      email: 'jane@example.com',
      role: 'client',
      status: 'active',
      joinDate: '2023-04-20',
      lastLogin: '2023-06-23',
      totalBookings: 2
    },
    {
      id: '4',
      name: 'Service Provider',
      email: 'provider@fait.com',
      role: 'provider',
      status: 'active',
      joinDate: '2023-02-10',
      lastLogin: '2023-06-25',
      totalBookings: 45
    },
    {
      id: '5',
      name: 'Mike Chen',
      email: 'mike@example.com',
      role: 'client',
      status: 'suspended',
      joinDate: '2023-05-01',
      lastLogin: '2023-06-15',
      totalBookings: 1
    }
  ];
  
  // Filter states
  let roleFilter = 'all';
  let statusFilter = 'all';
  let searchTerm = '';
  
  // Reactive filtered users
  $: filteredUsers = users.filter(user => {
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    const matchesSearch = !searchTerm || 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesRole && matchesStatus && matchesSearch;
  });
  
  // Handle user actions
  function suspendUser(id: string) {
    console.log(`Suspending user ${id}`);
    // In a real app, this would call an API
  }
  
  function activateUser(id: string) {
    console.log(`Activating user ${id}`);
    // In a real app, this would call an API
  }
  
  function deleteUser(id: string) {
    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      console.log(`Deleting user ${id}`);
      // In a real app, this would call an API
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
  
  // Get role badge color
  function getRoleBadgeColor(role: string) {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'provider': return 'bg-blue-100 text-blue-800';
      case 'client': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }
</script>

<svelte:head>
  <title>Admin - Manage Users - FAIT</title>
  <meta name="description" content="Admin dashboard for managing users on the FAIT platform." />
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
          <h1 class="text-2xl font-bold text-gray-900">Manage Users</h1>
        </div>
        <div class="text-sm text-gray-500">
          Total Users: {users.length}
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
            <label for="search" class="sr-only">Search users</label>
            <input
              type="text"
              id="search"
              bind:value={searchTerm}
              placeholder="Search by name or email..."
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <!-- Role Filter -->
          <div class="sm:w-48">
            <label for="role" class="sr-only">Filter by role</label>
            <select
              id="role"
              bind:value={roleFilter}
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="provider">Provider</option>
              <option value="client">Client</option>
            </select>
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
            {users.filter(u => u.role === 'client').length}
          </div>
          <div class="text-sm text-gray-500">Clients</div>
        </div>
      </Card>
      
      <Card variant="elevated" padding="md">
        <div class="text-center">
          <div class="text-2xl font-bold text-blue-600">
            {users.filter(u => u.role === 'provider').length}
          </div>
          <div class="text-sm text-gray-500">Providers</div>
        </div>
      </Card>
      
      <Card variant="elevated" padding="md">
        <div class="text-center">
          <div class="text-2xl font-bold text-red-600">
            {users.filter(u => u.role === 'admin').length}
          </div>
          <div class="text-sm text-gray-500">Admins</div>
        </div>
      </Card>
      
      <Card variant="elevated" padding="md">
        <div class="text-center">
          <div class="text-2xl font-bold text-yellow-600">
            {users.filter(u => u.status === 'suspended').length}
          </div>
          <div class="text-sm text-gray-500">Suspended</div>
        </div>
      </Card>
    </div>

    <!-- Users List -->
    {#if filteredUsers.length === 0}
      <Card variant="elevated" padding="lg">
        <div class="text-center text-gray-500">
          {searchTerm || roleFilter !== 'all' || statusFilter !== 'all' ? 'No users match your filters' : 'No users found'}
        </div>
      </Card>
    {:else}
      <div class="space-y-4">
        {#each filteredUsers as user}
          <Card variant="elevated" padding="md">
            <div class="flex flex-col lg:flex-row justify-between">
              <div class="flex-1">
                <div class="flex items-center mb-2">
                  <h3 class="text-lg font-bold mr-3">{user.name}</h3>
                  <span class="px-2 py-1 text-xs rounded-full {getRoleBadgeColor(user.role)}">
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </span>
                  <span class="ml-2 px-2 py-1 text-xs rounded-full 
                    {user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                    {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                  </span>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                  <div>
                    <strong>Email:</strong> {user.email}
                  </div>
                  <div>
                    <strong>Joined:</strong> {formatDate(user.joinDate)}
                  </div>
                  <div>
                    <strong>Last Login:</strong> {formatDate(user.lastLogin)}
                  </div>
                  <div>
                    <strong>Total Bookings:</strong> {user.totalBookings}
                  </div>
                </div>
              </div>
              
              <div class="mt-4 lg:mt-0 lg:ml-6 flex flex-col gap-2 lg:w-48">
                <Button variant="primary" href={`/admin/users/${user.id}`} size="sm">
                  View Details
                </Button>
                
                {#if user.status === 'active'}
                  <Button 
                    variant="outline" 
                    size="sm"
                    class="text-yellow-600 border-yellow-600 hover:bg-yellow-50"
                    on:click={() => suspendUser(user.id)}
                  >
                    Suspend
                  </Button>
                {:else}
                  <Button 
                    variant="outline" 
                    size="sm"
                    on:click={() => activateUser(user.id)}
                  >
                    Activate
                  </Button>
                {/if}
                
                <Button 
                  variant="outline" 
                  size="sm"
                  class="text-red-600 border-red-600 hover:bg-red-50"
                  on:click={() => deleteUser(user.id)}
                >
                  Delete
                </Button>
              </div>
            </div>
          </Card>
        {/each}
      </div>
    {/if}
  </main>
</div>
