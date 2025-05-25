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
<section class="section bg-gradient-to-br from-blue-50 to-indigo-100 pt-32">
	<div class="container-xl">
		<div class="text-center mb-12 animate-on-scroll">
			<h1 class="text-5xl font-bold text-gray-900 mb-6">Find Professional Services</h1>
			<p class="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
				Browse our extensive directory of verified professionals ready to help with your next project.
			</p>
			
			<!-- Search Bar -->
			<div class="max-w-2xl mx-auto">
				<div class="flex flex-col md:flex-row gap-4">
					<div class="flex-1">
						<input
							type="text"
							placeholder="Search services..."
							bind:value={searchQuery}
							class="w-full px-6 py-4 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
						/>
					</div>
					<div class="md:w-48">
						<input
							type="text"
							placeholder="Location"
							bind:value={selectedLocation}
							class="w-full px-6 py-4 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
						/>
					</div>
					<button class="btn btn-primary text-lg px-8 py-4 hover-scale">
						Search
					</button>
				</div>
			</div>
		</div>
	</div>
</section>

<!-- Categories Section -->
<section class="section bg-white">
	<div class="container-xl">
		<div class="animate-on-scroll">
			<h2 class="text-3xl font-bold text-gray-900 mb-8 text-center">Service Categories</h2>
			<div class="flex flex-wrap justify-center gap-4 mb-12">
				{#each categories as category}
					<button
						class="flex items-center space-x-2 px-6 py-3 rounded-full border-2 transition-all duration-150 hover-scale {selectedCategory === category.id ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:border-blue-600'}"
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
<section class="section bg-gray-50">
	<div class="container-xl">
		<div class="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
			{#each filteredServices as service, index}
				<div class="card animate-on-scroll" style="animation-delay: {index * 0.1}s">
					<div class="text-center mb-4">
						<div class="text-4xl mb-2">{service.image}</div>
						<h3 class="text-xl font-semibold text-gray-900 mb-2">{service.title}</h3>
						<p class="text-gray-600 text-sm mb-4">{service.description}</p>
					</div>
					
					<div class="flex items-center justify-between mb-4">
						<div class="flex items-center space-x-1">
							<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
								<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
							</svg>
							<span class="text-sm font-medium text-gray-900">{service.rating}</span>
							<span class="text-sm text-gray-500">({service.reviews})</span>
						</div>
						<div class="text-lg font-bold text-blue-600">{service.price}</div>
					</div>
					
					<button class="btn btn-primary w-full hover-scale">
						View Details
					</button>
				</div>
			{/each}
		</div>
		
		{#if filteredServices.length === 0}
			<div class="text-center py-12 animate-on-scroll">
				<div class="text-6xl mb-4">🔍</div>
				<h3 class="text-2xl font-bold text-gray-900 mb-2">No services found</h3>
				<p class="text-gray-600">Try adjusting your search criteria or browse all categories.</p>
			</div>
		{/if}
	</div>
</section>

<!-- CTA Section -->
<section class="section bg-blue-600">
	<div class="container-xl text-center">
		<div class="animate-on-scroll">
			<h2 class="text-4xl font-bold text-white mb-4">Ready to Get Started?</h2>
			<p class="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
				Join thousands of satisfied customers who have found the perfect professional for their projects.
			</p>
			<div class="flex flex-col sm:flex-row gap-4 justify-center">
				<a href="/signup" class="btn bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-4 hover-scale">
					Get Started
				</a>
				<a href="/about" class="btn border-2 border-white text-white hover:bg-white hover:text-blue-600 text-lg px-8 py-4 hover-scale">
					Learn More
				</a>
			</div>
		</div>
	</div>
</section>
