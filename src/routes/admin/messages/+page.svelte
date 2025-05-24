<script lang="ts">
  import { onMount } from 'svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import Card from '$lib/components/ui/Card.svelte';
  
  // Mock message data
  const messages = [
    {
      id: '1',
      from: 'john@example.com',
      to: 'provider@fait.com',
      subject: 'Question about cleaning service',
      content: 'Hi, I have a question about the eco-friendly cleaning products you mentioned...',
      timestamp: '2023-06-25T10:30:00Z',
      status: 'unread',
      priority: 'normal',
      category: 'service_inquiry'
    },
    {
      id: '2',
      from: 'jane@example.com',
      to: 'support@fait.com',
      subject: 'Booking cancellation request',
      content: 'I need to cancel my upcoming furniture assembly booking due to a schedule conflict...',
      timestamp: '2023-06-25T09:15:00Z',
      status: 'read',
      priority: 'high',
      category: 'booking_issue'
    },
    {
      id: '3',
      from: 'provider@fait.com',
      to: 'admin@fait.com',
      subject: 'Payment issue',
      content: 'I have not received payment for my last completed job. Can you please check the status?',
      timestamp: '2023-06-24T16:45:00Z',
      status: 'replied',
      priority: 'high',
      category: 'payment_issue'
    },
    {
      id: '4',
      from: 'mike@example.com',
      to: 'support@fait.com',
      subject: 'Great service!',
      content: 'Just wanted to say thank you for the excellent lawn mowing service. Very professional!',
      timestamp: '2023-06-24T14:20:00Z',
      status: 'read',
      priority: 'low',
      category: 'feedback'
    }
  ];
  
  // Filter states
  let statusFilter = 'all';
  let priorityFilter = 'all';
  let categoryFilter = 'all';
  let searchTerm = '';
  
  // Reactive filtered messages
  $: filteredMessages = messages.filter(message => {
    const matchesStatus = statusFilter === 'all' || message.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || message.priority === priorityFilter;
    const matchesCategory = categoryFilter === 'all' || message.category === categoryFilter;
    const matchesSearch = !searchTerm || 
      message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.content.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesPriority && matchesCategory && matchesSearch;
  });
  
  // Handle message actions
  function markAsRead(id: string) {
    console.log(`Marking message ${id} as read`);
    // In a real app, this would call an API
  }
  
  function markAsUnread(id: string) {
    console.log(`Marking message ${id} as unread`);
    // In a real app, this would call an API
  }
  
  function deleteMessage(id: string) {
    if (confirm('Are you sure you want to delete this message?')) {
      console.log(`Deleting message ${id}`);
      // In a real app, this would call an API
    }
  }
  
  // Format timestamp
  function formatTimestamp(timestamp: string) {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  
  // Get priority badge color
  function getPriorityBadgeColor(priority: string) {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'normal': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }
  
  // Get status badge color
  function getStatusBadgeColor(status: string) {
    switch (status) {
      case 'unread': return 'bg-blue-100 text-blue-800';
      case 'read': return 'bg-gray-100 text-gray-800';
      case 'replied': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }
</script>

<svelte:head>
  <title>Admin - Manage Messages - FAIT</title>
  <meta name="description" content="Admin dashboard for managing messages on the FAIT platform." />
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
          <h1 class="text-2xl font-bold text-gray-900">Manage Messages</h1>
        </div>
        <div class="text-sm text-gray-500">
          Total Messages: {messages.length}
        </div>
      </div>
    </div>
  </header>

  <!-- Main Content -->
  <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
    <!-- Filters and Search -->
    <div class="bg-white shadow rounded-lg mb-6">
      <div class="px-6 py-4">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <!-- Search -->
          <div class="lg:col-span-1">
            <label for="search" class="sr-only">Search messages</label>
            <input
              type="text"
              id="search"
              bind:value={searchTerm}
              placeholder="Search messages..."
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <!-- Status Filter -->
          <div>
            <label for="status" class="sr-only">Filter by status</label>
            <select
              id="status"
              bind:value={statusFilter}
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
              <option value="replied">Replied</option>
            </select>
          </div>
          
          <!-- Priority Filter -->
          <div>
            <label for="priority" class="sr-only">Filter by priority</label>
            <select
              id="priority"
              bind:value={priorityFilter}
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Priorities</option>
              <option value="high">High</option>
              <option value="normal">Normal</option>
              <option value="low">Low</option>
            </select>
          </div>
          
          <!-- Category Filter -->
          <div>
            <label for="category" class="sr-only">Filter by category</label>
            <select
              id="category"
              bind:value={categoryFilter}
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Categories</option>
              <option value="service_inquiry">Service Inquiry</option>
              <option value="booking_issue">Booking Issue</option>
              <option value="payment_issue">Payment Issue</option>
              <option value="feedback">Feedback</option>
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
            {messages.filter(m => m.status === 'unread').length}
          </div>
          <div class="text-sm text-gray-500">Unread</div>
        </div>
      </Card>
      
      <Card variant="elevated" padding="md">
        <div class="text-center">
          <div class="text-2xl font-bold text-red-600">
            {messages.filter(m => m.priority === 'high').length}
          </div>
          <div class="text-sm text-gray-500">High Priority</div>
        </div>
      </Card>
      
      <Card variant="elevated" padding="md">
        <div class="text-center">
          <div class="text-2xl font-bold text-green-600">
            {messages.filter(m => m.status === 'replied').length}
          </div>
          <div class="text-sm text-gray-500">Replied</div>
        </div>
      </Card>
      
      <Card variant="elevated" padding="md">
        <div class="text-center">
          <div class="text-2xl font-bold text-purple-600">
            {messages.filter(m => m.category === 'feedback').length}
          </div>
          <div class="text-sm text-gray-500">Feedback</div>
        </div>
      </Card>
    </div>

    <!-- Messages List -->
    {#if filteredMessages.length === 0}
      <Card variant="elevated" padding="lg">
        <div class="text-center text-gray-500">
          {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all' || categoryFilter !== 'all' ? 'No messages match your filters' : 'No messages found'}
        </div>
      </Card>
    {:else}
      <div class="space-y-4">
        {#each filteredMessages as message}
          <Card variant="elevated" padding="md">
            <div class="flex flex-col lg:flex-row justify-between">
              <div class="flex-1">
                <div class="flex items-center mb-2">
                  <h3 class="text-lg font-bold mr-3">{message.subject}</h3>
                  <span class="px-2 py-1 text-xs rounded-full {getStatusBadgeColor(message.status)}">
                    {message.status.charAt(0).toUpperCase() + message.status.slice(1)}
                  </span>
                  <span class="ml-2 px-2 py-1 text-xs rounded-full {getPriorityBadgeColor(message.priority)}">
                    {message.priority.charAt(0).toUpperCase() + message.priority.slice(1)}
                  </span>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                  <div>
                    <strong>From:</strong> {message.from}
                  </div>
                  <div>
                    <strong>To:</strong> {message.to}
                  </div>
                  <div>
                    <strong>Time:</strong> {formatTimestamp(message.timestamp)}
                  </div>
                </div>
                
                <div class="text-sm text-gray-600">
                  <strong>Message:</strong> {message.content.substring(0, 150)}{message.content.length > 150 ? '...' : ''}
                </div>
              </div>
              
              <div class="mt-4 lg:mt-0 lg:ml-6 flex flex-col gap-2 lg:w-48">
                <Button variant="primary" href={`/admin/messages/${message.id}`} size="sm">
                  View Full
                </Button>
                
                {#if message.status === 'unread'}
                  <Button 
                    variant="outline" 
                    size="sm"
                    on:click={() => markAsRead(message.id)}
                  >
                    Mark Read
                  </Button>
                {:else}
                  <Button 
                    variant="outline" 
                    size="sm"
                    on:click={() => markAsUnread(message.id)}
                  >
                    Mark Unread
                  </Button>
                {/if}
                
                <Button 
                  variant="outline" 
                  size="sm"
                  class="text-red-600 border-red-600 hover:bg-red-50"
                  on:click={() => deleteMessage(message.id)}
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
