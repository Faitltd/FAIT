<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { auth } from '$lib/stores/auth';
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import LoginSignupModal from '$lib/components/auth/LoginSignupModal.svelte';

	// Get service ID from URL
	const serviceId = $page.params.serviceId;

	let service: any = null;
	let isLoading = true;
	let error: string | null = null;
	let isSubmitting = false;
	let showLoginModal = false;

	// Form data
	let selectedDate = '';
	let selectedTime = '';
	let address = '';
	let zipCode = '';
	let notes = '';
	let formErrors: Record<string, string> = {};

	// Available time slots
	const timeSlots = [
		'08:00', '09:00', '10:00', '11:00', '12:00',
		'13:00', '14:00', '15:00', '16:00', '17:00'
	];

	// Get today's date for min date validation
	const today = new Date().toISOString().split('T')[0];

	// Import services data from a shared location or define here
	// For now, we'll use a subset of services - in a real app this would come from an API
	const services = [
		{
			id: 1,
			title: 'House Cleaning',
			category: 'cleaning',
			price: '$80-150',
			rating: 4.9,
			reviews: 234,
			image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=300&fit=crop',
			description: 'Professional deep cleaning for your entire home including kitchens, bathrooms, bedrooms, and living areas'
		},
		{
			id: 2,
			title: 'Office Cleaning',
			category: 'cleaning',
			price: '$100-200',
			rating: 4.8,
			reviews: 156,
			image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop',
			description: 'Commercial office cleaning services including desks, floors, restrooms, and common areas'
		},
		{
			id: 3,
			title: 'Hang Pictures/Artwork',
			category: 'repair',
			price: '$75',
			rating: 4.8,
			reviews: 189,
			image: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=300&fit=crop',
			description: 'Professional picture and artwork hanging service for up to 5 items. Includes proper wall anchors and leveling'
		},
		{
			id: 4,
			title: 'TV Wall Mounting',
			category: 'repair',
			price: '$150',
			rating: 4.9,
			reviews: 267,
			image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400&h=300&fit=crop',
			description: 'Safe and secure TV wall mounting with cable management. Includes mounting bracket and all hardware'
		},
		{
			id: 5,
			title: 'Shelf Installation',
			category: 'repair',
			price: '$100',
			rating: 4.7,
			reviews: 145,
			image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop',
			description: 'Custom shelf installation and mounting. Perfect for books, decor, or storage solutions'
		},
		{
			id: 6,
			title: 'Leaky Faucet Repair',
			category: 'repair',
			price: '$125',
			rating: 4.8,
			reviews: 198,
			image: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=400&h=300&fit=crop',
			description: 'Professional faucet repair service. Fix drips, replace washers, and restore proper water flow'
		},
		{
			id: 7,
			title: 'Light Fixture Installation',
			category: 'repair',
			price: '$175',
			rating: 4.8,
			reviews: 134,
			image: 'https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?w=400&h=300&fit=crop',
			description: 'Electrical light fixture installation including ceiling lights, chandeliers, and pendant lights'
		},
		{
			id: 8,
			title: 'Ceiling Fan Installation',
			category: 'repair',
			price: '$200',
			rating: 4.9,
			reviews: 167,
			image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
			description: 'Professional ceiling fan installation with proper electrical connections and balancing'
		}
	];

	onMount(() => {
		// Find the service by ID
		const foundService = services.find(s => s.id === parseInt(serviceId));
		if (foundService) {
			service = foundService;
		} else {
			error = 'Service not found';
		}
		isLoading = false;
	});

	function validateForm() {
		formErrors = {};

		if (!selectedDate) {
			formErrors.date = 'Date is required';
		}

		if (!selectedTime) {
			formErrors.time = 'Time is required';
		}

		if (!address.trim()) {
			formErrors.address = 'Address is required';
		}

		if (!zipCode.trim()) {
			formErrors.zipCode = 'ZIP code is required';
		}

		return Object.keys(formErrors).length === 0;
	}

	async function handleSubmit() {
		// Check if user is authenticated first
		if (!$auth.isAuthenticated) {
			showLoginModal = true;
			return;
		}

		if (!validateForm()) {
			return;
		}

		isSubmitting = true;
		error = null;

		try {
			// Mock booking submission - in real app this would call an API
			await new Promise(resolve => setTimeout(resolve, 1000));

			// Navigate to bookings page with success message
			goto('/bookings?success=true');
		} catch (err) {
			error = 'Failed to create booking. Please try again.';
		} finally {
			isSubmitting = false;
		}
	}

	function handleLoginSuccess() {
		showLoginModal = false;
		// After successful login, automatically submit the form if it's valid
		if (validateForm()) {
			handleSubmit();
		}
	}

	function handleLoginClose() {
		showLoginModal = false;
	}

	function formatTime(timeString: string) {
		const [hours, minutes] = timeString.split(':');
		const hour = parseInt(hours, 10);
		const ampm = hour >= 12 ? 'PM' : 'AM';
		const hour12 = hour % 12 || 12;
		return `${hour12}:${minutes} ${ampm}`;
	}
</script>

<svelte:head>
	<title>Book {service?.title || 'Service'} - FAIT</title>
	<meta name="description" content="Book {service?.title || 'service'} with FAIT's trusted professionals." />
</svelte:head>

<section class="bg-gray-50 py-8">
	<div class="container mx-auto px-6 sm:px-8 lg:px-4">
		{#if isLoading}
			<div class="text-center py-12">
				<div class="text-4xl mb-4">⏳</div>
				<p class="text-gray-600">Loading service details...</p>
			</div>
		{:else if error && !service}
			<div class="text-center py-12">
				<div class="text-6xl mb-4">❌</div>
				<h2 class="text-2xl font-bold text-gray-900 mb-2">Service Not Found</h2>
				<p class="text-gray-600 mb-6">{error}</p>
				<Button href="/services" variant="primary">Browse Services</Button>
			</div>
		{:else if service}
			<div class="max-w-4xl mx-auto">
				<!-- Back Button -->
				<Button href="/services" variant="outline" class="mb-6">
					<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
						<path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
					</svg>
					Back to Services
				</Button>

				<div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
					<!-- Service Details -->
					<Card variant="elevated" padding="lg">
						<img
							src={service.image}
							alt={service.title}
							class="w-full h-64 object-cover rounded-lg mb-6"
						/>
						<h1 class="text-3xl font-bold text-gray-900 mb-4">{service.title}</h1>
						<p class="text-gray-600 mb-6">{service.description}</p>

						<div class="flex items-center justify-between mb-4">
							<div class="flex items-center space-x-1">
								<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
									<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
								</svg>
								<span class="font-medium text-gray-900">{service.rating}</span>
								<span class="text-gray-500">({service.reviews} reviews)</span>
							</div>
							<div class="text-2xl font-bold text-blue-600">{service.price}</div>
						</div>
					</Card>

					<!-- Booking Form -->
					<Card variant="elevated" padding="lg">
						<h2 class="text-2xl font-bold text-gray-900 mb-6">Book This Service</h2>

						{#if error}
							<div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
								<p class="text-red-700">{error}</p>
							</div>
						{/if}

						<form on:submit|preventDefault={handleSubmit} class="space-y-6">
							<!-- Date Selection -->
							<div>
								<label for="date" class="block text-sm font-medium text-gray-700 mb-2">
									Preferred Date
								</label>
								<input
									type="date"
									id="date"
									bind:value={selectedDate}
									min={today}
									class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
									class:border-red-500={formErrors.date}
								/>
								{#if formErrors.date}
									<p class="text-red-600 text-sm mt-1">{formErrors.date}</p>
								{/if}
							</div>

							<!-- Time Selection -->
							<div>
								<label for="time" class="block text-sm font-medium text-gray-700 mb-2">
									Preferred Time
								</label>
								<select
									id="time"
									bind:value={selectedTime}
									class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
									class:border-red-500={formErrors.time}
								>
									<option value="">Select a time</option>
									{#each timeSlots as timeSlot}
										<option value={timeSlot}>{formatTime(timeSlot)}</option>
									{/each}
								</select>
								{#if formErrors.time}
									<p class="text-red-600 text-sm mt-1">{formErrors.time}</p>
								{/if}
							</div>

							<!-- Address -->
							<div>
								<label for="address" class="block text-sm font-medium text-gray-700 mb-2">
									Service Address
								</label>
								<input
									type="text"
									id="address"
									bind:value={address}
									placeholder="Enter the service location"
									class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
									class:border-red-500={formErrors.address}
								/>
								{#if formErrors.address}
									<p class="text-red-600 text-sm mt-1">{formErrors.address}</p>
								{/if}
							</div>

							<!-- ZIP Code -->
							<div>
								<label for="zipCode" class="block text-sm font-medium text-gray-700 mb-2">
									ZIP Code
								</label>
								<input
									type="text"
									id="zipCode"
									bind:value={zipCode}
									placeholder="Enter ZIP code"
									class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
									class:border-red-500={formErrors.zipCode}
								/>
								{#if formErrors.zipCode}
									<p class="text-red-600 text-sm mt-1">{formErrors.zipCode}</p>
								{/if}
							</div>

							<!-- Notes -->
							<div>
								<label for="notes" class="block text-sm font-medium text-gray-700 mb-2">
									Additional Notes (Optional)
								</label>
								<textarea
									id="notes"
									bind:value={notes}
									rows="3"
									placeholder="Any special instructions or requirements..."
									class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
								></textarea>
							</div>

							<!-- Submit Button -->
							<Button
								type="submit"
								variant="primary"
								class="w-full"
								disabled={isSubmitting}
							>
								{#if isSubmitting}
									<svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
										<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
										<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
									</svg>
									Booking...
								{:else}
									Book Now
								{/if}
							</Button>
						</form>
					</Card>
				</div>
			</div>
		{/if}
	</div>
</section>

<!-- Login/Signup Modal -->
<LoginSignupModal
	isOpen={showLoginModal}
	on:success={handleLoginSuccess}
	on:close={handleLoginClose}
/>
