<script lang="ts">
	import { onMount } from 'svelte';
	import '../app.css';
	import Header from '$lib/components/header.svelte';
	import Footer from '$lib/components/footer.svelte';
	import ChatWidget from '$lib/components/chat/ChatWidget.svelte';
	import { authActions } from '$lib/stores/auth';

	let { children } = $props();

	// Initialize auth on app load
	onMount(() => {
		authActions.checkAuth();
	});
</script>

<Header />

<main class="min-h-screen">
	{@render children()}
</main>

<Footer />

<!-- Chat Widget -->
<ChatWidget />
