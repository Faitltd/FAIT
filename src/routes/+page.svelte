<script lang="ts">
	import { onMount } from 'svelte';

	let heroVisible = false;

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

		// Trigger hero animation immediately
		setTimeout(() => {
			heroVisible = true;
		}, 100);

		return () => observer.disconnect();
	});
</script>

<svelte:head>
	<title>FAIT - Professional Services Platform</title>
	<meta name="description" content="Connect with trusted professionals for all your service needs. From home repairs to business consulting, find the right expert for your project." />
</svelte:head>

<!-- Hero Section -->
<section class="section bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen flex items-center">
	<div class="container-xl">
		<div class="grid lg:grid-cols-2 gap-12 items-center">
			<div class="animate-on-scroll {heroVisible ? 'show-up' : ''}" style="animation-delay: 0.2s">
				<h1 class="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
					Find the Perfect
					<span class="text-blue-600">Professional</span>
					for Every Project
				</h1>
				<p class="text-xl text-gray-600 mb-8 leading-relaxed">
					Connect with trusted experts in your area. From home improvements to business services,
					we make it easy to find, hire, and work with the right professionals.
				</p>
				<div class="flex flex-col sm:flex-row gap-4">
					<a href="/services" class="btn btn-primary text-lg px-8 py-4 hover-scale">
						Find Services
					</a>
					<a href="/signup" class="btn btn-secondary text-lg px-8 py-4 hover-scale">
						Become a Pro
					</a>
				</div>
			</div>
			<div class="animate-on-scroll {heroVisible ? 'show-left' : ''}" style="animation-delay: 0.4s">
				<div class="relative">
					<div class="bg-white rounded-2xl shadow-2xl p-8 hover-lift">
						<div class="flex items-center space-x-4 mb-6">
							<div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
								<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
								</svg>
							</div>
							<div>
								<h3 class="font-semibold text-gray-900">Verified Professionals</h3>
								<p class="text-gray-600">Background checked & insured</p>
							</div>
						</div>
						<div class="flex items-center space-x-4 mb-6">
							<div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
								<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
								</svg>
							</div>
							<div>
								<h3 class="font-semibold text-gray-900">Fair Pricing</h3>
								<p class="text-gray-600">Transparent quotes & billing</p>
							</div>
						</div>
						<div class="flex items-center space-x-4">
							<div class="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
								<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
								</svg>
							</div>
							<div>
								<h3 class="font-semibold text-gray-900">Satisfaction Guaranteed</h3>
								<p class="text-gray-600">100% satisfaction promise</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</section>

<!-- Features Section -->
<section class="section bg-white">
	<div class="container-xl">
		<div class="text-center mb-16 animate-on-scroll">
			<h2 class="text-4xl font-bold text-gray-900 mb-4">How FAIT Works</h2>
			<p class="text-xl text-gray-600 max-w-3xl mx-auto">
				Getting the help you need has never been easier. Our platform connects you with
				qualified professionals in just a few simple steps.
			</p>
		</div>

		<div class="grid md:grid-cols-3 gap-8">
			<div class="text-center animate-on-scroll" style="animation-delay: 0.1s">
				<div class="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 hover-scale">
					<svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
					</svg>
				</div>
				<h3 class="text-2xl font-bold text-gray-900 mb-4">1. Search & Browse</h3>
				<p class="text-gray-600 leading-relaxed">
					Browse our extensive directory of verified professionals or search by service type,
					location, and availability to find the perfect match for your project.
				</p>
			</div>

			<div class="text-center animate-on-scroll" style="animation-delay: 0.2s">
				<div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 hover-scale">
					<svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
					</svg>
				</div>
				<h3 class="text-2xl font-bold text-gray-900 mb-4">2. Connect & Quote</h3>
				<p class="text-gray-600 leading-relaxed">
					Message professionals directly, discuss your project details, and receive
					personalized quotes. Compare options and choose the best fit for your needs.
				</p>
			</div>

			<div class="text-center animate-on-scroll" style="animation-delay: 0.3s">
				<div class="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6 hover-scale">
					<svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
				</div>
				<h3 class="text-2xl font-bold text-gray-900 mb-4">3. Book & Complete</h3>
				<p class="text-gray-600 leading-relaxed">
					Schedule your service, track progress, and make secure payments through our platform.
					Leave reviews to help others find great professionals.
				</p>
			</div>
		</div>
	</div>
</section>

<!-- Services Section -->
<section class="section bg-gray-50">
	<div class="container-xl">
		<div class="text-center mb-16 animate-on-scroll">
			<h2 class="text-4xl font-bold text-gray-900 mb-4">Popular Services</h2>
			<p class="text-xl text-gray-600 max-w-3xl mx-auto">
				From home improvements to professional services, find experts for any project.
			</p>
		</div>

		<div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
			<div class="card animate-on-scroll" style="animation-delay: 0.1s">
				<div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
					<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z" />
					</svg>
				</div>
				<h3 class="text-lg font-semibold text-gray-900 mb-2">Home Repair</h3>
				<p class="text-gray-600 text-sm">Plumbing, electrical, HVAC, and general maintenance</p>
			</div>

			<div class="card animate-on-scroll" style="animation-delay: 0.2s">
				<div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
					<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
					</svg>
				</div>
				<h3 class="text-lg font-semibold text-gray-900 mb-2">Cleaning</h3>
				<p class="text-gray-600 text-sm">House cleaning, office cleaning, and deep cleaning</p>
			</div>

			<div class="card animate-on-scroll" style="animation-delay: 0.3s">
				<div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
					<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
					</svg>
				</div>
				<h3 class="text-lg font-semibold text-gray-900 mb-2">Design</h3>
				<p class="text-gray-600 text-sm">Interior design, graphic design, and web design</p>
			</div>

			<div class="card animate-on-scroll" style="animation-delay: 0.4s">
				<div class="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
					<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
					</svg>
				</div>
				<h3 class="text-lg font-semibold text-gray-900 mb-2">Tutoring</h3>
				<p class="text-gray-600 text-sm">Academic tutoring, music lessons, and skill training</p>
			</div>
		</div>

		<div class="text-center mt-12 animate-on-scroll">
			<a href="/services" class="btn btn-primary text-lg px-8 py-4 hover-scale">
				View All Services
			</a>
		</div>
	</div>
</section>
