<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';

	let animationVisible = false;

	onMount(() => {
		setTimeout(() => {
			animationVisible = true;
		}, 100);
	});
</script>

<svelte:head>
	<title>Page Not Found - FAIT</title>
	<meta name="description" content="The page you're looking for doesn't exist. Return to FAIT homepage or browse our services." />
</svelte:head>

<section class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4">
	<div class="max-w-2xl mx-auto text-center">
		<div class="animate-on-scroll {animationVisible ? 'show' : ''}">
			<!-- Error Animation -->
			<div class="text-8xl mb-8 animate-bounce">
				🔍
			</div>
			
			<h1 class="text-6xl font-bold text-gray-900 mb-4">
				{$page.status || 404}
			</h1>
			
			<h2 class="text-3xl font-bold text-gray-700 mb-6">
				{#if $page.status === 404}
					Page Not Found
				{:else if $page.status === 500}
					Server Error
				{:else}
					Something Went Wrong
				{/if}
			</h2>
			
			<p class="text-xl text-gray-600 mb-8 leading-relaxed">
				{#if $page.status === 404}
					The page you're looking for doesn't exist. It might have been moved, deleted, or you entered the wrong URL.
				{:else if $page.status === 500}
					We're experiencing some technical difficulties. Our team has been notified and is working to fix the issue.
				{:else}
					An unexpected error occurred. Please try again or contact our support team if the problem persists.
				{/if}
			</p>
			
			<!-- Action Buttons -->
			<div class="flex flex-col sm:flex-row gap-4 justify-center mb-12">
				<a href="/" class="btn btn-primary text-lg px-8 py-4 hover-scale">
					🏠 Go Home
				</a>
				<a href="/services" class="btn btn-secondary text-lg px-8 py-4 hover-scale">
					🔍 Browse Services
				</a>
				<a href="/contact" class="btn btn-secondary text-lg px-8 py-4 hover-scale">
					📞 Contact Support
				</a>
			</div>
			
			<!-- Helpful Links -->
			<div class="bg-white rounded-2xl shadow-lg p-8">
				<h3 class="text-2xl font-bold text-gray-900 mb-6">Popular Pages</h3>
				<div class="grid md:grid-cols-2 gap-4">
					<a href="/services" class="flex items-center space-x-3 p-4 rounded-lg hover:bg-gray-50 transition-colors">
						<div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
							<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
							</svg>
						</div>
						<div class="text-left">
							<div class="font-semibold text-gray-900">Find Services</div>
							<div class="text-sm text-gray-600">Browse all available services</div>
						</div>
					</a>
					
					<a href="/about" class="flex items-center space-x-3 p-4 rounded-lg hover:bg-gray-50 transition-colors">
						<div class="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
							<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
							</svg>
						</div>
						<div class="text-left">
							<div class="font-semibold text-gray-900">About FAIT</div>
							<div class="text-sm text-gray-600">Learn about our mission</div>
						</div>
					</a>
					
					<a href="/signup" class="flex items-center space-x-3 p-4 rounded-lg hover:bg-gray-50 transition-colors">
						<div class="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
							<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
							</svg>
						</div>
						<div class="text-left">
							<div class="font-semibold text-gray-900">Join FAIT</div>
							<div class="text-sm text-gray-600">Create your account</div>
						</div>
					</a>
					
					<a href="/contact" class="flex items-center space-x-3 p-4 rounded-lg hover:bg-gray-50 transition-colors">
						<div class="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
							<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
							</svg>
						</div>
						<div class="text-left">
							<div class="font-semibold text-gray-900">Get Help</div>
							<div class="text-sm text-gray-600">Contact our support team</div>
						</div>
					</a>
				</div>
			</div>
		</div>
	</div>
</section>

<style>
	.animate-on-scroll {
		opacity: 0;
		transform: translateY(20px);
		transition: all 0.6s ease-out;
	}
	
	.animate-on-scroll.show {
		opacity: 1;
		transform: translateY(0);
	}
</style>
