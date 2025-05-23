<script lang="ts">
	import { onMount } from 'svelte';

	let scrolled = false;
	let menuOpen = false;

	onMount(() => {
		const handleScroll = () => {
			scrolled = window.scrollY > 20;
		};

		window.addEventListener('scroll', handleScroll);
		return () => {
			window.removeEventListener('scroll', handleScroll);
		};
	});

	function toggleMenu() {
		menuOpen = !menuOpen;
	}
</script>

<header class="fixed top-0 left-0 w-full z-50 transition-all duration-300 {scrolled ? 'bg-white shadow-md py-3' : 'bg-transparent py-5'}">
	<div class="container-xl flex items-center justify-between">
		<a href="/" class="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors">
			<svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
				<polyline points="9 22 9 12 15 12 15 22"></polyline>
			</svg>
			<span class="font-sans text-xl font-bold">FAIT</span>
		</a>

		<!-- Desktop Navigation -->
		<nav class="hidden md:flex items-center space-x-8">
			<a href="/services" class="text-gray-700 hover:text-blue-600 transition-colors">Services</a>
			<a href="/about" class="text-gray-700 hover:text-blue-600 transition-colors">About</a>
			<a href="/contact" class="text-gray-700 hover:text-blue-600 transition-colors">Contact</a>
			<a href="/login" class="btn btn-secondary">Log In</a>
			<a href="/signup" class="btn btn-primary">Sign Up</a>
		</nav>

		<!-- Mobile Menu Button -->
		<button class="md:hidden text-gray-700" on:click={toggleMenu} aria-label="Toggle menu">
			{#if menuOpen}
				<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
				</svg>
			{:else}
				<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
				</svg>
			{/if}
		</button>

		<!-- Language Switcher -->
		<div class="hidden md:block">
			<div class="flex space-x-2">
				<button class="text-sm text-gray-600 hover:text-blue-600">EN</button>
				<span class="text-gray-400">|</span>
				<button class="text-sm text-gray-600 hover:text-blue-600">ES</button>
			</div>
		</div>
	</div>

	<!-- Mobile Navigation -->
	{#if menuOpen}
		<div class="md:hidden bg-white shadow-lg absolute top-full left-0 w-full animate-slide-down">
			<div class="container-xl py-4 flex flex-col space-y-4">
				<a href="/services" class="text-gray-700 hover:text-blue-600 transition-colors py-2">Services</a>
				<a href="/about" class="text-gray-700 hover:text-blue-600 transition-colors py-2">About</a>
				<a href="/contact" class="text-gray-700 hover:text-blue-600 transition-colors py-2">Contact</a>
				<div class="flex flex-col space-y-2 pt-2">
					<a href="/login" class="btn btn-secondary w-full">Log In</a>
					<a href="/signup" class="btn btn-primary w-full">Sign Up</a>
				</div>
				<div class="pt-2">
					<div class="flex space-x-2">
						<button class="text-sm text-gray-600 hover:text-blue-600">EN</button>
						<span class="text-gray-400">|</span>
						<button class="text-sm text-gray-600 hover:text-blue-600">ES</button>
					</div>
				</div>
			</div>
		</div>
	{/if}
</header>

<!-- Spacer to prevent content from being hidden behind fixed header -->
<div class="h-20"></div>
