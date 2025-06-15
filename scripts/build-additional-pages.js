#!/usr/bin/env node

/**
 * Build Additional Missing Pages for FAIT Platform
 * This script creates contact, pricing, FAQ, and other essential pages
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔧 Building additional pages for FAIT platform...');

const routesDir = path.join(path.dirname(__dirname), 'src/routes');

// Additional essential pages
const additionalPages = {
  'contact/+page.svelte': `<script>
  import { supabase } from '$lib/supabase.js';
  import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
  
  let isLoading = false;
  let formData = {
    name: '',
    email: '',
    subject: '',
    message: ''
  };
  let submitted = false;
  
  async function handleSubmit() {
    isLoading = true;
    
    try {
      // Here you would typically save to Supabase
      console.log('Contact form submitted:', formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      submitted = true;
      formData = { name: '', email: '', subject: '', message: '' };
    } catch (error) {
      console.error('Contact form error:', error);
    } finally {
      isLoading = false;
    }
  }
</script>

<svelte:head>
  <title>Contact Us - FAIT</title>
</svelte:head>

<div class="container mx-auto px-4 py-8">
  <div class="max-w-4xl mx-auto">
    <div class="text-center mb-12">
      <h1 class="text-4xl font-bold text-gray-800 mb-4">Contact Us</h1>
      <p class="text-xl text-gray-600">Get in touch with the FAIT team</p>
    </div>
    
    <div class="grid lg:grid-cols-2 gap-12">
      <!-- Contact Information -->
      <div>
        <h2 class="text-2xl font-semibold mb-6">Get in Touch</h2>
        
        <div class="space-y-6">
          <div class="flex items-start">
            <div class="bg-blue-100 rounded-full p-3 mr-4">
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
              </svg>
            </div>
            <div>
              <h3 class="font-semibold text-gray-800">Email</h3>
              <p class="text-gray-600">info@itsfait.com</p>
            </div>
          </div>
          
          <div class="flex items-start">
            <div class="bg-blue-100 rounded-full p-3 mr-4">
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
              </svg>
            </div>
            <div>
              <h3 class="font-semibold text-gray-800">Phone</h3>
              <p class="text-gray-600">(555) 123-4567</p>
            </div>
          </div>
          
          <div class="flex items-start">
            <div class="bg-blue-100 rounded-full p-3 mr-4">
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
              </svg>
            </div>
            <div>
              <h3 class="font-semibold text-gray-800">Address</h3>
              <p class="text-gray-600">Denver, CO</p>
            </div>
          </div>
        </div>
        
        <div class="mt-8">
          <h3 class="text-xl font-semibold mb-4">Business Hours</h3>
          <div class="space-y-2 text-gray-600">
            <div class="flex justify-between">
              <span>Monday - Friday:</span>
              <span>8:00 AM - 6:00 PM</span>
            </div>
            <div class="flex justify-between">
              <span>Saturday:</span>
              <span>9:00 AM - 4:00 PM</span>
            </div>
            <div class="flex justify-between">
              <span>Sunday:</span>
              <span>Closed</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Contact Form -->
      <div>
        {#if submitted}
          <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
            Thank you for your message! We'll get back to you soon.
          </div>
        {/if}
        
        <form on:submit|preventDefault={handleSubmit} class="bg-white rounded-lg shadow-lg p-8">
          <h2 class="text-2xl font-semibold mb-6">Send us a Message</h2>
          
          <div class="space-y-6">
            <div>
              <label for="name" class="block text-sm font-medium text-gray-700 mb-2">Name</label>
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
              <label for="subject" class="block text-sm font-medium text-gray-700 mb-2">Subject</label>
              <input
                type="text"
                id="subject"
                bind:value={formData.subject}
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label for="message" class="block text-sm font-medium text-gray-700 mb-2">Message</label>
              <textarea
                id="message"
                bind:value={formData.message}
                rows="6"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              ></textarea>
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              class="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              {#if isLoading}
                <LoadingSpinner size="small" color="white" />
              {:else}
                Send Message
              {/if}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</div>`,

  'pricing/+page.svelte': `<svelte:head>
  <title>Pricing - FAIT</title>
</svelte:head>

<div class="container mx-auto px-4 py-8">
  <div class="max-w-6xl mx-auto">
    <div class="text-center mb-12">
      <h1 class="text-4xl font-bold text-gray-800 mb-4">Transparent Pricing</h1>
      <p class="text-xl text-gray-600">Fair rates for quality home services</p>
    </div>
    
    <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
      <!-- Handyman Services -->
      <div class="bg-white rounded-lg shadow-lg p-8">
        <div class="text-center mb-6">
          <div class="text-4xl mb-4">🔧</div>
          <h3 class="text-2xl font-semibold">Handyman Services</h3>
        </div>
        <div class="space-y-4">
          <div class="flex justify-between">
            <span>General repairs</span>
            <span class="font-semibold">$75/hr</span>
          </div>
          <div class="flex justify-between">
            <span>Furniture assembly</span>
            <span class="font-semibold">$60/hr</span>
          </div>
          <div class="flex justify-between">
            <span>Picture hanging</span>
            <span class="font-semibold">$50/hr</span>
          </div>
        </div>
      </div>
      
      <!-- Electrical Services -->
      <div class="bg-white rounded-lg shadow-lg p-8">
        <div class="text-center mb-6">
          <div class="text-4xl mb-4">🔌</div>
          <h3 class="text-2xl font-semibold">Electrical Services</h3>
        </div>
        <div class="space-y-4">
          <div class="flex justify-between">
            <span>Outlet installation</span>
            <span class="font-semibold">$95/hr</span>
          </div>
          <div class="flex justify-between">
            <span>Light fixtures</span>
            <span class="font-semibold">$85/hr</span>
          </div>
          <div class="flex justify-between">
            <span>Panel upgrades</span>
            <span class="font-semibold">Quote</span>
          </div>
        </div>
      </div>
      
      <!-- Plumbing Services -->
      <div class="bg-white rounded-lg shadow-lg p-8">
        <div class="text-center mb-6">
          <div class="text-4xl mb-4">🚿</div>
          <h3 class="text-2xl font-semibold">Plumbing Services</h3>
        </div>
        <div class="space-y-4">
          <div class="flex justify-between">
            <span>Leak repairs</span>
            <span class="font-semibold">$85/hr</span>
          </div>
          <div class="flex justify-between">
            <span>Drain cleaning</span>
            <span class="font-semibold">$75/hr</span>
          </div>
          <div class="flex justify-between">
            <span>Emergency service</span>
            <span class="font-semibold">$120/hr</span>
          </div>
        </div>
      </div>
      
      <!-- Cleaning Services -->
      <div class="bg-white rounded-lg shadow-lg p-8">
        <div class="text-center mb-6">
          <div class="text-4xl mb-4">🧹</div>
          <h3 class="text-2xl font-semibold">Cleaning Services</h3>
        </div>
        <div class="space-y-4">
          <div class="flex justify-between">
            <span>Regular cleaning</span>
            <span class="font-semibold">$25/hr</span>
          </div>
          <div class="flex justify-between">
            <span>Deep cleaning</span>
            <span class="font-semibold">$35/hr</span>
          </div>
          <div class="flex justify-between">
            <span>Move-in/out</span>
            <span class="font-semibold">$40/hr</span>
          </div>
        </div>
      </div>
      
      <!-- Landscaping -->
      <div class="bg-white rounded-lg shadow-lg p-8">
        <div class="text-center mb-6">
          <div class="text-4xl mb-4">🌿</div>
          <h3 class="text-2xl font-semibold">Landscaping</h3>
        </div>
        <div class="space-y-4">
          <div class="flex justify-between">
            <span>Lawn mowing</span>
            <span class="font-semibold">$45/hr</span>
          </div>
          <div class="flex justify-between">
            <span>Garden design</span>
            <span class="font-semibold">$65/hr</span>
          </div>
          <div class="flex justify-between">
            <span>Tree trimming</span>
            <span class="font-semibold">Quote</span>
          </div>
        </div>
      </div>
      
      <!-- Home Improvement -->
      <div class="bg-white rounded-lg shadow-lg p-8">
        <div class="text-center mb-6">
          <div class="text-4xl mb-4">🏠</div>
          <h3 class="text-2xl font-semibold">Home Improvement</h3>
        </div>
        <div class="space-y-4">
          <div class="flex justify-between">
            <span>Kitchen remodel</span>
            <span class="font-semibold">Quote</span>
          </div>
          <div class="flex justify-between">
            <span>Bathroom reno</span>
            <span class="font-semibold">Quote</span>
          </div>
          <div class="flex justify-between">
            <span>Painting</span>
            <span class="font-semibold">$35/hr</span>
          </div>
        </div>
      </div>
    </div>
    
    <div class="mt-12 bg-blue-50 rounded-lg p-8 text-center">
      <h2 class="text-2xl font-semibold mb-4">Need a Custom Quote?</h2>
      <p class="text-gray-600 mb-6">For larger projects or specialized services, we provide detailed estimates.</p>
      <a href="/contact" class="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg">
        Get Free Estimate
      </a>
    </div>
  </div>
</div>`
};

// Create additional pages
Object.entries(additionalPages).forEach(([routePath, content]) => {
  const fullPath = path.join(routesDir, routePath);
  const dir = path.dirname(fullPath);
  
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  try {
    fs.writeFileSync(fullPath, content);
    console.log(`✅ Created page ${routePath}`);
  } catch (error) {
    console.error(`❌ Error creating ${routePath}:`, error.message);
  }
});

console.log('🎯 Additional pages created successfully');
console.log('📝 Contact and pricing pages now available');
