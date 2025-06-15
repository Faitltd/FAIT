#!/usr/bin/env node

/**
 * Build Final Missing Pages for FAIT Platform
 * This script creates FAQ, provider signup, and other remaining pages
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔧 Building final pages for FAIT platform...');

const routesDir = path.join(path.dirname(__dirname), 'src/routes');

// Final essential pages
const finalPages = {
  'faq/+page.svelte': `<svelte:head>
  <title>FAQ - FAIT</title>
</svelte:head>

<div class="container mx-auto px-4 py-8">
  <div class="max-w-4xl mx-auto">
    <div class="text-center mb-12">
      <h1 class="text-4xl font-bold text-gray-800 mb-4">Frequently Asked Questions</h1>
      <p class="text-xl text-gray-600">Find answers to common questions about FAIT</p>
    </div>
    
    <div class="space-y-8">
      <!-- General Questions -->
      <div class="bg-white rounded-lg shadow-lg p-8">
        <h2 class="text-2xl font-semibold mb-6">General Questions</h2>
        
        <div class="space-y-6">
          <div>
            <h3 class="text-lg font-semibold text-gray-800 mb-2">What is FAIT?</h3>
            <p class="text-gray-600">FAIT is a home services cooperative platform that connects homeowners with trusted, professional service providers. We focus on fair pricing, quality work, and building lasting relationships within our communities.</p>
          </div>
          
          <div>
            <h3 class="text-lg font-semibold text-gray-800 mb-2">How does FAIT work?</h3>
            <p class="text-gray-600">Simply browse our services, select what you need, and book online. We'll match you with a qualified service provider who will contact you to schedule the work at your convenience.</p>
          </div>
          
          <div>
            <h3 class="text-lg font-semibold text-gray-800 mb-2">Are service providers vetted?</h3>
            <p class="text-gray-600">Yes, all our service providers are thoroughly vetted, licensed where required, and insured. We verify their credentials, experience, and customer reviews before they join our platform.</p>
          </div>
        </div>
      </div>
      
      <!-- Booking Questions -->
      <div class="bg-white rounded-lg shadow-lg p-8">
        <h2 class="text-2xl font-semibold mb-6">Booking & Scheduling</h2>
        
        <div class="space-y-6">
          <div>
            <h3 class="text-lg font-semibold text-gray-800 mb-2">How do I book a service?</h3>
            <p class="text-gray-600">You can book a service by browsing our services page, selecting the service you need, and filling out the booking form. A service provider will contact you within 24 hours to confirm details.</p>
          </div>
          
          <div>
            <h3 class="text-lg font-semibold text-gray-800 mb-2">Can I schedule same-day service?</h3>
            <p class="text-gray-600">While we try to accommodate urgent requests, we recommend booking at least 24-48 hours in advance to ensure availability. Emergency services may be available for an additional fee.</p>
          </div>
          
          <div>
            <h3 class="text-lg font-semibold text-gray-800 mb-2">What if I need to reschedule?</h3>
            <p class="text-gray-600">You can reschedule your appointment by contacting your assigned service provider directly or through our customer support. We ask for at least 24 hours notice when possible.</p>
          </div>
        </div>
      </div>
      
      <!-- Pricing Questions -->
      <div class="bg-white rounded-lg shadow-lg p-8">
        <h2 class="text-2xl font-semibold mb-6">Pricing & Payment</h2>
        
        <div class="space-y-6">
          <div>
            <h3 class="text-lg font-semibold text-gray-800 mb-2">How is pricing determined?</h3>
            <p class="text-gray-600">Our pricing is transparent and competitive. Most services are priced hourly, while larger projects receive custom quotes. All prices are discussed and agreed upon before work begins.</p>
          </div>
          
          <div>
            <h3 class="text-lg font-semibold text-gray-800 mb-2">What payment methods do you accept?</h3>
            <p class="text-gray-600">We accept all major credit cards, debit cards, and bank transfers. Payment is typically due upon completion of the service, unless other arrangements are made for larger projects.</p>
          </div>
          
          <div>
            <h3 class="text-lg font-semibold text-gray-800 mb-2">Are there any hidden fees?</h3>
            <p class="text-gray-600">No, we believe in transparent pricing. All costs will be discussed upfront, including any potential additional charges for materials or extended work time.</p>
          </div>
        </div>
      </div>
      
      <!-- Quality & Support -->
      <div class="bg-white rounded-lg shadow-lg p-8">
        <h2 class="text-2xl font-semibold mb-6">Quality & Support</h2>
        
        <div class="space-y-6">
          <div>
            <h3 class="text-lg font-semibold text-gray-800 mb-2">What if I'm not satisfied with the work?</h3>
            <p class="text-gray-600">We guarantee quality work. If you're not satisfied, contact us within 48 hours and we'll work with the service provider to resolve any issues or arrange for corrections at no additional cost.</p>
          </div>
          
          <div>
            <h3 class="text-lg font-semibold text-gray-800 mb-2">Is the work insured?</h3>
            <p class="text-gray-600">Yes, all our service providers carry liability insurance. Additionally, FAIT provides additional coverage for peace of mind on all services booked through our platform.</p>
          </div>
          
          <div>
            <h3 class="text-lg font-semibold text-gray-800 mb-2">How can I contact customer support?</h3>
            <p class="text-gray-600">You can reach our customer support team via email at info@itsfait.com, phone at (555) 123-4567, or through our contact form. We're available Monday-Friday 8AM-6PM, Saturday 9AM-4PM.</p>
          </div>
        </div>
      </div>
    </div>
    
    <div class="mt-12 text-center">
      <h2 class="text-2xl font-semibold mb-4">Still have questions?</h2>
      <p class="text-gray-600 mb-6">We're here to help! Contact our support team for personalized assistance.</p>
      <a href="/contact" class="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg">
        Contact Support
      </a>
    </div>
  </div>
</div>`,

  'provider/+page.svelte': `<script>
  import { goto } from '$app/navigation';
  
  function handleSignUp() {
    goto('/provider/signup');
  }
</script>

<svelte:head>
  <title>Become a Provider - FAIT</title>
</svelte:head>

<div class="container mx-auto px-4 py-8">
  <div class="max-w-6xl mx-auto">
    <!-- Hero Section -->
    <div class="text-center mb-16">
      <h1 class="text-5xl font-bold text-gray-800 mb-6">Join the FAIT Cooperative</h1>
      <p class="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
        Become part of a professional network that values quality work, fair compensation, and community building. 
        Grow your business with FAIT's cooperative model.
      </p>
      <button 
        on:click={handleSignUp}
        class="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-8 rounded-lg text-lg"
      >
        Apply to Join
      </button>
    </div>
    
    <!-- Benefits Section -->
    <div class="grid lg:grid-cols-2 gap-12 mb-16">
      <div>
        <h2 class="text-3xl font-semibold mb-8">Why Join FAIT?</h2>
        <div class="space-y-6">
          <div class="flex items-start">
            <div class="bg-green-100 rounded-full p-2 mr-4 mt-1">
              <svg class="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
              </svg>
            </div>
            <div>
              <h3 class="text-xl font-semibold mb-2">Fair Compensation</h3>
              <p class="text-gray-600">Competitive rates with transparent pricing. Keep more of what you earn with our low platform fees.</p>
            </div>
          </div>
          
          <div class="flex items-start">
            <div class="bg-green-100 rounded-full p-2 mr-4 mt-1">
              <svg class="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
              </svg>
            </div>
            <div>
              <h3 class="text-xl font-semibold mb-2">Steady Work Flow</h3>
              <p class="text-gray-600">Access to a consistent stream of quality customers who value professional service.</p>
            </div>
          </div>
          
          <div class="flex items-start">
            <div class="bg-green-100 rounded-full p-2 mr-4 mt-1">
              <svg class="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
              </svg>
            </div>
            <div>
              <h3 class="text-xl font-semibold mb-2">Professional Support</h3>
              <p class="text-gray-600">Marketing, customer service, and business development support to help you grow.</p>
            </div>
          </div>
          
          <div class="flex items-start">
            <div class="bg-green-100 rounded-full p-2 mr-4 mt-1">
              <svg class="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
              </svg>
            </div>
            <div>
              <h3 class="text-xl font-semibold mb-2">Cooperative Ownership</h3>
              <p class="text-gray-600">As a member of our cooperative, you have a voice in how the platform operates and grows.</p>
            </div>
          </div>
        </div>
      </div>
      
      <div class="bg-gray-50 rounded-lg p-8">
        <h3 class="text-2xl font-semibold mb-6">Service Categories</h3>
        <div class="grid grid-cols-2 gap-4">
          <div class="text-center p-4 bg-white rounded-lg">
            <div class="text-3xl mb-2">🔧</div>
            <span class="text-sm font-medium">Handyman</span>
          </div>
          <div class="text-center p-4 bg-white rounded-lg">
            <div class="text-3xl mb-2">🔌</div>
            <span class="text-sm font-medium">Electrical</span>
          </div>
          <div class="text-center p-4 bg-white rounded-lg">
            <div class="text-3xl mb-2">🚿</div>
            <span class="text-sm font-medium">Plumbing</span>
          </div>
          <div class="text-center p-4 bg-white rounded-lg">
            <div class="text-3xl mb-2">🧹</div>
            <span class="text-sm font-medium">Cleaning</span>
          </div>
          <div class="text-center p-4 bg-white rounded-lg">
            <div class="text-3xl mb-2">🌿</div>
            <span class="text-sm font-medium">Landscaping</span>
          </div>
          <div class="text-center p-4 bg-white rounded-lg">
            <div class="text-3xl mb-2">🏠</div>
            <span class="text-sm font-medium">Remodeling</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Requirements Section -->
    <div class="bg-white rounded-lg shadow-lg p-8 mb-12">
      <h2 class="text-3xl font-semibold mb-8 text-center">Requirements</h2>
      <div class="grid md:grid-cols-3 gap-8">
        <div class="text-center">
          <div class="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <h3 class="text-xl font-semibold mb-2">Licensed & Insured</h3>
          <p class="text-gray-600">Valid business license and liability insurance required for all service providers.</p>
        </div>
        
        <div class="text-center">
          <div class="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
            </svg>
          </div>
          <h3 class="text-xl font-semibold mb-2">Experienced</h3>
          <p class="text-gray-600">Minimum 2 years of professional experience in your service category.</p>
        </div>
        
        <div class="text-center">
          <div class="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
            </svg>
          </div>
          <h3 class="text-xl font-semibold mb-2">Customer Focused</h3>
          <p class="text-gray-600">Commitment to quality work and excellent customer service.</p>
        </div>
      </div>
    </div>
    
    <!-- CTA Section -->
    <div class="text-center">
      <h2 class="text-3xl font-semibold mb-4">Ready to Join?</h2>
      <p class="text-xl text-gray-600 mb-8">Start your application today and become part of the FAIT cooperative.</p>
      <button 
        on:click={handleSignUp}
        class="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-8 rounded-lg text-lg"
      >
        Apply Now
      </button>
    </div>
  </div>
</div>`,

  'provider/signup/+page.svelte': `<script>
  import { supabase } from '$lib/supabase.js';
  import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
  
  let isLoading = false;
  let submitted = false;
  let formData = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    businessName: '',
    serviceCategory: '',
    experience: '',
    licenseNumber: '',
    insuranceProvider: '',
    description: ''
  };
  
  const serviceCategories = [
    'Handyman Services',
    'Electrical Services',
    'Plumbing Services',
    'Cleaning Services',
    'Landscaping',
    'Home Improvement'
  ];
  
  async function handleSubmit() {
    isLoading = true;
    
    try {
      // Here you would typically save to Supabase
      console.log('Provider application submitted:', formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      submitted = true;
    } catch (error) {
      console.error('Application error:', error);
    } finally {
      isLoading = false;
    }
  }
</script>

<svelte:head>
  <title>Provider Application - FAIT</title>
</svelte:head>

<div class="container mx-auto px-4 py-8">
  <div class="max-w-3xl mx-auto">
    {#if submitted}
      <div class="text-center">
        <div class="bg-green-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
          <svg class="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        
        <h1 class="text-3xl font-bold text-gray-800 mb-4">Application Submitted!</h1>
        <p class="text-xl text-gray-600 mb-8">
          Thank you for your interest in joining FAIT. We'll review your application and contact you within 3-5 business days.
        </p>
        
        <a href="/" class="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg">
          Return Home
        </a>
      </div>
    {:else}
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold text-gray-800 mb-4">Provider Application</h1>
        <p class="text-xl text-gray-600">Join the FAIT cooperative and grow your business</p>
      </div>
      
      <form on:submit|preventDefault={handleSubmit} class="bg-white rounded-lg shadow-lg p-8">
        <div class="grid md:grid-cols-2 gap-6">
          <!-- Personal Information -->
          <div>
            <label for="firstName" class="block text-sm font-medium text-gray-700 mb-2">First Name</label>
            <input
              type="text"
              id="firstName"
              bind:value={formData.firstName}
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label for="lastName" class="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
            <input
              type="text"
              id="lastName"
              bind:value={formData.lastName}
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
          
          <!-- Business Information -->
          <div>
            <label for="businessName" class="block text-sm font-medium text-gray-700 mb-2">Business Name</label>
            <input
              type="text"
              id="businessName"
              bind:value={formData.businessName}
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label for="serviceCategory" class="block text-sm font-medium text-gray-700 mb-2">Service Category</label>
            <select
              id="serviceCategory"
              bind:value={formData.serviceCategory}
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a category</option>
              {#each serviceCategories as category}
                <option value={category}>{category}</option>
              {/each}
            </select>
          </div>
          
          <div>
            <label for="experience" class="block text-sm font-medium text-gray-700 mb-2">Years of Experience</label>
            <input
              type="number"
              id="experience"
              bind:value={formData.experience}
              min="1"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label for="licenseNumber" class="block text-sm font-medium text-gray-700 mb-2">License Number</label>
            <input
              type="text"
              id="licenseNumber"
              bind:value={formData.licenseNumber}
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        
        <div class="mt-6">
          <label for="insuranceProvider" class="block text-sm font-medium text-gray-700 mb-2">Insurance Provider</label>
          <input
            type="text"
            id="insuranceProvider"
            bind:value={formData.insuranceProvider}
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div class="mt-6">
          <label for="description" class="block text-sm font-medium text-gray-700 mb-2">Tell us about your business</label>
          <textarea
            id="description"
            bind:value={formData.description}
            rows="4"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Describe your services, experience, and what makes you unique..."
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
              Submit Application
            {/if}
          </button>
        </div>
      </form>
    {/if}
  </div>
</div>`
};

// Create final pages
Object.entries(finalPages).forEach(([routePath, content]) => {
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

console.log('🎯 Final pages created successfully');
console.log('📝 FAQ and provider pages now available');
