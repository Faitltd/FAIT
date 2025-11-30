<script lang="ts">
  import { goto } from '$app/navigation';

  const goToLogin = () => goto('/login');
</script>

<svelte:head>
  <title>Professional Login | FAIT</title>
  <meta name="description" content="Login for FAIT professionals and providers." />
</svelte:head>

<section class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
  <div class="max-w-md w-full space-y-6 bg-white rounded-2xl shadow-xl p-8">
    <div class="text-center space-y-2">
      <h1 class="text-2xl font-bold text-gray-900">Professional Login</h1>
      <p class="text-gray-600 text-sm">
        Access your provider dashboard to manage services, bookings, and availability.
      </p>
    </div>

    <div class="space-y-3">
      <button
        class="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
        on:click={goToLogin}
      >
        Continue to Login
      </button>
      <button
        class="w-full text-blue-600 hover:text-blue-700 text-sm font-medium"
        on:click={() => goto('/provider/signup')}
      >
        New provider? Apply to join
      </button>
    </div>
  </div>
</section>
