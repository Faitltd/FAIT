<script lang="ts">
  import { onMount } from 'svelte';
  import ServiceSearch from '$lib/components/services/ServiceSearch.svelte';
  import ServiceCard from '$lib/components/services/ServiceCard.svelte';
  import { api } from '$lib/services/api';
  import type { Service } from '$lib/services/supabase';
  import Button from '$lib/components/ui/Button.svelte';

  // Services page component
  const categories = [
    { id: 'home', name: 'Home', icon: '🏠' },
    { id: 'garden', name: 'Garden & Outdoors', icon: '🌱' },
    { id: 'moving', name: 'Moving & Storage', icon: '📦' },
    { id: 'cleaning', name: 'Cleaning', icon: '🧹' },
    { id: 'repair', name: 'Repair & Maintenance', icon: '🔧' },
    { id: 'delivery', name: 'Delivery', icon: '🚚' },
    { id: 'events', name: 'Events', icon: '🎉' },
    { id: 'tech', name: 'Tech Support', icon: '💻' }
  ];

  // State
  let services: Service[] = [];
  let isLoading = true;
  let error: string | null = null;
  let searchQuery = '';
  let searchLocation = '';
  let selectedCategory = '';

  // Load services on mount
  onMount(async () => {
    try {
      isLoading = true;
      services = await api.services.getAll();
    } catch (err) {
      console.error('Failed to load services:', err);
      error = err instanceof Error ? err.message : 'Failed to load services';

      // Fallback to mock data if API fails
      services = getMockServices();
    } finally {
      isLoading = false;
    }
  });

  // Filter services based on search and category
  $: filteredServices = services.filter(service => {
    const matchesSearch = searchQuery === '' ||
      service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === '' || service.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Handle category selection
  function selectCategory(categoryId: string) {
    selectedCategory = selectedCategory === categoryId ? '' : categoryId;
  }

  // Handle search form submission
  function handleSearch(event: CustomEvent) {
    const { query, location } = event.detail;
    searchQuery = query;
    searchLocation = location;
  }

  // Handle booking
  function handleBook(event: CustomEvent) {
    const { id } = event.detail;
    console.log(`Booking service with ID: ${id}`);
    // In a real app, this would navigate to a booking page or open a booking modal
    alert(`Booking service with ID: ${id}`);
  }

  // Mock services for fallback
  function getMockServices(): Service[] {
    return [
      {
        id: '1',
        title: 'Home Cleaning',
        description: 'Professional cleaning services for your home.',
        category: 'cleaning',
        price: 25,
        price_type: 'hourly',
        duration: 120,
        active: true,
        image_url: '/images/home-cleaning.jpg',
        provider_id: '1',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '2',
        title: 'Furniture Assembly',
        description: 'Expert assembly of all types of furniture.',
        category: 'home',
        price: 35,
        price_type: 'hourly',
        duration: 90,
        active: true,
        image_url: '/images/furniture-assembly.jpg',
        provider_id: '2',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '3',
        title: 'Lawn Mowing',
        description: 'Keep your lawn looking neat and tidy.',
        category: 'garden',
        price: 30,
        price_type: 'hourly',
        duration: 60,
        active: true,
        image_url: '/images/lawn-mowing.jpg',
        provider_id: '3',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
  }
</script>

<svelte:head>
  <title>Services - FAIT</title>
  <meta name="description" content="Browse and book services from skilled professionals in your community." />
</svelte:head>

<section class="bg-fait-light py-12">
  <div class="container-custom">
    <h1 class="text-4xl font-ivy font-bold text-fait-dark mb-6">Services</h1>
    <p class="text-lg mb-8">Find the perfect service provider for your needs.</p>

    <ServiceSearch
      initialQuery={searchQuery}
      initialLocation={searchLocation}
      on:search={handleSearch}
      class="mb-8"
    />

    <div class="flex flex-wrap gap-3 mb-8">
      {#each categories as category}
        <button
          class="px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 {selectedCategory === category.id ? 'bg-fait-blue text-white' : 'bg-white text-fait-dark hover:bg-gray-100'}"
          on:click={() => selectCategory(category.id)}
        >
          <span>{category.icon}</span> {category.name}
        </button>
      {/each}
    </div>

    {#if isLoading}
      <div class="flex justify-center items-center py-12">
        <div class="spinner"></div>
      </div>
    {:else if error}
      <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
        <p>{error}</p>
        <Button variant="secondary" size="sm" class="mt-2" on:click={() => { error = null; isLoading = true; services = getMockServices(); isLoading = false; }}>
          Load Sample Data
        </Button>
      </div>
    {:else if filteredServices.length === 0}
      <div class="text-center py-12">
        <h3 class="text-xl font-medium mb-2">No services found</h3>
        <p class="text-gray-600 mb-4">Try adjusting your search or category filters.</p>
        <Button variant="secondary" on:click={() => { searchQuery = ''; selectedCategory = ''; }}>
          Clear Filters
        </Button>
      </div>
    {:else}
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {#each filteredServices as service}
          <ServiceCard
            id={service.id}
            title={service.title}
            description={service.description}
            price={service.price.toString()}
            priceType={service.price_type}
            category={service.category}
            imageUrl={service.image_url || '/images/default-service.jpg'}
            animate={true}
            on:book={handleBook}
          />
        {/each}
      </div>
    {/if}
  </div>
</section>
