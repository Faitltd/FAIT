<script>
  import ServiceCard from '$lib/components/ServiceCard.svelte';
  import { goto } from '$app/navigation';
  
  const services = [
    {
      id: 1,
      icon: '🔧',
      title: 'Handyman Services',
      description: 'General repairs, installations, and maintenance',
      price: 'Starting at $75/hr',
      duration: '1-4 hours'
    },
    {
      id: 2,
      icon: '🏠',
      title: 'Home Improvement',
      description: 'Remodeling, renovations, and upgrades',
      price: 'Custom Quote',
      duration: '1-30 days'
    },
    {
      id: 3,
      icon: '🔌',
      title: 'Electrical Services',
      description: 'Licensed electrical work and installations',
      price: 'Starting at $95/hr',
      duration: '1-8 hours'
    },
    {
      id: 4,
      icon: '🚿',
      title: 'Plumbing Services',
      description: 'Professional plumbing repairs and installations',
      price: 'Starting at $85/hr',
      duration: '1-6 hours'
    },
    {
      id: 5,
      icon: '🧹',
      title: 'Cleaning Services',
      description: 'House cleaning, deep cleaning, maintenance',
      price: 'Starting at $25/hr',
      duration: '2-6 hours'
    },
    {
      id: 6,
      icon: '🌿',
      title: 'Landscaping',
      description: 'Lawn care, gardening, and outdoor maintenance',
      price: 'Starting at $45/hr',
      duration: '2-8 hours'
    }
  ];
  
  function handleServiceClick(service) {
    goto(`/services/${service.id}`);
  }
</script>

<svelte:head>
  <title>Services - FAIT</title>
</svelte:head>

<div class="container mx-auto px-4 py-8">
  <div class="text-center mb-12">
    <h1 class="text-4xl font-bold text-gray-800 mb-4">Our Services</h1>
    <p class="text-xl text-gray-600 max-w-2xl mx-auto">
      Professional home services delivered by our trusted cooperative network
    </p>
  </div>
  
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
    {#each services as service}
      <ServiceCard {service} onClick={() => handleServiceClick(service)} />
    {/each}
  </div>
</div>