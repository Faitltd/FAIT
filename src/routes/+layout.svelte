<script lang="ts">
	import '../app.css';

	import { ModeWatcher } from 'mode-watcher';
	import Header from '$components/header.svelte';
	import Footer from '$components/footer.svelte';

	let { children } = $props();
</script>

<ModeWatcher />

<Header />

<main>
	{@render children()}
</main>

<Footer />
