<script>
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
      <a href="/search" class="hover:text-blue-200 transition-colors">Search</a>
      <a href="/pricing" class="hover:text-blue-200 transition-colors">Pricing</a>
      <a href="/about" class="hover:text-blue-200 transition-colors">About</a>

      {#if user}
        <a href="/dashboard" class="hover:text-blue-200 transition-colors">Dashboard</a>
        <span class="text-sm">Welcome, {user.email.split('@')[0]}</span>
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
</header>