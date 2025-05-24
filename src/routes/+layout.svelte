<script lang="ts">
	import '../app.css';
	import Header from '$lib/components/header.svelte';
	import Footer from '$lib/components/footer.svelte';
	import ChatWidget from '$lib/components/chat/ChatWidget.svelte';
	let { children } = $props();
</script>

<Header />

<main class="min-h-screen">
	{@render children()}
</main>

<Footer />

<!-- Chat Widget -->
<ChatWidget />
