<script lang="ts">
  import { goto } from '$app/navigation';
  import { auth } from '$lib/stores/auth';
  import Button from '$lib/components/ui/Button.svelte';
  import Card from '$lib/components/ui/Card.svelte';
  import { onMount } from 'svelte';
  import { fade } from 'svelte/transition';

  let email = '';
  let password = '';
  let rememberMe = false;
  let formErrors: Record<string, string> = {};
  let showSuccessMessage = false;

  // Clear any previous errors when the component mounts
  onMount(() => {
    auth.clearError();

    // Check if user is already logged in
    auth.checkAuth();

    // If already logged in, redirect to home
    if ($auth.isAuthenticated) {
      goto('/');
    }
  });

  // Validate form
  function validateForm(): boolean {
    formErrors = {};

    if (!email) {
      formErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      formErrors.email = 'Invalid email address';
    }

    if (!password) {
      formErrors.password = 'Password is required';
    }

    return Object.keys(formErrors).length === 0;
  }

  // Handle login
  async function handleLogin() {
    if (!validateForm()) return;

    const result = await auth.login(email, password);

    if (result.success) {
      showSuccessMessage = true;

      // Redirect after a short delay to show success message
      setTimeout(() => {
        goto('/');
      }, 1500);
    }
  }
</script>

<svelte:head>
  <title>Login - FAIT</title>
  <meta name="description" content="Log in to your FAIT account to access services and manage your bookings." />
</svelte:head>

<section class="bg-fait-light py-12">
  <div class="container-custom">
    <div class="max-w-md mx-auto">
      <h1 class="text-3xl font-ivy font-bold text-fait-dark mb-6 text-center">Log In</h1>

      <Card variant="elevated" padding="lg">
        {#if showSuccessMessage}
          <div in:fade class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            <p>Login successful! Redirecting...</p>
          </div>
        {/if}

        {#if $auth.error}
          <div in:fade class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p>{$auth.error}</p>
          </div>
        {/if}

        <form on:submit|preventDefault={handleLogin} class="space-y-4">
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              id="email"
              bind:value={email}
              class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-fait-blue
                {formErrors.email ? 'border-red-500' : ''}"
            />
            {#if formErrors.email}
              <p class="text-red-500 text-xs mt-1">{formErrors.email}</p>
            {/if}
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              id="password"
              bind:value={password}
              class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-fait-blue
                {formErrors.password ? 'border-red-500' : ''}"
            />
            {#if formErrors.password}
              <p class="text-red-500 text-xs mt-1">{formErrors.password}</p>
            {/if}
          </div>

          <div class="flex justify-between items-center">
            <div class="flex items-center">
              <input
                type="checkbox"
                id="remember"
                bind:checked={rememberMe}
                class="h-4 w-4 text-fait-blue focus:ring-fait-blue border-gray-300 rounded"
              />
              <label for="remember" class="ml-2 block text-sm text-gray-700">Remember me</label>
            </div>

            <a href="/forgot-password" class="text-sm text-fait-blue hover:underline">Forgot password?</a>
          </div>

          <Button
            type="submit"
            variant="primary"
            fullWidth={true}
            loading={$auth.isLoading}
            disabled={$auth.isLoading}
            animate={true}
          >
            Log In
          </Button>
        </form>

        <div class="mt-6 text-center">
          <p class="text-sm text-gray-600">
            Don't have an account? <a href="/register" class="text-fait-blue hover:underline">Sign up</a>
          </p>
        </div>

        <div class="mt-6 pt-6 border-t border-gray-200">
          <p class="text-sm text-gray-600 mb-4 text-center">Test Accounts:</p>
          <div class="grid grid-cols-1 gap-2 text-sm">
            <div class="bg-gray-50 p-2 rounded">
              <p><strong>Client:</strong> test@example.com / password123</p>
            </div>
            <div class="bg-gray-50 p-2 rounded">
              <p><strong>Provider:</strong> provider@example.com / password123</p>
            </div>
            <div class="bg-gray-50 p-2 rounded">
              <p><strong>Admin:</strong> admin@example.com / admin123</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  </div>
</section>
