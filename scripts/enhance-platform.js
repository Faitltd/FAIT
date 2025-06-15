#!/usr/bin/env node

/**
 * Enhance FAIT Platform
 * This script adds advanced features and improvements to the platform
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Enhancing FAIT platform with advanced features...');

const routesDir = path.join(path.dirname(__dirname), 'src/routes');
const libDir = path.join(path.dirname(__dirname), 'src/lib');

// Enhanced search functionality
const searchPage = {
  'search/+page.svelte': `<script>
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
    
    goto(\`/search?\${params.toString()}\`);
    performSearch();
  }
  
  function handleServiceClick(service) {
    goto(\`/services/\${service.id}\`);
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
</div>`
};

// Enhanced dashboard for users
const dashboardPage = {
  'dashboard/+page.svelte': `<script>
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
</div>`
};

// Create enhanced pages
const enhancedPages = { ...searchPage, ...dashboardPage };

Object.entries(enhancedPages).forEach(([routePath, content]) => {
  const fullPath = path.join(routesDir, routePath);
  const dir = path.dirname(fullPath);
  
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  try {
    fs.writeFileSync(fullPath, content);
    console.log(`✅ Created enhanced page ${routePath}`);
  } catch (error) {
    console.error(`❌ Error creating ${routePath}:`, error.message);
  }
});

console.log('🎯 Platform enhancement completed');
console.log('📝 Added search functionality and user dashboard');
