<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { authActions } from '$lib/stores/auth';
	import Modal from '$lib/components/ui/Modal.svelte';
	import Button from '$lib/components/ui/Button.svelte';

	export let isOpen = false;
	export let initialMode: 'login' | 'signup' = 'login';

	const dispatch = createEventDispatcher();

	let mode = initialMode;
	let isSubmitting = false;
	let error = '';
	let successMessage = '';

	// Form data
	let email = '';
	let password = '';
	let confirmPassword = '';
	let name = '';
	let role: 'client' | 'provider' = 'client';

	// Reset form when modal opens/closes
	$: if (isOpen) {
		resetForm();
	}

	function resetForm() {
		email = '';
		password = '';
		confirmPassword = '';
		name = '';
		role = 'client';
		error = '';
		successMessage = '';
		isSubmitting = false;
	}

	function switchMode() {
		mode = mode === 'login' ? 'signup' : 'login';
		error = '';
		successMessage = '';
	}

	function validateForm() {
		if (!email || !password) {
			error = 'Please fill in all required fields';
			return false;
		}

		if (mode === 'signup') {
			if (!name) {
				error = 'Name is required';
				return false;
			}
			if (password !== confirmPassword) {
				error = 'Passwords do not match';
				return false;
			}
			if (password.length < 6) {
				error = 'Password must be at least 6 characters';
				return false;
			}
		}

		return true;
	}

	async function handleSubmit() {
		if (!validateForm()) return;

		isSubmitting = true;
		error = '';
		successMessage = '';

		try {
			if (mode === 'login') {
				const result = await authActions.login(email, password);
				if (result.success) {
					successMessage = 'Login successful!';
					setTimeout(() => {
						dispatch('success');
						close();
					}, 1000);
				} else {
					error = result.error || 'Login failed';
				}
			} else {
				// Signup logic - for now, simulate signup
				await new Promise(resolve => setTimeout(resolve, 1000));
				
				// After successful signup, log them in
				const result = await authActions.login(email, password);
				if (result.success) {
					successMessage = 'Account created successfully!';
					setTimeout(() => {
						dispatch('success');
						close();
					}, 1000);
				} else {
					error = 'Account created but login failed';
				}
			}
		} catch (err) {
			error = 'An unexpected error occurred';
		} finally {
			isSubmitting = false;
		}
	}

	function close() {
		dispatch('close');
	}
</script>

<Modal {isOpen} title={mode === 'login' ? 'Sign In' : 'Create Account'} size="md" on:close={close}>
	<form on:submit|preventDefault={handleSubmit} class="space-y-6">
		{#if error}
			<div class="bg-red-50 border border-red-200 rounded-lg p-4">
				<p class="text-red-700 text-sm">{error}</p>
			</div>
		{/if}

		{#if successMessage}
			<div class="bg-green-50 border border-green-200 rounded-lg p-4">
				<p class="text-green-700 text-sm">{successMessage}</p>
			</div>
		{/if}

		{#if mode === 'signup'}
			<!-- Name Field -->
			<div>
				<label for="name" class="block text-sm font-medium text-gray-700 mb-2">
					Full Name
				</label>
				<input
					type="text"
					id="name"
					bind:value={name}
					placeholder="Enter your full name"
					class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
					required
				/>
			</div>

			<!-- Role Selection -->
			<div>
				<label class="block text-sm font-medium text-gray-700 mb-2">
					I want to:
				</label>
				<div class="flex space-x-4">
					<label class="flex items-center">
						<input
							type="radio"
							bind:group={role}
							value="client"
							class="mr-2"
						/>
						<span class="text-sm">Book services</span>
					</label>
					<label class="flex items-center">
						<input
							type="radio"
							bind:group={role}
							value="provider"
							class="mr-2"
						/>
						<span class="text-sm">Provide services</span>
					</label>
				</div>
			</div>
		{/if}

		<!-- Email Field -->
		<div>
			<label for="email" class="block text-sm font-medium text-gray-700 mb-2">
				Email Address
			</label>
			<input
				type="email"
				id="email"
				bind:value={email}
				placeholder="Enter your email"
				class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
				required
			/>
		</div>

		<!-- Password Field -->
		<div>
			<label for="password" class="block text-sm font-medium text-gray-700 mb-2">
				Password
			</label>
			<input
				type="password"
				id="password"
				bind:value={password}
				placeholder="Enter your password"
				class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
				required
			/>
		</div>

		{#if mode === 'signup'}
			<!-- Confirm Password Field -->
			<div>
				<label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-2">
					Confirm Password
				</label>
				<input
					type="password"
					id="confirmPassword"
					bind:value={confirmPassword}
					placeholder="Confirm your password"
					class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
					required
				/>
			</div>
		{/if}

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
				{mode === 'login' ? 'Signing In...' : 'Creating Account...'}
			{:else}
				{mode === 'login' ? 'Sign In' : 'Create Account'}
			{/if}
		</Button>

		<!-- Switch Mode -->
		<div class="text-center">
			<p class="text-sm text-gray-600">
				{mode === 'login' ? "Don't have an account?" : 'Already have an account?'}
				<button
					type="button"
					class="text-blue-600 hover:text-blue-700 font-medium"
					on:click={switchMode}
				>
					{mode === 'login' ? 'Sign up' : 'Sign in'}
				</button>
			</p>
		</div>

		{#if mode === 'login'}
			<!-- Forgot Password -->
			<div class="text-center">
				<button
					type="button"
					class="text-sm text-blue-600 hover:text-blue-700"
					on:click={() => {/* TODO: Implement forgot password */}}
				>
					Forgot your password?
				</button>
			</div>
		{/if}
	</form>
</Modal>
