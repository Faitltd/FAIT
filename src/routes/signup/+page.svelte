<script lang="ts">
	import { onMount } from 'svelte';

	let currentStep = 1;
	let accountType = 'customer'; // 'customer' or 'professional'
	
	let formData = {
		// Basic Info
		firstName: '',
		lastName: '',
		email: '',
		password: '',
		confirmPassword: '',
		phone: '',
		
		// Location
		address: '',
		city: '',
		state: '',
		zipCode: '',
		
		// Professional Info (if applicable)
		businessName: '',
		services: [],
		experience: '',
		license: '',
		insurance: false,
		
		// Terms
		agreeToTerms: false,
		agreeToMarketing: false
	};

	let isSubmitting = false;
	let errorMessage = '';
	let showPassword = false;
	let showConfirmPassword = false;

	const serviceOptions = [
		'House Cleaning', 'Plumbing', 'Electrical', 'HVAC', 'Landscaping',
		'Interior Design', 'Web Design', 'Tutoring', 'Personal Training',
		'Event Planning', 'Photography', 'Handyman Services'
	];

	function nextStep() {
		if (validateCurrentStep()) {
			currentStep++;
		}
	}

	function prevStep() {
		currentStep--;
	}

	function validateCurrentStep() {
		errorMessage = '';
		
		if (currentStep === 1) {
			if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
				errorMessage = 'Please fill in all required fields.';
				return false;
			}
			if (formData.password !== formData.confirmPassword) {
				errorMessage = 'Passwords do not match.';
				return false;
			}
			if (formData.password.length < 8) {
				errorMessage = 'Password must be at least 8 characters long.';
				return false;
			}
		}
		
		if (currentStep === 2) {
			if (!formData.phone || !formData.address || !formData.city || !formData.state || !formData.zipCode) {
				errorMessage = 'Please fill in all required fields.';
				return false;
			}
		}
		
		if (currentStep === 3 && accountType === 'professional') {
			if (!formData.businessName || formData.services.length === 0) {
				errorMessage = 'Please fill in all required fields.';
				return false;
			}
		}
		
		return true;
	}

	async function handleSubmit() {
		if (!formData.agreeToTerms) {
			errorMessage = 'Please agree to the Terms of Service.';
			return;
		}
		
		isSubmitting = true;
		
		// Simulate registration process
		await new Promise(resolve => setTimeout(resolve, 2000));
		
		// For demo purposes, show success message
		alert('Registration successful! Welcome to FAIT!');
		isSubmitting = false;
	}

	function toggleService(service: string) {
		if (formData.services.includes(service)) {
			formData.services = formData.services.filter(s => s !== service);
		} else {
			formData.services = [...formData.services, service];
		}
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
</script>

<svelte:head>
	<title>Sign Up - FAIT Professional Services Platform</title>
	<meta name="description" content="Join FAIT today! Sign up as a customer to find trusted professionals or as a professional to grow your business." />
</svelte:head>

<section class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
	<div class="max-w-2xl mx-auto">
		<!-- Header -->
		<div class="text-center mb-8 animate-on-scroll">
			<a href="/" class="flex items-center justify-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors mb-8">
				<svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
					<polyline points="9 22 9 12 15 12 15 22"></polyline>
				</svg>
				<span class="font-sans text-2xl font-bold">FAIT</span>
			</a>
			<h1 class="text-4xl font-bold text-gray-900 mb-4">Join FAIT Today</h1>
			<p class="text-xl text-gray-600">Create your account and start connecting with professionals</p>
		</div>

		<!-- Account Type Selection -->
		{#if currentStep === 1}
			<div class="bg-white rounded-2xl shadow-xl p-8 animate-on-scroll">
				<div class="mb-8">
					<h2 class="text-2xl font-bold text-gray-900 mb-4">Choose Your Account Type</h2>
					<div class="grid md:grid-cols-2 gap-6">
						<button
							class="p-6 border-2 rounded-xl transition-all hover-scale {accountType === 'customer' ? 'border-blue-600 bg-blue-50' : 'border-gray-300 hover:border-blue-600'}"
							on:click={() => accountType = 'customer'}
						>
							<div class="text-4xl mb-4">👤</div>
							<h3 class="text-xl font-bold text-gray-900 mb-2">I'm a Customer</h3>
							<p class="text-gray-600">I need to hire professionals for services</p>
						</button>
						
						<button
							class="p-6 border-2 rounded-xl transition-all hover-scale {accountType === 'professional' ? 'border-blue-600 bg-blue-50' : 'border-gray-300 hover:border-blue-600'}"
							on:click={() => accountType = 'professional'}
						>
							<div class="text-4xl mb-4">🔧</div>
							<h3 class="text-xl font-bold text-gray-900 mb-2">I'm a Professional</h3>
							<p class="text-gray-600">I want to offer my services to customers</p>
						</button>
					</div>
				</div>

				{#if errorMessage}
					<div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
						{errorMessage}
					</div>
				{/if}

				<!-- Basic Information -->
				<div class="space-y-6">
					<h3 class="text-xl font-bold text-gray-900">Basic Information</h3>
					
					<div class="grid md:grid-cols-2 gap-6">
						<div>
							<label for="firstName" class="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
							<input
								type="text"
								id="firstName"
								bind:value={formData.firstName}
								required
								class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								placeholder="John"
							/>
						</div>
						<div>
							<label for="lastName" class="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
							<input
								type="text"
								id="lastName"
								bind:value={formData.lastName}
								required
								class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								placeholder="Doe"
							/>
						</div>
					</div>

					<div>
						<label for="email" class="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
						<input
							type="email"
							id="email"
							bind:value={formData.email}
							required
							class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
							placeholder="john@example.com"
						/>
					</div>

					<div class="grid md:grid-cols-2 gap-6">
						<div>
							<label for="password" class="block text-sm font-medium text-gray-700 mb-2">Password *</label>
							<div class="relative">
								<input
									type={showPassword ? 'text' : 'password'}
									id="password"
									bind:value={formData.password}
									required
									class="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
									placeholder="Min. 8 characters"
								/>
								<button
									type="button"
									class="absolute inset-y-0 right-0 pr-3 flex items-center"
									on:click={() => showPassword = !showPassword}
								>
									{#if showPassword}
										<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
										</svg>
									{:else}
										<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
										</svg>
									{/if}
								</button>
							</div>
						</div>
						<div>
							<label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-2">Confirm Password *</label>
							<div class="relative">
								<input
									type={showConfirmPassword ? 'text' : 'password'}
									id="confirmPassword"
									bind:value={formData.confirmPassword}
									required
									class="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
									placeholder="Confirm password"
								/>
								<button
									type="button"
									class="absolute inset-y-0 right-0 pr-3 flex items-center"
									on:click={() => showConfirmPassword = !showConfirmPassword}
								>
									{#if showConfirmPassword}
										<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
										</svg>
									{:else}
										<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
										</svg>
									{/if}
								</button>
							</div>
						</div>
					</div>
				</div>

				<div class="flex justify-end mt-8">
					<button
						type="button"
						on:click={nextStep}
						class="btn btn-primary text-lg px-8 py-3 hover-scale"
					>
						Continue
					</button>
				</div>
			</div>
		{/if}

		<!-- Step 2: Contact & Location -->
		{#if currentStep === 2}
			<div class="bg-white rounded-2xl shadow-xl p-8 animate-on-scroll">
				<div class="mb-8">
					<h2 class="text-2xl font-bold text-gray-900 mb-2">Contact & Location</h2>
					<p class="text-gray-600">Help us connect you with professionals in your area</p>
				</div>

				{#if errorMessage}
					<div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
						{errorMessage}
					</div>
				{/if}

				<div class="space-y-6">
					<div>
						<label for="phone" class="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
						<input
							type="tel"
							id="phone"
							bind:value={formData.phone}
							required
							class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
							placeholder="(555) 123-4567"
						/>
					</div>

					<div>
						<label for="address" class="block text-sm font-medium text-gray-700 mb-2">Street Address *</label>
						<input
							type="text"
							id="address"
							bind:value={formData.address}
							required
							class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
							placeholder="123 Main Street"
						/>
					</div>

					<div class="grid md:grid-cols-3 gap-6">
						<div>
							<label for="city" class="block text-sm font-medium text-gray-700 mb-2">City *</label>
							<input
								type="text"
								id="city"
								bind:value={formData.city}
								required
								class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								placeholder="New York"
							/>
						</div>
						<div>
							<label for="state" class="block text-sm font-medium text-gray-700 mb-2">State *</label>
							<input
								type="text"
								id="state"
								bind:value={formData.state}
								required
								class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								placeholder="NY"
							/>
						</div>
						<div>
							<label for="zipCode" class="block text-sm font-medium text-gray-700 mb-2">ZIP Code *</label>
							<input
								type="text"
								id="zipCode"
								bind:value={formData.zipCode}
								required
								class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								placeholder="10001"
							/>
						</div>
					</div>
				</div>

				<div class="flex justify-between mt-8">
					<button
						type="button"
						on:click={prevStep}
						class="btn btn-secondary text-lg px-8 py-3 hover-scale"
					>
						Back
					</button>
					<button
						type="button"
						on:click={nextStep}
						class="btn btn-primary text-lg px-8 py-3 hover-scale"
					>
						Continue
					</button>
				</div>
			</div>
		{/if}

		<!-- Step 3: Professional Info (if professional) -->
		{#if currentStep === 3 && accountType === 'professional'}
			<div class="bg-white rounded-2xl shadow-xl p-8 animate-on-scroll">
				<div class="mb-8">
					<h2 class="text-2xl font-bold text-gray-900 mb-2">Professional Information</h2>
					<p class="text-gray-600">Tell us about your business and services</p>
				</div>

				{#if errorMessage}
					<div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
						{errorMessage}
					</div>
				{/if}

				<div class="space-y-6">
					<div>
						<label for="businessName" class="block text-sm font-medium text-gray-700 mb-2">Business Name *</label>
						<input
							type="text"
							id="businessName"
							bind:value={formData.businessName}
							required
							class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
							placeholder="Your Business Name"
						/>
					</div>

					<div>
						<label class="block text-sm font-medium text-gray-700 mb-2">Services Offered * (Select all that apply)</label>
						<div class="grid md:grid-cols-3 gap-3">
							{#each serviceOptions as service}
								<label class="flex items-center space-x-2 cursor-pointer">
									<input
										type="checkbox"
										checked={formData.services.includes(service)}
										on:change={() => toggleService(service)}
										class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
									/>
									<span class="text-sm text-gray-700">{service}</span>
								</label>
							{/each}
						</div>
					</div>

					<div>
						<label for="experience" class="block text-sm font-medium text-gray-700 mb-2">Years of Experience</label>
						<select
							id="experience"
							bind:value={formData.experience}
							class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
						>
							<option value="">Select experience level</option>
							<option value="0-1">0-1 years</option>
							<option value="2-5">2-5 years</option>
							<option value="6-10">6-10 years</option>
							<option value="11-15">11-15 years</option>
							<option value="16+">16+ years</option>
						</select>
					</div>

					<div>
						<label for="license" class="block text-sm font-medium text-gray-700 mb-2">License Number (if applicable)</label>
						<input
							type="text"
							id="license"
							bind:value={formData.license}
							class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
							placeholder="Professional license number"
						/>
					</div>

					<div class="flex items-center">
						<input
							id="insurance"
							type="checkbox"
							bind:checked={formData.insurance}
							class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
						/>
						<label for="insurance" class="ml-2 block text-sm text-gray-700">
							I have professional liability insurance
						</label>
					</div>
				</div>

				<div class="flex justify-between mt-8">
					<button
						type="button"
						on:click={prevStep}
						class="btn btn-secondary text-lg px-8 py-3 hover-scale"
					>
						Back
					</button>
					<button
						type="button"
						on:click={nextStep}
						class="btn btn-primary text-lg px-8 py-3 hover-scale"
					>
						Continue
					</button>
				</div>
			</div>
		{/if}

		<!-- Final Step: Terms & Submit -->
		{#if (currentStep === 3 && accountType === 'customer') || (currentStep === 4 && accountType === 'professional')}
			<div class="bg-white rounded-2xl shadow-xl p-8 animate-on-scroll">
				<div class="mb-8">
					<h2 class="text-2xl font-bold text-gray-900 mb-2">Almost Done!</h2>
					<p class="text-gray-600">Review and agree to our terms to complete your registration</p>
				</div>

				{#if errorMessage}
					<div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
						{errorMessage}
					</div>
				{/if}

				<div class="space-y-6">
					<div class="flex items-start">
						<input
							id="agreeToTerms"
							type="checkbox"
							bind:checked={formData.agreeToTerms}
							required
							class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
						/>
						<label for="agreeToTerms" class="ml-2 block text-sm text-gray-700">
							I agree to the <a href="/terms" class="text-blue-600 hover:text-blue-500">Terms of Service</a> 
							and <a href="/privacy" class="text-blue-600 hover:text-blue-500">Privacy Policy</a> *
						</label>
					</div>

					<div class="flex items-start">
						<input
							id="agreeToMarketing"
							type="checkbox"
							bind:checked={formData.agreeToMarketing}
							class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
						/>
						<label for="agreeToMarketing" class="ml-2 block text-sm text-gray-700">
							I would like to receive marketing emails and updates about FAIT services
						</label>
					</div>
				</div>

				<div class="flex justify-between mt-8">
					<button
						type="button"
						on:click={prevStep}
						class="btn btn-secondary text-lg px-8 py-3 hover-scale"
					>
						Back
					</button>
					<button
						type="button"
						on:click={handleSubmit}
						disabled={isSubmitting}
						class="btn btn-primary text-lg px-8 py-3 hover-scale {isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}"
					>
						{isSubmitting ? 'Creating Account...' : 'Create Account'}
					</button>
				</div>
			</div>
		{/if}

		<!-- Login link -->
		<div class="text-center mt-8">
			<p class="text-sm text-gray-600">
				Already have an account?
				<a href="/login" class="text-blue-600 hover:text-blue-500 font-medium transition-colors">
					Sign in here
				</a>
			</p>
		</div>
	</div>
</section>
