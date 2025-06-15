<script>
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import ServiceCard from '$lib/components/ServiceCard.svelte';
  import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
  
  let searchQuery = '';
  let selectedCategory = 'all';
  let location = '';
  let isLoading = false;
  let searchResults = [];
  
  // Get search query from URL params
  $: if ($page.url.searchParams.get('q')) {
    searchQuery = $page.url.searchParams.get('q');
    performSearch();
  }
  
  const categories = [
    { id: 'all', name: 'All Services' },
    { id: 'handyman', name: 'Handyman' },
    { id: 'electrical', name: 'Electrical' },
    { id: 'plumbing', name: 'Plumbing' },
    { id: 'cleaning', name: 'Cleaning' },
    { id: 'landscaping', name: 'Landscaping' },
    { id: 'improvement', name: 'Home Improvement' }
  ];
  
  const allServices = [
    { id: 1, icon: '🔧', title: 'Handyman Services', description: 'General repairs and maintenance', price: '$75/hr', category: 'handyman' },
    { id: 2, icon: '🏠', title: 'Home Improvement', description: 'Remodeling and renovations', price: 'Custom Quote', category: 'improvement' },
    { id: 3, icon: '🔌', title: 'Electrical Services', description: 'Licensed electrical work', price: '$95/hr', category: 'electrical' },
    { id: 4, icon: '🚿', title: 'Plumbing Services', description: 'Professional plumbing repairs', price: '$85/hr', category: 'plumbing' },
    { id: 5, icon: '🧹', title: 'Cleaning Services', description: 'House and deep cleaning', price: '$25/hr', category: 'cleaning' },
    { id: 6, icon: '🌿', title: 'Landscaping', description: 'Lawn care and outdoor maintenance', price: '$45/hr', category: 'landscaping' }
  ];
  
  function performSearch() {
    isLoading = true;
    
    // Simulate API search
    setTimeout(() => {
      let results = allServices;
      
      // Filter by search query
      if (searchQuery.trim()) {
        results = results.filter(service => 
          service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          service.description.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      
      // Filter by category
      if (selectedCategory !== 'all') {
        results = results.filter(service => service.category === selectedCategory);
      }
      
      searchResults = results;
      isLoading = false;
    }, 500);
  }
  
  function handleSearch() {
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (selectedCategory !== 'all') params.set('category', selectedCategory);
    if (location) params.set('location', location);
    
    goto(`/search?${params.toString()}`);
    performSearch();
  }
  
  function handleServiceClick(service) {
    goto(`/services/${service.id}`);
  }
</script>

<svelte:head>
  <title>Search Services - FAIT</title>
</svelte:head>

<div class="container mx-auto px-4 py-8">
  <div class="max-w-6xl mx-auto">
    <!-- Search Header -->
    <div class="text-center mb-8">
      <h1 class="text-4xl font-bold text-gray-800 mb-4">Find Services</h1>
      <p class="text-xl text-gray-600">Search for professional home services in your area</p>
    </div>
    
    <!-- Search Form -->
    <div class="bg-white rounded-lg shadow-lg p-6 mb-8">
      <form on:submit|preventDefault={handleSearch} class="space-y-4">
        <div class="grid md:grid-cols-3 gap-4">
          <div>
            <label for="search" class="block text-sm font-medium text-gray-700 mb-2">What do you need?</label>
            <input
              type="text"
              id="search"
              bind:value={searchQuery}
              placeholder="e.g., plumbing, electrical, cleaning..."
              class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label for="category" class="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              id="category"
              bind:value={selectedCategory}
              class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {#each categories as category}
                <option value={category.id}>{category.name}</option>
              {/each}
            </select>
          </div>
          
          <div>
            <label for="location" class="block text-sm font-medium text-gray-700 mb-2">Location</label>
            <input
              type="text"
              id="location"
              bind:value={location}
              placeholder="Enter your zip code"
              class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        
        <div class="text-center">
          <button
            type="submit"
            class="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
          >
            Search Services
          </button>
        </div>
      </form>
    </div>
    
    <!-- Search Results -->
    <div>
      {#if isLoading}
        <div class="text-center py-12">
          <LoadingSpinner size="large" />
          <p class="mt-4 text-gray-600">Searching for services...</p>
        </div>
      {:else if searchResults.length > 0}
        <div class="mb-6">
          <h2 class="text-2xl font-semibold text-gray-800">
            Found {searchResults.length} service{searchResults.length !== 1 ? 's' : ''}
            {#if searchQuery}for "{searchQuery}"{/if}
          </h2>
        </div>
        
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {#each searchResults as service}
            <ServiceCard {service} onClick={() => handleServiceClick(service)} />
          {/each}
        </div>
      {:else if searchQuery || selectedCategory !== 'all'}
        <div class="text-center py-12">
          <div class="text-6xl mb-4">🔍</div>
          <h2 class="text-2xl font-semibold text-gray-800 mb-2">No services found</h2>
          <p class="text-gray-600 mb-6">Try adjusting your search criteria or browse all services.</p>
          <a href="/services" class="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg">
            Browse All Services
          </a>
        </div>
      {:else}
        <div class="text-center py-12">
          <div class="text-6xl mb-4">🏠</div>
          <h2 class="text-2xl font-semibold text-gray-800 mb-2">Start your search</h2>
          <p class="text-gray-600">Enter what you're looking for above to find the perfect service provider.</p>
        </div>
      {/if}
    </div>
  </div>
</div>