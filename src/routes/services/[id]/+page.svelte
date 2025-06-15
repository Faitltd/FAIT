<script>
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import ServiceCard from '$lib/components/ServiceCard.svelte';
  import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
  
  $: serviceId = $page.params.id;
  
  // Service data based on ID
  const services = {
    '1': {
      id: 1,
      icon: '🔧',
      title: 'Handyman Services',
      description: 'General repairs, installations, and maintenance for your home',
      price: 'Starting at $75/hr',
      duration: '1-4 hours',
      details: 'Our skilled handymen can handle a wide variety of home repair and maintenance tasks.',
      features: ['General repairs', 'Furniture assembly', 'Picture hanging', 'Minor electrical work', 'Plumbing fixes']
    },
    '2': {
      id: 2,
      icon: '🏠',
      title: 'Home Improvement',
      description: 'Remodeling, renovations, and upgrades for your home',
      price: 'Custom Quote',
      duration: '1-30 days',
      details: 'Transform your home with our comprehensive improvement services.',
      features: ['Kitchen remodeling', 'Bathroom renovation', 'Flooring installation', 'Painting', 'Custom carpentry']
    },
    '3': {
      id: 3,
      icon: '🔌',
      title: 'Electrical Services',
      description: 'Licensed electrical work and installations',
      price: 'Starting at $95/hr',
      duration: '1-8 hours',
      details: 'Professional electrical services by licensed electricians.',
      features: ['Outlet installation', 'Light fixture installation', 'Electrical panel upgrades', 'Wiring repairs', 'Safety inspections']
    },
    '4': {
      id: 4,
      icon: '🚿',
      title: 'Plumbing Services',
      description: 'Professional plumbing repairs and installations',
      price: 'Starting at $85/hr',
      duration: '1-6 hours',
      details: 'Expert plumbing services for all your water and drainage needs.',
      features: ['Leak repairs', 'Drain cleaning', 'Fixture installation', 'Water heater service', 'Emergency repairs']
    },
    '5': {
      id: 5,
      icon: '🧹',
      title: 'Cleaning Services',
      description: 'House cleaning, deep cleaning, maintenance',
      price: 'Starting at $25/hr',
      duration: '2-6 hours',
      details: 'Professional cleaning services to keep your home spotless.',
      features: ['Regular house cleaning', 'Deep cleaning', 'Move-in/out cleaning', 'Post-construction cleanup', 'Window cleaning']
    },
    '6': {
      id: 6,
      icon: '🌿',
      title: 'Landscaping',
      description: 'Lawn care, gardening, and outdoor maintenance',
      price: 'Starting at $45/hr',
      duration: '2-8 hours',
      details: 'Beautiful landscaping and outdoor maintenance services.',
      features: ['Lawn mowing', 'Garden design', 'Tree trimming', 'Irrigation systems', 'Seasonal cleanup']
    }
  };
  
  $: service = services[serviceId];
  
  function handleBookService() {
    goto(`/book/${serviceId}`);
  }
</script>

<svelte:head>
  <title>{service ? service.title : 'Service'} - FAIT</title>
</svelte:head>

{#if service}
  <div class="container mx-auto px-4 py-8">
    <div class="max-w-4xl mx-auto">
      <!-- Service Header -->
      <div class="bg-white rounded-lg shadow-lg p-8 mb-8">
        <div class="flex items-center mb-6">
          <div class="text-6xl mr-6">{service.icon}</div>
          <div>
            <h1 class="text-4xl font-bold text-gray-800 mb-2">{service.title}</h1>
            <p class="text-xl text-gray-600">{service.description}</p>
          </div>
        </div>
        
        <div class="grid md:grid-cols-2 gap-8">
          <div>
            <h2 class="text-2xl font-semibold mb-4">Service Details</h2>
            <p class="text-gray-600 mb-6">{service.details}</p>
            
            <h3 class="text-xl font-semibold mb-3">What's Included:</h3>
            <ul class="space-y-2">
              {#each service.features as feature}
                <li class="flex items-center">
                  <span class="text-green-500 mr-2">✓</span>
                  {feature}
                </li>
              {/each}
            </ul>
          </div>
          
          <div class="bg-gray-50 rounded-lg p-6">
            <h3 class="text-xl font-semibold mb-4">Pricing & Duration</h3>
            <div class="space-y-3">
              <div class="flex justify-between">
                <span class="text-gray-600">Starting Price:</span>
                <span class="font-semibold text-blue-600">{service.price}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Duration:</span>
                <span class="font-semibold">{service.duration}</span>
              </div>
            </div>
            
            <button 
              on:click={handleBookService}
              class="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Book This Service
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
{:else}
  <div class="container mx-auto px-4 py-8 text-center">
    <h1 class="text-3xl font-bold text-gray-800 mb-4">Service Not Found</h1>
    <p class="text-gray-600 mb-6">The service you're looking for doesn't exist.</p>
    <a href="/services" class="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg">
      View All Services
    </a>
  </div>
{/if}