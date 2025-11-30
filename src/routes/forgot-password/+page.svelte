<script lang="ts">
  import { goto } from '$app/navigation';

  let email = '';
  let submitted = false;
  let error = '';

  const handleSubmit = (event: Event) => {
    event.preventDefault();
    if (!email) {
      error = 'Please enter your email address.';
      return;
    }
    error = '';
    submitted = true;
  };
</script>

<svelte:head>
  <title>Reset your password | FAIT</title>
  <meta name="description" content="Reset your FAIT account password." />
</svelte:head>

<section class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
  <div class="max-w-md w-full space-y-6 bg-white rounded-2xl shadow-xl p-8">
    <div class="text-center space-y-2">
      <h1 class="text-2xl font-bold text-gray-900">Forgot your password?</h1>
      <p class="text-gray-600 text-sm">
        Enter the email you use for FAIT and we'll send reset instructions.
      </p>
    </div>

    {#if error}
      <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded text-sm">
        {error}
      </div>
    {/if}

    {#if submitted}
      <div class="bg-green-100 border border-green-400 text-green-800 px-4 py-3 rounded text-sm">
        If an account exists for <strong>{email}</strong>, you'll receive password reset instructions shortly.
      </div>
      <button
        class="w-full mt-4 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
        on:click={() => goto('/login')}
      >
        Return to Login
      </button>
    {:else}
      <form class="space-y-4" on:submit|preventDefault={handleSubmit}>
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
            Email address
          </label>
          <input
            id="email"
            type="email"
            required
            bind:value={email}
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder="you@example.com"
          />
        </div>

        <button
          type="submit"
          class="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
        >
          Send reset link
        </button>
        <button
          type="button"
          class="w-full text-blue-600 hover:text-blue-700 text-sm font-medium"
          on:click={() => goto('/login')}
        >
          Back to login
        </button>
      </form>
    {/if}
  </div>
</section>
