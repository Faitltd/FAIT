<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { auth } from '$lib/stores/auth';
  
  onMount(() => {
    // Check if user is authenticated
    if (!$auth.isAuthenticated) {
      // Redirect to login with the current URL as the redirect target
      goto(`/login?redirect=${encodeURIComponent($page.url.pathname)}`);
      return;
    }
    
    // Check if user is a provider
    if ($auth.user?.role !== 'provider') {
      // Redirect to home if not a provider
      goto('/');
    }
  });
</script>

<slot />
