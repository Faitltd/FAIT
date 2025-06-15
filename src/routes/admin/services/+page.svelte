<script lang="ts">
	import { onMount } from 'svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';

	interface Service {
		id: string;
		title: string;
		description: string;
		category: string;
		price: number;
		provider: string;
		status: 'active' | 'inactive' | 'pending';
		created_at: string;
	}

	let services: Service[] = [];
	let isLoading = true;
	let searchTerm = '';
	let selectedCategory = 'all';
	let showCreateModal = false;

	// Mock data
	const mockServices: Service[] = [
		{
			id: '1',
			title: 'Professional House Cleaning',
			description: 'Deep cleaning service for your entire home',
			category: 'Cleaning',
			price: 150,
			provider: 'Clean Pro Services',
			status: 'active',
			created_at: '2024-01-15'
		},
		{
			id: '2',
			title: 'Handyman Repairs',
			description: 'General home repairs and maintenance',
			category: 'Handyman',
			price: 75,
			provider: 'Fix It Fast',
			status: 'active',
			created_at: '2024-01-14'
		},
		{
			id: '3',
			title: 'Garden Landscaping',
			description: 'Complete garden design and landscaping',
			category: 'Gardening',
			price: 300,
			provider: 'Green Thumb Gardens',
			status: 'pending',
			created_at: '2024-01-13'
		}
	];

	const categories = ['all', 'Cleaning', 'Handyman', 'Gardening', 'Moving', 'Plumbing', 'Electrical'];

	onMount(() => {
		loadServices();
	});

	async function loadServices() {
		isLoading = true;
		// Simulate API call
		await new Promise(resolve => setTimeout(resolve, 1000));
		services = mockServices;
		isLoading = false;
	}

	$: filteredServices = services.filter(service => {
		const matchesSearch = service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
							 service.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
							 service.provider.toLowerCase().includes(searchTerm.toLowerCase());
		const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory;
		return matchesSearch && matchesCategory;
	});

	function toggleServiceStatus(serviceId: string) {
		services = services.map(service => {
			if (service.id === serviceId) {
				return {
					...service,
					status: service.status === 'active' ? 'inactive' : 'active'
				};
			}
			return service;
		});
	}

	function deleteService(serviceId: string) {
		if (confirm('Are you sure you want to delete this service?')) {
			services = services.filter(service => service.id !== serviceId);
		}
	}

	function getStatusColor(status: string) {
		switch (status) {
			case 'active': return 'bg-green-100 text-green-800';
			case 'inactive': return 'bg-red-100 text-red-800';
			case 'pending': return 'bg-yellow-100 text-yellow-800';
			default: return 'bg-gray-100 text-gray-800';
		}
	}
</script>

<svelte:head>
	<title>Manage Services - FAIT Admin</title>
</svelte:head>

<div class="min-h-screen bg-gray-50">
	<!-- Header -->
	<header class="bg-white shadow">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="flex justify-between items-center py-6">
				<div class="flex items-center">
					<a href="/admin" class="text-blue-600 hover:text-blue-700 mr-4">
						<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
						</svg>
					</a>
					<h1 class="text-2xl font-bold text-gray-900">Manage Services</h1>
				</div>
				<Button 
					on:click={() => showCreateModal = true}
					variant="primary"
				>
					Create New Service
				</Button>
			</div>
		</div>
	</header>

	<!-- Main Content -->
	<main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
		<!-- Filters -->
		<div class="bg-white p-6 rounded-lg shadow mb-6">
			<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div>
					<label for="search" class="block text-sm font-medium text-gray-700 mb-2">Search Services</label>
					<input
						id="search"
						type="text"
						bind:value={searchTerm}
						placeholder="Search by title, description, or provider..."
						class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
					/>
				</div>
				<div>
					<label for="category" class="block text-sm font-medium text-gray-700 mb-2">Category</label>
					<select
						id="category"
						bind:value={selectedCategory}
						class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
					>
						{#each categories as category}
							<option value={category}>{category === 'all' ? 'All Categories' : category}</option>
						{/each}
					</select>
				</div>
			</div>
		</div>

		<!-- Services List -->
		{#if isLoading}
			<div class="text-center py-12">
				<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
				<p class="mt-4 text-gray-600">Loading services...</p>
			</div>
		{:else if filteredServices.length === 0}
			<Card variant="elevated" padding="lg">
				<div class="text-center py-12">
					<svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
					</svg>
					<h3 class="mt-2 text-sm font-medium text-gray-900">No services found</h3>
					<p class="mt-1 text-sm text-gray-500">Get started by creating a new service.</p>
				</div>
			</Card>
		{:else}
			<div class="grid grid-cols-1 gap-6">
				{#each filteredServices as service}
					<Card variant="elevated" padding="md">
						<div class="flex items-center justify-between">
							<div class="flex-1">
								<div class="flex items-center space-x-3 mb-2">
									<h3 class="text-lg font-semibold text-gray-900">{service.title}</h3>
									<span class="px-2 py-1 text-xs rounded-full {getStatusColor(service.status)}">
										{service.status}
									</span>
								</div>
								<p class="text-gray-600 mb-2">{service.description}</p>
								<div class="flex items-center space-x-4 text-sm text-gray-500">
									<span>Category: {service.category}</span>
									<span>Provider: {service.provider}</span>
									<span>Price: ${service.price}</span>
									<span>Created: {new Date(service.created_at).toLocaleDateString()}</span>
								</div>
							</div>
							<div class="flex items-center space-x-2">
								<Button
									variant="outline"
									size="sm"
									on:click={() => toggleServiceStatus(service.id)}
								>
									{service.status === 'active' ? 'Deactivate' : 'Activate'}
								</Button>
								<Button
									variant="outline"
									size="sm"
								>
									Edit
								</Button>
								<Button
									variant="outline"
									size="sm"
									on:click={() => deleteService(service.id)}
									class="text-red-600 hover:text-red-700"
								>
									Delete
								</Button>
							</div>
						</div>
					</Card>
				{/each}
			</div>
		{/if}
	</main>
</div>

<!-- Create Service Modal -->
{#if showCreateModal}
	<div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
		<div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
			<div class="mt-3">
				<h3 class="text-lg font-medium text-gray-900 mb-4">Create New Service</h3>
				<form class="space-y-4">
					<div>
						<label class="block text-sm font-medium text-gray-700 mb-1">Service Title</label>
						<input type="text" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
					</div>
					<div>
						<label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
						<textarea rows="3" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"></textarea>
					</div>
					<div>
						<label class="block text-sm font-medium text-gray-700 mb-1">Category</label>
						<select class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
							{#each categories.slice(1) as category}
								<option value={category}>{category}</option>
							{/each}
						</select>
					</div>
					<div>
						<label class="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
						<input type="number" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
					</div>
				</form>
				<div class="flex justify-end space-x-3 mt-6">
					<Button variant="outline" on:click={() => showCreateModal = false}>Cancel</Button>
					<Button variant="primary" on:click={() => showCreateModal = false}>Create Service</Button>
				</div>
			</div>
		</div>
	</div>
{/if}
