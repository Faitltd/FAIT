<script lang="ts">
	import { onMount } from 'svelte';

	let searchQuery = '';
	let selectedCategory = 'all';
	let selectedLocation = '';

	const categories = [
		{ id: 'all', name: 'All Services', icon: '🔍' },
		{ id: 'home', name: 'Home & Garden', icon: '🏠' },
		{ id: 'cleaning', name: 'Cleaning', icon: '🧹' },
		{ id: 'repair', name: 'Repair & Maintenance', icon: '🔧' },
		{ id: 'design', name: 'Design & Creative', icon: '🎨' },
		{ id: 'business', name: 'Business Services', icon: '💼' },
		{ id: 'education', name: 'Education & Training', icon: '📚' },
		{ id: 'health', name: 'Health & Wellness', icon: '💪' },
		{ id: 'events', name: 'Events & Entertainment', icon: '🎉' }
	];

	const services = [
		{ id: 1, title: 'House Cleaning', category: 'cleaning', price: '$80-150', rating: 4.9, reviews: 234, image: '🧹', description: 'Professional house cleaning services' },
		{ id: 2, title: 'Plumbing Repair', category: 'repair', price: '$100-200', rating: 4.8, reviews: 189, image: '🔧', description: 'Licensed plumbing repair and installation' },
		{ id: 3, title: 'Interior Design', category: 'design', price: '$500-2000', rating: 4.9, reviews: 156, image: '🎨', description: 'Professional interior design consultation' },
		{ id: 4, title: 'Lawn Care', category: 'home', price: '$50-120', rating: 4.7, reviews: 298, image: '🌱', description: 'Lawn mowing, trimming, and maintenance' },
		{ id: 5, title: 'Personal Training', category: 'health', price: '$60-100', rating: 4.8, reviews: 167, image: '💪', description: 'Certified personal fitness training' },
		{ id: 6, title: 'Web Design', category: 'design', price: '$800-3000', rating: 4.9, reviews: 89, image: '💻', description: 'Custom website design and development' },
		{ id: 7, title: 'Tutoring', category: 'education', price: '$30-80', rating: 4.8, reviews: 245, image: '📚', description: 'Academic tutoring for all subjects' },
		{ id: 8, title: 'Event Planning', category: 'events', price: '$500-5000', rating: 4.9, reviews: 123, image: '🎉', description: 'Complete event planning and coordination' }
	];

	let filteredServices = services;

	function filterServices() {
		filteredServices = services.filter(service => {
			const matchesSearch = service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
								service.description.toLowerCase().includes(searchQuery.toLowerCase());
			const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory;
			return matchesSearch && matchesCategory;
		});
	}

	onMount(() => {
		// Animate elements on scroll
		const observer = new IntersectionObserver((entries) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					entry.target.classList.add('show');
				}
			});
		}, { threshold: 0.1 });

		document.querySelectorAll('.animate-on-scroll').forEach((el) => {
			observer.observe(el);
		});

		return () => observer.disconnect();
	});

	$: {
		searchQuery, selectedCategory;
		filterServices();
	}
</script>

<svelte:head>
	<title>Services - FAIT Professional Services Platform</title>
	<meta name="description" content="Browse our extensive directory of professional services. Find trusted experts for home improvement, cleaning, design, business services, and more." />
</svelte:head>

<!-- Hero Section -->
<section class="py-20 bg-gradient-to-br from-blue-50 to-indigo-100">
	<div class="container mx-auto px-4">
		<div class="text-center mb-12">
			<h1 class="text-5xl font-bold text-gray-900 mb-6">Find Professional Services</h1>
			<p class="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
				Browse our extensive directory of verified professionals ready to help with your next project.
			</p>

			<!-- Enhanced Search Bar -->
			<div class="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-6">
				<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
					<div class="relative">
						<svg class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
						</svg>
						<input
							type="text"
							placeholder="What service do you need?"
							bind:value={searchQuery}
							class="w-full pl-10 pr-4 py-4 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
						/>
					</div>
					<div class="relative">
						<svg class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
						</svg>
						<input
							type="text"
							placeholder="Enter your location"
							bind:value={selectedLocation}
							class="w-full pl-10 pr-4 py-4 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
						/>
					</div>
					<button class="bg-blue-600 text-white text-lg px-8 py-4 rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-lg">
						Search Services
					</button>
				</div>

				<!-- Quick Filters -->
				<div class="mt-6 flex flex-wrap gap-2 justify-center">
					<span class="text-sm text-gray-600 mr-2">Popular:</span>
					{#each ['House Cleaning', 'Plumbing', 'Lawn Care', 'Tutoring'] as quickFilter}
						<button
							class="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded-full hover:bg-blue-100 hover:text-blue-700 transition-colors"
							on:click={() => searchQuery = quickFilter}
						>
							{quickFilter}
						</button>
					{/each}
				</div>
			</div>
		</div>
	</div>
</section>

<!-- Categories Section -->
<section class="py-16 bg-white">
	<div class="container mx-auto px-4">
		<div>
			<h2 class="text-3xl font-bold text-gray-900 mb-8 text-center">Service Categories</h2>
			<div class="flex flex-wrap justify-center gap-4 mb-12">
				{#each categories as category}
					<button
						class="flex items-center space-x-2 px-6 py-3 rounded-full border-2 transition-all duration-200 transform hover:scale-105 {selectedCategory === category.id ? 'bg-blue-600 text-white border-blue-600 shadow-lg' : 'bg-white text-gray-700 border-gray-300 hover:border-blue-600 hover:shadow-md'}"
						on:click={() => selectedCategory = category.id}
					>
						<span class="text-lg">{category.icon}</span>
						<span class="font-medium">{category.name}</span>
					</button>
				{/each}
			</div>
		</div>
	</div>
</section>

<!-- Services Grid -->
<section class="py-16 bg-gray-50">
	<div class="container mx-auto px-4">
		<!-- Results Summary -->
		<div class="mb-8 text-center">
			<p class="text-lg text-gray-600">
				{#if searchQuery || selectedCategory !== 'all'}
					Showing {filteredServices.length} results
					{#if searchQuery}for "{searchQuery}"{/if}
					{#if selectedCategory !== 'all'}in {categories.find(c => c.id === selectedCategory)?.name}{/if}
				{:else}
					Browse all {filteredServices.length} available services
				{/if}
			</p>
		</div>

		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
			{#each filteredServices as service, index}
				<div class="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden">
					<div class="p-6">
						<div class="text-center mb-4">
							<div class="text-4xl mb-3">{service.image}</div>
							<h3 class="text-xl font-semibold text-gray-900 mb-2">{service.title}</h3>
							<p class="text-gray-600 text-sm mb-4">{service.description}</p>
						</div>

						<div class="flex items-center justify-between mb-6">
							<div class="flex items-center space-x-1">
								<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
									<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
								</svg>
								<span class="text-sm font-medium text-gray-900">{service.rating}</span>
								<span class="text-sm text-gray-500">({service.reviews})</span>
							</div>
							<div class="text-lg font-bold text-blue-600">{service.price}</div>
						</div>

						<button class="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-semibold transform hover:scale-105">
							View Details
						</button>
					</div>
				</div>
			{/each}
		</div>

		{#if filteredServices.length === 0}
			<div class="text-center py-12">
				<div class="text-6xl mb-4">🔍</div>
				<h3 class="text-2xl font-bold text-gray-900 mb-2">No services found</h3>
				<p class="text-gray-600 mb-6">Try adjusting your search criteria or browse all categories.</p>
				<button
					class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
					on:click={() => {searchQuery = ''; selectedCategory = 'all';}}
				>
					Show All Services
				</button>
			</div>
		{/if}
	</div>
</section>

<!-- CTA Section -->
<section class="py-20 bg-blue-600">
	<div class="container mx-auto px-4 text-center">
		<div>
			<h2 class="text-4xl font-bold text-white mb-4">Ready to Get Started?</h2>
			<p class="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
				Join thousands of satisfied customers who have found the perfect professional for their projects.
			</p>
			<div class="flex flex-col sm:flex-row gap-4 justify-center">
				<a href="/signup" class="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-4 rounded-lg font-semibold transition-colors transform hover:scale-105 shadow-lg">
					Get Started
				</a>
				<a href="/about" class="border-2 border-white text-white hover:bg-white hover:text-blue-600 text-lg px-8 py-4 rounded-lg font-semibold transition-colors transform hover:scale-105">
					Learn More
				</a>
			</div>
		</div>
	</div>
</section>
