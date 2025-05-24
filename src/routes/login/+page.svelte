<script lang="ts">
	import { onMount } from 'svelte';

	let formData = {
		email: '',
		password: '',
		rememberMe: false
	};

	let isSubmitting = false;
	let errorMessage = '';
	let showPassword = false;

	async function handleSubmit() {
		isSubmitting = true;
		errorMessage = '';

		// Basic validation
		if (!formData.email || !formData.password) {
			errorMessage = 'Please fill in all required fields.';
			isSubmitting = false;
			return;
		}

		// Simulate login process
		await new Promise(resolve => setTimeout(resolve, 2000));

		// For demo purposes, show success message
		// In a real app, this would redirect to dashboard
		alert('Login successful! (This is a demo)');
		isSubmitting = false;
	}

	function handleSocialLogin(provider: string) {
		alert(`${provider} login would be implemented here`);
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
	<title>Login - FAIT Professional Services Platform</title>
	<meta name="description" content="Login to your FAIT account to access your dashboard, manage bookings, and connect with professionals." />
</svelte:head>

<section class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
	<div class="max-w-md w-full space-y-8 animate-on-scroll">
		<!-- Header -->
		<div class="text-center">
			<a href="/" class="flex items-center justify-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors mb-8">
				<svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
					<polyline points="9 22 9 12 15 12 15 22"></polyline>
				</svg>
				<span class="font-sans text-2xl font-bold">FAIT</span>
			</a>
			<h2 class="text-3xl font-bold text-gray-900">Welcome back</h2>
			<p class="mt-2 text-gray-600">Sign in to your account to continue</p>
		</div>

		<!-- Login Form -->
		<div class="bg-white rounded-2xl shadow-xl p-8">
			{#if errorMessage}
				<div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
					{errorMessage}
				</div>
			{/if}

			<form on:submit|preventDefault={handleSubmit} class="space-y-6">
				<div>
					<label for="email" class="block text-sm font-medium text-gray-700 mb-2">
						Email address *
					</label>
					<input
						type="email"
						id="email"
						bind:value={formData.email}
						required
						class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
						placeholder="Enter your email"
					/>
				</div>

				<div>
					<label for="password" class="block text-sm font-medium text-gray-700 mb-2">
						Password *
					</label>
					<div class="relative">
						<input
							type={showPassword ? 'text' : 'password'}
							id="password"
							bind:value={formData.password}
							required
							class="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
							placeholder="Enter your password"
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

				<div class="flex items-center justify-between">
					<div class="flex items-center">
						<input
							id="remember-me"
							type="checkbox"
							bind:checked={formData.rememberMe}
							class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
						/>
						<label for="remember-me" class="ml-2 block text-sm text-gray-700">
							Remember me
						</label>
					</div>

					<div class="text-sm">
						<a href="/forgot-password" class="text-blue-600 hover:text-blue-500 transition-colors">
							Forgot your password?
						</a>
					</div>
				</div>

				<button
					type="submit"
					disabled={isSubmitting}
					class="w-full bg-blue-600 text-white text-lg py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-semibold transform hover:scale-105 {isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}"
				>
					{isSubmitting ? 'Signing in...' : 'Sign in'}
				</button>
			</form>

			<!-- Divider -->
			<div class="mt-6">
				<div class="relative">
					<div class="absolute inset-0 flex items-center">
						<div class="w-full border-t border-gray-300"></div>
					</div>
					<div class="relative flex justify-center text-sm">
						<span class="px-2 bg-white text-gray-500">Or continue with</span>
					</div>
				</div>
			</div>

			<!-- Social Login -->
			<div class="mt-6 grid grid-cols-2 gap-3">
				<button
					type="button"
					on:click={() => handleSocialLogin('Google')}
					class="w-full inline-flex justify-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition-all transform hover:scale-105"
				>
					<svg class="w-5 h-5" viewBox="0 0 24 24">
						<path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
						<path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
						<path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
						<path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
					</svg>
					<span class="ml-2">Google</span>
				</button>

				<button
					type="button"
					on:click={() => handleSocialLogin('Apple')}
					class="w-full inline-flex justify-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition-all transform hover:scale-105"
				>
					<svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
						<path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
					</svg>
					<span class="ml-2">Apple</span>
				</button>
			</div>

			<!-- Sign up link -->
			<div class="mt-6 text-center">
				<p class="text-sm text-gray-600">
					Don't have an account?
					<a href="/signup" class="text-blue-600 hover:text-blue-500 font-medium transition-colors">
						Sign up for free
					</a>
				</p>
			</div>
		</div>

		<!-- Professional Login -->
		<div class="text-center">
			<p class="text-sm text-gray-600">
				Are you a professional?
				<a href="/professional-login" class="text-blue-600 hover:text-blue-500 font-medium transition-colors">
					Professional Login
				</a>
			</p>
		</div>
	</div>
</section>
