#!/usr/bin/env node

/**
 * Build Missing Pages for FAIT Platform
 * This script creates all missing pages to fix 404 errors
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔧 Building missing pages for FAIT platform...');

const routesDir = path.join(path.dirname(__dirname), 'src/routes');

// Individual service pages (services/[id] or services/[slug])
const servicePages = {
  'services/[id]/+page.svelte': `<script>
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
    goto(\`/book/\${serviceId}\`);
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
{/if}`,

  'services/[slug]/+page.svelte': `<script>
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  
  $: slug = $page.params.slug;
  
  // Service data based on slug
  const servicesBySlug = {
    'handyman': { id: 1, title: 'Handyman Services', icon: '🔧' },
    'home-improvement': { id: 2, title: 'Home Improvement', icon: '🏠' },
    'electrical': { id: 3, title: 'Electrical Services', icon: '🔌' },
    'plumbing': { id: 4, title: 'Plumbing Services', icon: '🚿' },
    'cleaning': { id: 5, title: 'Cleaning Services', icon: '🧹' },
    'landscaping': { id: 6, title: 'Landscaping', icon: '🌿' }
  };
  
  $: service = servicesBySlug[slug];
  
  // Redirect to the ID-based route
  $: if (service) {
    goto(\`/services/\${service.id}\`, { replaceState: true });
  }
</script>

<svelte:head>
  <title>{service ? service.title : 'Service'} - FAIT</title>
</svelte:head>

{#if !service}
  <div class="container mx-auto px-4 py-8 text-center">
    <h1 class="text-3xl font-bold text-gray-800 mb-4">Service Not Found</h1>
    <p class="text-gray-600 mb-6">The service you're looking for doesn't exist.</p>
    <a href="/services" class="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg">
      View All Services
    </a>
  </div>
{/if}`
};

// Create service pages
Object.entries(servicePages).forEach(([routePath, content]) => {
  const fullPath = path.join(routesDir, routePath);
  const dir = path.dirname(fullPath);
  
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  try {
    fs.writeFileSync(fullPath, content);
    console.log(`✅ Created service page ${routePath}`);
  } catch (error) {
    console.error(`❌ Error creating ${routePath}:`, error.message);
  }
});

// Booking pages
const bookingPages = {
  'book/[serviceId]/+page.svelte': `<script>
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
</div>`,

  'booking/confirmation/+page.svelte': `<svelte:head>
  <title>Booking Confirmed - FAIT</title>
</svelte:head>

<div class="container mx-auto px-4 py-8">
  <div class="max-w-2xl mx-auto text-center">
    <div class="bg-green-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
      <svg class="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
      </svg>
    </div>

    <h1 class="text-3xl font-bold text-gray-800 mb-4">Booking Confirmed!</h1>
    <p class="text-xl text-gray-600 mb-8">
      Thank you for choosing FAIT. We'll contact you shortly to confirm the details.
    </p>

    <div class="bg-white rounded-lg shadow-lg p-6 mb-8">
      <h2 class="text-xl font-semibold mb-4">What happens next?</h2>
      <div class="space-y-3 text-left">
        <div class="flex items-center">
          <span class="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold mr-3">1</span>
          <span>We'll review your booking request</span>
        </div>
        <div class="flex items-center">
          <span class="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold mr-3">2</span>
          <span>A service provider will contact you within 24 hours</span>
        </div>
        <div class="flex items-center">
          <span class="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold mr-3">3</span>
          <span>Schedule your service at a convenient time</span>
        </div>
      </div>
    </div>

    <div class="space-x-4">
      <a href="/" class="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg">
        Return Home
      </a>
      <a href="/services" class="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-6 rounded-lg">
        Browse Services
      </a>
    </div>
  </div>
</div>`
};

// Create booking pages
Object.entries(bookingPages).forEach(([routePath, content]) => {
  const fullPath = path.join(routesDir, routePath);
  const dir = path.dirname(fullPath);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  try {
    fs.writeFileSync(fullPath, content);
    console.log(`✅ Created booking page ${routePath}`);
  } catch (error) {
    console.error(`❌ Error creating ${routePath}:`, error.message);
  }
});

console.log('🎯 All missing pages created successfully');
console.log('📝 Service and booking pages now available');
