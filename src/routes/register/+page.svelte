<script lang="ts">
  import { goto } from '$app/navigation';
  import { auth } from '$lib/stores/auth';
  import Button from '$lib/components/ui/Button.svelte';
  import Card from '$lib/components/ui/Card.svelte';
  
  let name = '';
  let email = '';
  let password = '';
  let confirmPassword = '';
  let role: 'client' | 'provider' = 'client';
  let isLoading = false;
  let error: string | null = null;
  
  async function handleRegister() {
    // Validate form
    if (password !== confirmPassword) {
      error = 'Passwords do not match';
      return;
    }
    
    isLoading = true;
    error = null;
    
    const result = await auth.register(name, email, password, role);
    
    isLoading = false;
    
    if (result.success) {
      goto('/');
    } else {
      error = result.error || 'Registration failed';
    }
  }
</script>

<svelte:head>
  <title>Register - FAIT</title>
  <meta name="description" content="Create a new FAIT account to access services or become a service provider." />
</svelte:head>

<section class="bg-fait-light py-12">
  <div class="container-custom">
    <div class="max-w-md mx-auto">
      <h1 class="text-3xl font-ivy font-bold text-fait-dark mb-6 text-center">Create an Account</h1>
      
      <Card variant="elevated" padding="lg">
        {#if error}
          <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p>{error}</p>
          </div>
        {/if}
        
        <form on:submit|preventDefault={handleRegister} class="space-y-4">
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
            <label for="password" class="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input 
              type="password" 
              id="password" 
              bind:value={password} 
              required
              minlength="8"
              class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-fait-blue"
            />
          </div>
          
          <div>
            <label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
            <input 
              type="password" 
              id="confirmPassword" 
              bind:value={confirmPassword} 
              required
              minlength="8"
              class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-fait-blue"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Account Type</label>
            <div class="flex space-x-4">
              <label class="flex items-center">
                <input 
                  type="radio" 
                  name="role" 
                  value="client" 
                  bind:group={role}
                  class="h-4 w-4 text-fait-blue focus:ring-fait-blue border-gray-300"
                />
                <span class="ml-2 text-sm text-gray-700">I need services</span>
              </label>
              
              <label class="flex items-center">
                <input 
                  type="radio" 
                  name="role" 
                  value="provider" 
                  bind:group={role}
                  class="h-4 w-4 text-fait-blue focus:ring-fait-blue border-gray-300"
                />
                <span class="ml-2 text-sm text-gray-700">I provide services</span>
              </label>
            </div>
          </div>
          
          <div class="flex items-center">
            <input 
              type="checkbox" 
              id="terms" 
              required
              class="h-4 w-4 text-fait-blue focus:ring-fait-blue border-gray-300 rounded"
            />
            <label for="terms" class="ml-2 block text-sm text-gray-700">
              I agree to the <a href="/terms" class="text-fait-blue hover:underline">Terms of Service</a> and <a href="/privacy" class="text-fait-blue hover:underline">Privacy Policy</a>
            </label>
          </div>
          
          <Button type="submit" variant="primary" fullWidth={true} disabled={isLoading}>
            {isLoading ? 'Creating account...' : 'Create Account'}
          </Button>
        </form>
        
        <div class="mt-6 text-center">
          <p class="text-sm text-gray-600">
            Already have an account? <a href="/login" class="text-fait-blue hover:underline">Log in</a>
          </p>
        </div>
      </Card>
    </div>
  </div>
</section>
