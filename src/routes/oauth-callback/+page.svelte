<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { authActions } from '$lib/stores/auth';

	let loading = true;
	let error = '';

	onMount(async () => {
		try {
			// Check auth status after OAuth redirect
			await authActions.checkAuth();
			
			// Redirect to dashboard or home
			setTimeout(() => {
				goto('/bookings');
			}, 1000);
		} catch (err) {
			console.error('OAuth callback error:', err);
			error = 'Authentication failed. Please try again.';
			
			// Redirect to login page after error
			setTimeout(() => {
				goto('/login');
			}, 3000);
		} finally {
			loading = false;
		}
	});
</script>

<svelte:head>
	<title>Authenticating - FAIT</title>
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
	<div class="max-w-md w-full text-center">
		{#if loading}
			<div class="bg-white rounded-2xl shadow-xl p-8">
				<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
				<h2 class="text-xl font-semibold text-gray-900 mb-2">Authenticating...</h2>
				<p class="text-gray-600">Please wait while we complete your login.</p>
			</div>
		{:else if error}
			<div class="bg-white rounded-2xl shadow-xl p-8">
				<div class="text-red-500 mb-4">
					<svg class="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
					</svg>
				</div>
				<h2 class="text-xl font-semibold text-gray-900 mb-2">Authentication Failed</h2>
				<p class="text-gray-600 mb-4">{error}</p>
				<p class="text-sm text-gray-500">Redirecting to login page...</p>
			</div>
		{:else}
			<div class="bg-white rounded-2xl shadow-xl p-8">
				<div class="text-green-500 mb-4">
					<svg class="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
					</svg>
				</div>
				<h2 class="text-xl font-semibold text-gray-900 mb-2">Login Successful!</h2>
				<p class="text-gray-600 mb-4">Welcome to FAIT. Redirecting to your dashboard...</p>
			</div>
		{/if}
	</div>
</div>
