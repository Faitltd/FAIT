#!/usr/bin/env node

/**
 * Setup SvelteKit Routes
 * This script creates the essential route structure for the FAIT platform
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🛣️ Setting up SvelteKit routes...');

// Ensure routes directory exists
const routesDir = path.join(path.dirname(__dirname), 'src/routes');
if (!fs.existsSync(routesDir)) {
  fs.mkdirSync(routesDir, { recursive: true });
}

// Route configurations
const routes = {
  '+layout.svelte': `<script>
  import '../app.css';
  import Header from '$lib/components/Header.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import { supabase } from '$lib/supabase.js';
  import { onMount } from 'svelte';
  
  let user = null;
  
  onMount(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      user = session?.user ?? null;
    });
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      user = session?.user ?? null;
    });
    
    return () => subscription.unsubscribe();
  });
</script>

<div class="min-h-screen flex flex-col">
  <Header {user} />
  <main class="flex-1">
    <slot />
  </main>
  <Footer />
</div>`,

  'services/+page.svelte': `<script>
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
    goto(\`/services/\${service.id}\`);
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
</div>`,

  'about/+page.svelte': `<svelte:head>
  <title>About - FAIT</title>
</svelte:head>

<div class="container mx-auto px-4 py-8">
  <div class="max-w-4xl mx-auto">
    <div class="text-center mb-12">
      <h1 class="text-4xl font-bold text-gray-800 mb-4">About FAIT</h1>
      <p class="text-xl text-gray-600">
        Building a cooperative platform for professional home services
      </p>
    </div>
    
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
      <div>
        <h2 class="text-2xl font-semibold mb-4">Our Mission</h2>
        <p class="text-gray-600 mb-6">
          FAIT is dedicated to connecting homeowners with trusted, professional service providers 
          through our cooperative platform. We believe in fair pricing, quality work, and 
          building lasting relationships within our communities.
        </p>
        
        <h2 class="text-2xl font-semibold mb-4">Why Choose FAIT?</h2>
        <ul class="space-y-2 text-gray-600">
          <li>✓ Vetted and insured service providers</li>
          <li>✓ Transparent, competitive pricing</li>
          <li>✓ Quality guarantee on all work</li>
          <li>✓ Local community focus</li>
          <li>✓ Cooperative ownership model</li>
        </ul>
      </div>
      
      <div>
        <h2 class="text-2xl font-semibold mb-4">Our Founders</h2>
        <div class="space-y-6">
          <div class="flex items-center space-x-4">
            <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <span class="text-2xl">👨‍💼</span>
            </div>
            <div>
              <h3 class="font-semibold">Ray Kinne</h3>
              <p class="text-gray-600">Co-Founder & CEO</p>
            </div>
          </div>
          
          <div class="flex items-center space-x-4">
            <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <span class="text-2xl">👩‍💼</span>
            </div>
            <div>
              <h3 class="font-semibold">Kelli Trainer</h3>
              <p class="text-gray-600">Co-Founder & COO</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>`,

  'login/+page.svelte': `<script>
  import { supabase } from '$lib/supabase.js';
  import { goto } from '$app/navigation';
  import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
  
  let email = '';
  let password = '';
  let isLoading = false;
  let error = '';
  
  async function handleLogin() {
    if (!email || !password) {
      error = 'Please enter email and password';
      return;
    }
    
    isLoading = true;
    error = '';
    
    try {
      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (loginError) {
        error = loginError.message;
      } else {
        goto('/');
      }
    } catch (err) {
      error = 'An unexpected error occurred';
    } finally {
      isLoading = false;
    }
  }
</script>

<svelte:head>
  <title>Login - FAIT</title>
</svelte:head>

<div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
  <div class="max-w-md w-full space-y-8">
    <div>
      <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
        Sign in to FAIT
      </h2>
    </div>
    
    <form class="mt-8 space-y-6" on:submit|preventDefault={handleLogin}>
      <div class="rounded-md shadow-sm -space-y-px">
        <div>
          <label for="email" class="sr-only">Email address</label>
          <input
            id="email"
            name="email"
            type="email"
            bind:value={email}
            required
            class="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Email address"
          />
        </div>
        <div>
          <label for="password" class="sr-only">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            bind:value={password}
            required
            class="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Password"
          />
        </div>
      </div>
      
      {#if error}
        <div class="text-red-600 text-sm text-center">{error}</div>
      {/if}
      
      <div>
        <button
          type="submit"
          disabled={isLoading}
          class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {#if isLoading}
            <LoadingSpinner size="small" color="white" />
          {:else}
            Sign in
          {/if}
        </button>
      </div>
      
      <div class="text-center text-sm text-gray-600">
        Demo: admin@fait.com / admin123
      </div>
    </form>
  </div>
</div>`
};

// Create route files
Object.entries(routes).forEach(([routePath, content]) => {
  const fullPath = path.join(routesDir, routePath);
  const dir = path.dirname(fullPath);
  
  // Ensure directory exists
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  try {
    fs.writeFileSync(fullPath, content);
    console.log(`✅ Created route ${routePath}`);
  } catch (error) {
    console.error(`❌ Error creating route ${routePath}:`, error.message);
  }
});

console.log('🎯 SvelteKit routes setup completed');
console.log('📝 Created essential routes for FAIT platform');
