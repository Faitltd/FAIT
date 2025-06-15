<script lang="ts">
  import { onMount } from 'svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import Card from '$lib/components/ui/Card.svelte';
  
  // Settings state
  let settings = {
    siteName: 'FAIT',
    siteDescription: 'Professional Services Platform',
    allowRegistration: true,
    requireEmailVerification: true,
    enableNotifications: true,
    maintenanceMode: false,
    maxBookingsPerUser: 10,
    defaultServiceRadius: 25,
    commissionRate: 15,
    currency: 'USD',
    timezone: 'America/New_York',
    supportEmail: 'support@fait.com',
    adminEmail: 'admin@fait.com'
  };
  
  let isSaving = false;
  let saveMessage = '';
  
  // Handle form submission
  async function saveSettings() {
    isSaving = true;
    saveMessage = '';
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, this would save to the backend
      console.log('Saving settings:', settings);
      
      saveMessage = 'Settings saved successfully!';
      setTimeout(() => {
        saveMessage = '';
      }, 3000);
    } catch (error) {
      saveMessage = 'Failed to save settings. Please try again.';
    } finally {
      isSaving = false;
    }
  }
  
  // Reset to defaults
  function resetToDefaults() {
    if (confirm('Are you sure you want to reset all settings to their default values?')) {
      settings = {
        siteName: 'FAIT',
        siteDescription: 'Professional Services Platform',
        allowRegistration: true,
        requireEmailVerification: true,
        enableNotifications: true,
        maintenanceMode: false,
        maxBookingsPerUser: 10,
        defaultServiceRadius: 25,
        commissionRate: 15,
        currency: 'USD',
        timezone: 'America/New_York',
        supportEmail: 'support@fait.com',
        adminEmail: 'admin@fait.com'
      };
    }
  }
</script>

<svelte:head>
  <title>Admin - Settings - FAIT</title>
  <meta name="description" content="Admin settings for the FAIT platform." />
</svelte:head>

<div class="min-h-screen bg-gray-50">
  <!-- Header -->
  <header class="bg-white shadow">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center py-6">
        <div class="flex items-center">
          <a href="/admin" class="text-blue-600 hover:text-blue-700 mr-4">
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </a>
          <h1 class="text-2xl font-bold text-gray-900">Platform Settings</h1>
        </div>
      </div>
    </div>
  </header>

  <!-- Main Content -->
  <main class="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
    <form on:submit|preventDefault={saveSettings} class="space-y-6">
      <!-- Save Message -->
      {#if saveMessage}
        <div class="rounded-md p-4 {saveMessage.includes('success') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}">
          {saveMessage}
        </div>
      {/if}
      
      <!-- General Settings -->
      <Card variant="elevated" padding="lg">
        <h2 class="text-xl font-bold text-gray-900 mb-6">General Settings</h2>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label for="siteName" class="block text-sm font-medium text-gray-700 mb-2">Site Name</label>
            <input
              type="text"
              id="siteName"
              bind:value={settings.siteName}
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label for="currency" class="block text-sm font-medium text-gray-700 mb-2">Currency</label>
            <select
              id="currency"
              bind:value={settings.currency}
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="USD">USD - US Dollar</option>
              <option value="EUR">EUR - Euro</option>
              <option value="GBP">GBP - British Pound</option>
              <option value="CAD">CAD - Canadian Dollar</option>
            </select>
          </div>
          
          <div class="md:col-span-2">
            <label for="siteDescription" class="block text-sm font-medium text-gray-700 mb-2">Site Description</label>
            <textarea
              id="siteDescription"
              bind:value={settings.siteDescription}
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            ></textarea>
          </div>
          
          <div>
            <label for="timezone" class="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
            <select
              id="timezone"
              bind:value={settings.timezone}
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="America/New_York">Eastern Time</option>
              <option value="America/Chicago">Central Time</option>
              <option value="America/Denver">Mountain Time</option>
              <option value="America/Los_Angeles">Pacific Time</option>
              <option value="UTC">UTC</option>
            </select>
          </div>
        </div>
      </Card>
      
      <!-- User Settings -->
      <Card variant="elevated" padding="lg">
        <h2 class="text-xl font-bold text-gray-900 mb-6">User Settings</h2>
        
        <div class="space-y-4">
          <div class="flex items-center">
            <input
              type="checkbox"
              id="allowRegistration"
              bind:checked={settings.allowRegistration}
              class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label for="allowRegistration" class="ml-2 block text-sm text-gray-700">
              Allow new user registration
            </label>
          </div>
          
          <div class="flex items-center">
            <input
              type="checkbox"
              id="requireEmailVerification"
              bind:checked={settings.requireEmailVerification}
              class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label for="requireEmailVerification" class="ml-2 block text-sm text-gray-700">
              Require email verification for new accounts
            </label>
          </div>
          
          <div class="flex items-center">
            <input
              type="checkbox"
              id="enableNotifications"
              bind:checked={settings.enableNotifications}
              class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label for="enableNotifications" class="ml-2 block text-sm text-gray-700">
              Enable email notifications
            </label>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div>
              <label for="maxBookingsPerUser" class="block text-sm font-medium text-gray-700 mb-2">Max Bookings Per User</label>
              <input
                type="number"
                id="maxBookingsPerUser"
                bind:value={settings.maxBookingsPerUser}
                min="1"
                max="100"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label for="defaultServiceRadius" class="block text-sm font-medium text-gray-700 mb-2">Default Service Radius (miles)</label>
              <input
                type="number"
                id="defaultServiceRadius"
                bind:value={settings.defaultServiceRadius}
                min="1"
                max="100"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      </Card>
      
      <!-- Business Settings -->
      <Card variant="elevated" padding="lg">
        <h2 class="text-xl font-bold text-gray-900 mb-6">Business Settings</h2>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label for="commissionRate" class="block text-sm font-medium text-gray-700 mb-2">Commission Rate (%)</label>
            <input
              type="number"
              id="commissionRate"
              bind:value={settings.commissionRate}
              min="0"
              max="50"
              step="0.1"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label for="supportEmail" class="block text-sm font-medium text-gray-700 mb-2">Support Email</label>
            <input
              type="email"
              id="supportEmail"
              bind:value={settings.supportEmail}
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label for="adminEmail" class="block text-sm font-medium text-gray-700 mb-2">Admin Email</label>
            <input
              type="email"
              id="adminEmail"
              bind:value={settings.adminEmail}
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </Card>
      
      <!-- System Settings -->
      <Card variant="elevated" padding="lg">
        <h2 class="text-xl font-bold text-gray-900 mb-6">System Settings</h2>
        
        <div class="space-y-4">
          <div class="flex items-center">
            <input
              type="checkbox"
              id="maintenanceMode"
              bind:checked={settings.maintenanceMode}
              class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label for="maintenanceMode" class="ml-2 block text-sm text-gray-700">
              Enable maintenance mode
            </label>
          </div>
          
          {#if settings.maintenanceMode}
            <div class="ml-6 p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
              <p class="text-sm">
                <strong>Warning:</strong> Maintenance mode will prevent users from accessing the site. 
                Only administrators will be able to log in.
              </p>
            </div>
          {/if}
        </div>
      </Card>
      
      <!-- Action Buttons -->
      <div class="flex justify-between">
        <Button 
          type="button"
          variant="outline"
          on:click={resetToDefaults}
        >
          Reset to Defaults
        </Button>
        
        <div class="flex gap-3">
          <Button 
            type="button"
            variant="outline"
            href="/admin"
          >
            Cancel
          </Button>
          
          <Button 
            type="submit"
            variant="primary"
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </div>
    </form>
  </main>
</div>
