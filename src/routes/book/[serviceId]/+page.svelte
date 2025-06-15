<script>
  import { page } from '$app/stores';
  import { supabase } from '$lib/supabase.js';
  import { goto } from '$app/navigation';
  import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';

  $: serviceId = $page.params.serviceId;

  let isLoading = false;
  let formData = {
    name: '',
    email: '',
    phone: '',
    address: '',
    date: '',
    time: '',
    description: ''
  };

  const services = {
    '1': { title: 'Handyman Services', price: '$75/hr' },
    '2': { title: 'Home Improvement', price: 'Custom Quote' },
    '3': { title: 'Electrical Services', price: '$95/hr' },
    '4': { title: 'Plumbing Services', price: '$85/hr' },
    '5': { title: 'Cleaning Services', price: '$25/hr' },
    '6': { title: 'Landscaping', price: '$45/hr' }
  };

  $: service = services[serviceId];

  async function handleSubmit() {
    isLoading = true;

    try {
      // Here you would typically save to Supabase
      console.log('Booking submitted:', { serviceId, ...formData });

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Redirect to confirmation
      goto('/booking/confirmation');
    } catch (error) {
      console.error('Booking error:', error);
    } finally {
      isLoading = false;
    }
  }
</script>

<svelte:head>
  <title>Book {service ? service.title : 'Service'} - FAIT</title>
</svelte:head>

<div class="container mx-auto px-4 py-8">
  <div class="max-w-2xl mx-auto">
    <h1 class="text-3xl font-bold text-gray-800 mb-2">Book Service</h1>
    {#if service}
      <p class="text-xl text-gray-600 mb-8">{service.title} - {service.price}</p>
    {/if}

    <form on:submit|preventDefault={handleSubmit} class="bg-white rounded-lg shadow-lg p-8">
      <div class="grid md:grid-cols-2 gap-6">
        <div>
          <label for="name" class="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
          <input
            type="text"
            id="name"
            bind:value={formData.name}
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label for="email" class="block text-sm font-medium text-gray-700 mb-2">Email</label>
          <input
            type="email"
            id="email"
            bind:value={formData.email}
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label for="phone" class="block text-sm font-medium text-gray-700 mb-2">Phone</label>
          <input
            type="tel"
            id="phone"
            bind:value={formData.phone}
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label for="date" class="block text-sm font-medium text-gray-700 mb-2">Preferred Date</label>
          <input
            type="date"
            id="date"
            bind:value={formData.date}
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div class="mt-6">
        <label for="address" class="block text-sm font-medium text-gray-700 mb-2">Service Address</label>
        <input
          type="text"
          id="address"
          bind:value={formData.address}
          required
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div class="mt-6">
        <label for="description" class="block text-sm font-medium text-gray-700 mb-2">Service Description</label>
        <textarea
          id="description"
          bind:value={formData.description}
          rows="4"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Please describe what you need help with..."
        ></textarea>
      </div>

      <div class="mt-8">
        <button
          type="submit"
          disabled={isLoading}
          class="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
        >
          {#if isLoading}
            <LoadingSpinner size="small" color="white" />
          {:else}
            Book Service
          {/if}
        </button>
      </div>
    </form>
  </div>
</div>