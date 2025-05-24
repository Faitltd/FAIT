<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { auth } from '$lib/stores/auth';

	onMount(() => {
		// Check if user is authenticated and is admin
		auth.subscribe(state => {
			if (!state.isAuthenticated) {
				goto(`/login?redirect=${encodeURIComponent($page.url.pathname)}`);
			} else if (state.user?.role !== 'admin') {
				goto('/'); // Redirect non-admin users to home
			}
		});
	});
</script>

<slot />
