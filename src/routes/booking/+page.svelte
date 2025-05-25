<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { auth } from '$lib/stores/auth';
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import LoginSignupModal from '$lib/components/auth/LoginSignupModal.svelte';

	let selectedService = '';
	let isLoading = false;
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

	// Service options
	const services = [
		{ id: 'plumbing', name: 'Plumbing Services', price: '$85-125/hr + service call', description: 'Leak repairs, drain cleaning, fixture installation, pipe repairs, water heater service' },
		{ id: 'electrical', name: 'Electrical Services', price: '$75-125/hr + service call', description: 'Outlet installation, light fixtures, ceiling fans, electrical panel upgrades, troubleshooting' },
		{ id: 'cleaning', name: 'House Cleaning', price: '$80-150', description: 'Professional deep cleaning for your entire home including kitchens, bathrooms, bedrooms, and living areas' },
		{ id: 'handyman', name: 'Handyman Services', price: '$45-75/hr', description: 'General repairs, installations, maintenance, furniture assembly, minor electrical work' },
		{ id: 'gardening', name: 'Gardening & Landscaping', price: '$40-80/hr', description: 'Lawn care, landscaping, garden maintenance, seasonal cleanup, plant care' },
		{ id: 'moving', name: 'Moving Services', price: '$100+/hr', description: 'Professional moving services, packing, loading, transportation, and unpacking' }
	];

	onMount(() => {
		// Check if a service was pre-selected from URL params
		const serviceParam = $page.url.searchParams.get('service');
		if (serviceParam) {
			selectedService = serviceParam;
		}
	});

	function validateForm() {
		formErrors = {};

		if (!selectedService) {
			formErrors.service = 'Please select a service';
		}

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

	$: selectedServiceInfo = services.find(s => s.id === selectedService);
</script>

<svelte:head>
	<title>Book a Service - FAIT</title>
	<meta name="description" content="Book professional services with FAIT's trusted professionals." />
</svelte:head>

<section class="bg-gray-50 py-8">
	<div class="container mx-auto px-6 sm:px-8 lg:px-4">
		<div class="max-w-4xl mx-auto">
			<!-- Header -->
			<div class="text-center mb-8">
				<h1 class="text-4xl font-bold text-gray-900 mb-4">Book a Service</h1>
				<p class="text-xl text-gray-600">Connect with trusted professionals for your home and business needs</p>
			</div>

			<div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
				<!-- Service Selection & Details -->
				<Card variant="elevated" padding="lg">
					<h2 class="text-2xl font-bold text-gray-900 mb-6">Select Your Service</h2>

					<!-- Service Selection -->
					<div class="mb-6">
						<label for="service" class="block text-sm font-medium text-gray-700 mb-2">
							Service Type
						</label>
						<select
							id="service"
							bind:value={selectedService}
							class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							class:border-red-500={formErrors.service}
						>
							<option value="">Choose a service...</option>
							{#each services as service}
								<option value={service.id}>{service.name}</option>
							{/each}
						</select>
						{#if formErrors.service}
							<p class="text-red-600 text-sm mt-1">{formErrors.service}</p>
						{/if}
					</div>

					<!-- Selected Service Details -->
					{#if selectedServiceInfo}
						<div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
							<h3 class="font-semibold text-blue-900 mb-2">{selectedServiceInfo.name}</h3>
							<p class="text-blue-800 text-sm mb-2">{selectedServiceInfo.description}</p>
							<div class="text-lg font-bold text-blue-600">{selectedServiceInfo.price}</div>
						</div>
					{/if}

					<!-- Service Features -->
					<div class="space-y-3">
						<div class="flex items-center space-x-3">
							<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
								<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
							</svg>
							<span class="text-gray-700">Vetted & Insured Professionals</span>
						</div>
						<div class="flex items-center space-x-3">
							<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
								<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
							</svg>
							<span class="text-gray-700">Same-day & Next-day Availability</span>
						</div>
						<div class="flex items-center space-x-3">
							<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
								<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
							</svg>
							<span class="text-gray-700">Transparent Pricing</span>
						</div>
						<div class="flex items-center space-x-3">
							<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
								<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
							</svg>
							<span class="text-gray-700">24/7 Customer Support</span>
						</div>
					</div>
				</Card>

				<!-- Booking Form -->
				<Card variant="elevated" padding="lg">
					<h2 class="text-2xl font-bold text-gray-900 mb-6">Booking Details</h2>

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
	</div>
</section>

<!-- Login/Signup Modal -->
<LoginSignupModal
	isOpen={showLoginModal}
	on:success={handleLoginSuccess}
	on:close={handleLoginClose}
/>
