#!/usr/bin/env node

/**
 * Convert Components to Svelte
 * This script creates essential Svelte components for the FAIT platform
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔄 Converting components to Svelte...');

// Ensure components directory exists
const componentsDir = path.join(path.dirname(__dirname), 'src/lib/components');
if (!fs.existsSync(componentsDir)) {
  fs.mkdirSync(componentsDir, { recursive: true });
}

// Create essential Svelte components
const components = {
  'Header.svelte': `<script>
  import { supabase } from '$lib/supabase.js';
  
  export let user = null;
  
  async function handleLogout() {
    await supabase.auth.signOut();
  }
</script>

<header class="bg-blue-600 text-white shadow-lg">
  <div class="container mx-auto px-4 py-4 flex justify-between items-center">
    <div class="flex items-center space-x-2">
      <span class="text-2xl">🏠</span>
      <h1 class="text-2xl font-bold">FAIT</h1>
    </div>
    
    <nav class="flex items-center space-x-6">
      <a href="/services" class="hover:text-blue-200 transition-colors">Services</a>
      <a href="/about" class="hover:text-blue-200 transition-colors">About</a>
      
      {#if user}
        <span class="text-sm">Welcome, {user.email}</span>
        <button 
          on:click={handleLogout}
          class="bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded transition-colors"
        >
          Logout
        </button>
      {:else}
        <a href="/login" class="bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded transition-colors">
          Login
        </a>
      {/if}
    </nav>
  </div>
</header>`,

  'Footer.svelte': `<footer class="bg-gray-800 text-white py-8 mt-auto">
  <div class="container mx-auto px-4">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div>
        <h3 class="text-lg font-semibold mb-4">FAIT</h3>
        <p class="text-gray-300">Professional home services cooperative platform connecting homeowners with trusted service providers.</p>
      </div>
      
      <div>
        <h4 class="text-lg font-semibold mb-4">Services</h4>
        <ul class="space-y-2 text-gray-300">
          <li><a href="/services/handyman" class="hover:text-white">Handyman</a></li>
          <li><a href="/services/cleaning" class="hover:text-white">Cleaning</a></li>
          <li><a href="/services/electrical" class="hover:text-white">Electrical</a></li>
          <li><a href="/services/plumbing" class="hover:text-white">Plumbing</a></li>
        </ul>
      </div>
      
      <div>
        <h4 class="text-lg font-semibold mb-4">Contact</h4>
        <ul class="space-y-2 text-gray-300">
          <li>Email: info@itsfait.com</li>
          <li>Phone: (555) 123-4567</li>
          <li>Address: Denver, CO</li>
        </ul>
      </div>
    </div>
    
    <div class="border-t border-gray-700 mt-8 pt-8 text-center text-gray-300">
      <p>&copy; 2024 FAIT. All rights reserved.</p>
    </div>
  </div>
</footer>`,

  'ServiceCard.svelte': `<script>
  export let service;
  export let onClick = () => {};
</script>

<div 
  class="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer p-6"
  on:click={onClick}
  on:keydown={(e) => e.key === 'Enter' && onClick()}
  role="button"
  tabindex="0"
>
  <div class="text-4xl mb-4">{service.icon}</div>
  <h3 class="text-xl font-semibold mb-2">{service.title}</h3>
  <p class="text-gray-600 mb-4">{service.description}</p>
  <div class="flex justify-between items-center">
    <span class="text-blue-600 font-semibold">{service.price}</span>
    <span class="text-sm text-gray-500">{service.duration}</span>
  </div>
</div>`,

  'LoadingSpinner.svelte': `<script>
  export let size = 'medium';
  export let color = 'blue';
  
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12'
  };
  
  const colorClasses = {
    blue: 'text-blue-600',
    white: 'text-white',
    gray: 'text-gray-600'
  };
</script>

<div class="flex justify-center items-center">
  <div class="animate-spin rounded-full border-2 border-gray-300 border-t-current {sizeClasses[size]} {colorClasses[color]}"></div>
</div>`
};

// Create component files
Object.entries(components).forEach(([filename, content]) => {
  const filePath = path.join(componentsDir, filename);
  try {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Created ${filename}`);
  } catch (error) {
    console.error(`❌ Error creating ${filename}:`, error.message);
  }
});

console.log('🎯 Component conversion completed');
console.log('📝 Created essential Svelte components in src/lib/components/');
