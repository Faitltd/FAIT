<script lang="ts">
	import { onMount } from 'svelte';

	const stats = [
		{ number: '50K+', label: 'Active Professionals' },
		{ number: '200K+', label: 'Completed Projects' },
		{ number: '4.9/5', label: 'Average Rating' },
		{ number: '24/7', label: 'Customer Support' }
	];

	const founders = [
		{
			name: 'Ray Kinne',
			role: 'Co-Founder',
			image: '/Ray.jpeg',
			bio: 'Visionary leader passionate about connecting communities with trusted service providers.'
		},
		{
			name: 'Kelli Trainer',
			role: 'Co-Founder',
			image: '/Kelli.jpeg',
			bio: 'Strategic innovator focused on building meaningful relationships between customers and professionals.'
		}
	];

	const values = [
		{
			title: 'Trust & Safety',
			description: 'Every professional is thoroughly vetted, background-checked, and insured for your peace of mind.',
			icon: '🛡️'
		},
		{
			title: 'Quality First',
			description: 'We maintain high standards through continuous monitoring, reviews, and professional development.',
			icon: '⭐'
		},
		{
			title: 'Fair Pricing',
			description: 'Transparent pricing with no hidden fees. Get competitive quotes from multiple professionals.',
			icon: '💰'
		},
		{
			title: 'Customer Success',
			description: 'Your satisfaction is our priority. We provide support throughout your entire project journey.',
			icon: '🎯'
		}
	];

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
	<title>About Us - FAIT Professional Services Platform</title>
	<meta name="description" content="Learn about FAIT's mission to connect customers with trusted professionals. Discover our story, values, and commitment to quality service." />
</svelte:head>

<!-- Hero Section -->
<section class="py-20 bg-gradient-to-br from-blue-50 to-indigo-100 pt-32">
	<div class="container mx-auto px-8 sm:px-12 lg:px-6">
		<div class="grid lg:grid-cols-2 gap-12 items-center">
			<div class="animate-on-scroll">
				<h1 class="text-5xl font-bold text-gray-900 mb-6">About FAIT</h1>
				<p class="text-xl text-gray-600 mb-8 leading-relaxed">
					We're on a mission to make finding and hiring trusted professionals as easy as possible.
					FAIT connects homeowners and businesses with verified experts who deliver exceptional results.
				</p>
				<div class="flex flex-col sm:flex-row gap-4">
					<a href="/services" class="bg-blue-600 text-white text-lg px-8 py-4 rounded-lg hover:bg-blue-700 transition-colors font-semibold transform hover:scale-105">
						Browse Services
					</a>
					<a href="/contact" class="border-2 border-blue-600 text-blue-600 text-lg px-8 py-4 rounded-lg hover:bg-blue-50 transition-colors font-semibold transform hover:scale-105">
						Contact Us
					</a>
				</div>
			</div>
			<div class="animate-on-scroll" style="animation-delay: 0.2s">
				<div class="bg-white rounded-2xl shadow-2xl p-8 hover-lift">
					<h3 class="text-2xl font-bold text-gray-900 mb-6">Our Mission</h3>
					<p class="text-gray-600 leading-relaxed mb-6">
						To create a world where finding the right professional for any job is simple,
						transparent, and reliable. We believe everyone deserves access to quality services
						at fair prices.
					</p>
					<div class="flex items-center space-x-4">
						<div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
							<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
							</svg>
						</div>
						<div>
							<h4 class="font-semibold text-gray-900">Built with Care</h4>
							<p class="text-gray-600">Every feature designed with you in mind</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</section>

<!-- Stats Section -->
<section class="section bg-white">
	<div class="container-xl">
		<div class="grid md:grid-cols-4 gap-8">
			{#each stats as stat, index}
				<div class="text-center animate-on-scroll" style="animation-delay: {index * 0.1}s">
					<div class="text-4xl font-bold text-blue-600 mb-2">{stat.number}</div>
					<div class="text-gray-600 font-medium">{stat.label}</div>
				</div>
			{/each}
		</div>
	</div>
</section>

<!-- Values Section -->
<section class="section bg-gray-50">
	<div class="container-xl">
		<div class="text-center mb-16 animate-on-scroll">
			<h2 class="text-4xl font-bold text-gray-900 mb-4">Our Values</h2>
			<p class="text-xl text-gray-600 max-w-3xl mx-auto">
				These core principles guide everything we do and shape how we serve our community.
			</p>
		</div>

		<div class="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
			{#each values as value, index}
				<div class="card text-center animate-on-scroll" style="animation-delay: {index * 0.1}s">
					<div class="text-4xl mb-4">{value.icon}</div>
					<h3 class="text-xl font-bold text-gray-900 mb-4">{value.title}</h3>
					<p class="text-gray-600 leading-relaxed">{value.description}</p>
				</div>
			{/each}
		</div>
	</div>
</section>

<!-- Founders Section -->
<section class="py-20 bg-white">
	<div class="container mx-auto px-8 sm:px-12 lg:px-6">
		<div class="text-center mb-16">
			<h2 class="text-4xl font-bold text-gray-900 mb-4">🎉 Meet Our Founders</h2>
			<p class="text-xl text-gray-600 max-w-3xl mx-auto">
				The visionary leaders who created FAIT to revolutionize how people connect with trusted service providers.
			</p>
		</div>

		<div class="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto">
			{#each founders as founder}
				<div class="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden">
					<div class="aspect-w-1 aspect-h-1">
						<img
							src={founder.image}
							alt={founder.name}
							class="w-full h-80 object-cover object-center"
						/>
					</div>
					<div class="p-8 text-center">
						<h3 class="text-2xl font-bold text-gray-900 mb-2">{founder.name}</h3>
						<div class="text-blue-600 font-semibold text-lg mb-4">{founder.role}</div>
						<p class="text-gray-600 leading-relaxed">{founder.bio}</p>
					</div>
				</div>
			{/each}
		</div>
	</div>
</section>

<!-- Story Section -->
<section class="section bg-blue-600">
	<div class="container-xl">
		<div class="grid lg:grid-cols-2 gap-12 items-center">
			<div class="animate-on-scroll">
				<h2 class="text-4xl font-bold text-white mb-6">Our Story</h2>
				<div class="space-y-4 text-blue-100 leading-relaxed">
					<p>
						FAIT was born from a simple frustration: finding reliable professionals shouldn't be so difficult.
						Our founders experienced firsthand the challenges of hiring contractors, cleaners, and service providers.
					</p>
					<p>
						After countless hours of research, phone calls, and disappointing experiences, we knew there had to be a better way.
						We envisioned a platform where quality professionals and customers could connect seamlessly.
					</p>
					<p>
						Today, FAIT serves thousands of customers and professionals across the country, making quality services
						accessible to everyone while helping skilled professionals grow their businesses.
					</p>
				</div>
			</div>
			<div class="animate-on-scroll" style="animation-delay: 0.2s">
				<div class="bg-white/10 backdrop-blur-sm rounded-2xl p-8 hover-lift">
					<h3 class="text-2xl font-bold text-white mb-6">Join Our Community</h3>
					<p class="text-blue-100 mb-6">
						Whether you're looking for services or want to offer your expertise,
						FAIT is the platform that brings quality and trust together.
					</p>
					<div class="flex flex-col sm:flex-row gap-4">
						<a href="/signup" class="btn bg-white text-blue-600 hover:bg-gray-100 hover-scale">
							Get Started
						</a>
						<a href="/services" class="btn border-2 border-white text-white hover:bg-white hover:text-blue-600 hover-scale">
							Browse Services
						</a>
					</div>
				</div>
			</div>
		</div>
	</div>
</section>
