<script lang="ts">
  import { onMount } from 'svelte';
  import { auth } from '$lib/stores/auth';
  import Button from '$lib/components/ui/Button.svelte';
  import Card from '$lib/components/ui/Card.svelte';
  
  // Form state
  let name = '';
  let email = '';
  let phone = '';
  let address = '';
  let bio = '';
  let success = false;
  
  // Initialize form with user data
  onMount(() => {
    if ($auth.user) {
      name = $auth.user.name;
      email = $auth.user.email;
      phone = $auth.user.phone || '';
      address = $auth.user.address || '';
      bio = $auth.user.bio || '';
    }
  });
  
  async function handleSubmit() {
    // Update user profile
    const result = await auth.updateProfile({
      name,
      phone,
      address,
      bio
    });
    
    if (result.success) {
      success = true;
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        success = false;
      }, 3000);
    }
  }
</script>

<svelte:head>
  <title>Profile - FAIT</title>
  <meta name="description" content="Manage your FAIT profile and account settings." />
</svelte:head>

<section class="bg-fait-light py-12">
  <div class="container-custom">
    <h1 class="text-3xl font-ivy font-bold text-fait-dark mb-6">Your Profile</h1>
    
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      <!-- Sidebar -->
      <div class="md:col-span-1">
        <Card variant="elevated" padding="md">
          <div class="flex flex-col items-center text-center">
            <div class="w-24 h-24 rounded-full overflow-hidden bg-gray-200 mb-4">
              {#if $auth.user?.avatar}
                <img src={$auth.user.avatar} alt={$auth.user.name} class="w-full h-full object-cover" />
              {:else}
                <div class="w-full h-full flex items-center justify-center text-gray-500 text-4xl">
                  {$auth.user?.name.charAt(0).toUpperCase()}
                </div>
              {/if}
            </div>
            
            <h2 class="text-xl font-bold mb-1">{$auth.user?.name}</h2>
            <p class="text-gray-600 mb-4">{$auth.user?.email}</p>
            
            <div class="w-full border-t border-gray-200 pt-4 mt-2">
              <nav class="flex flex-col space-y-2">
                <a href="/profile" class="py-2 px-4 bg-fait-blue text-white rounded-md">Profile</a>
                <a href="/bookings" class="py-2 px-4 text-fait-dark hover:bg-gray-100 rounded-md">My Bookings</a>
                <a href="/payments" class="py-2 px-4 text-fait-dark hover:bg-gray-100 rounded-md">Payment Methods</a>
                <a href="/settings" class="py-2 px-4 text-fait-dark hover:bg-gray-100 rounded-md">Account Settings</a>
              </nav>
            </div>
          </div>
        </Card>
      </div>
      
      <!-- Main Content -->
      <div class="md:col-span-2">
        <Card variant="elevated" padding="lg">
          <h2 class="text-xl font-bold mb-6">Edit Profile</h2>
          
          {#if success}
            <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
              <p>Profile updated successfully!</p>
            </div>
          {/if}
          
          <form on:submit|preventDefault={handleSubmit} class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label for="name" class="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input 
                  type="text" 
                  id="name" 
                  bind:value={name} 
                  required
                  class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-fait-blue"
                />
              </div>
              
              <div>
                <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input 
                  type="email" 
                  id="email" 
                  bind:value={email} 
                  required
                  class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-fait-blue"
                />
              </div>
              
              <div>
                <label for="phone" class="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input 
                  type="tel" 
                  id="phone" 
                  bind:value={phone} 
                  class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-fait-blue"
                />
              </div>
              
              <div>
                <label for="address" class="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input 
                  type="text" 
                  id="address" 
                  bind:value={address} 
                  class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-fait-blue"
                />
              </div>
            </div>
            
            <div>
              <label for="bio" class="block text-sm font-medium text-gray-700 mb-1">Bio</label>
              <textarea 
                id="bio" 
                bind:value={bio} 
                rows="4"
                class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-fait-blue"
              ></textarea>
              <p class="text-sm text-gray-500 mt-1">Tell us a bit about yourself.</p>
            </div>
            
            <div class="flex justify-end">
              <Button type="submit" variant="primary" disabled={$auth.isLoading}>
                {$auth.isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  </div>
</section>
