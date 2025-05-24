<script lang="ts">
	import { onMount } from 'svelte';

	let formData = {
		name: '',
		email: '',
		subject: '',
		message: '',
		type: 'general'
	};

	let isSubmitting = false;
	let submitMessage = '';

	// Function to trigger chat widget (will be handled by the global chat widget)
	function openChat() {
		// Dispatch a custom event to open the chat widget
		window.dispatchEvent(new CustomEvent('openChat'));
	}

	const contactInfo = [
		{
			title: 'Email Us',
			value: 'Admin@itsfait.com',
			description: 'Send us an email and we\'ll respond within 24 hours'
		},
		{
			title: 'Call Us',
			value: '720-926-7341',
			description: 'Speak with our support team Monday-Friday, 9AM-6PM EST'
		},
		{
			title: 'Live Chat',
			value: 'Available 24/7',
			description: 'Get instant help through our LLM powered chat support'
		}
	];

	const faqs = [
		{
			question: 'How do I find professionals in my area?',
			answer: 'Simply use our search feature on the Services page. Enter your location and the type of service you need, and we\'ll show you verified professionals nearby.'
		},
		{
			question: 'Are all professionals background checked?',
			answer: 'Yes, every professional on our platform undergoes a thorough background check, verification process, and must maintain proper licensing and insurance.'
		},
		{
			question: 'How does pricing work?',
			answer: 'Professionals set their own rates, but we ensure transparent pricing with no hidden fees. You can compare quotes from multiple professionals before making a decision.'
		},
		{
			question: 'What if I\'m not satisfied with the service?',
			answer: 'We offer a satisfaction guarantee. If you\'re not happy with the service, contact our support team and we\'ll work to make it right, including potential refunds or re-service.'
		}
	];

	async function handleSubmit() {
		isSubmitting = true;

		// Simulate form submission
		await new Promise(resolve => setTimeout(resolve, 2000));

		submitMessage = 'Thank you for your message! We\'ll get back to you within 24 hours.';
		formData = { name: '', email: '', subject: '', message: '', type: 'general' };
		isSubmitting = false;

		// Clear message after 5 seconds
		setTimeout(() => {
			submitMessage = '';
		}, 5000);
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
	<title>Contact Us - FAIT Professional Services Platform</title>
	<meta name="description" content="Get in touch with FAIT. Contact our support team for help with services, account questions, or general inquiries. We're here to help!" />
</svelte:head>

<!-- Hero Section -->
<section class="section bg-gradient-to-br from-blue-50 to-indigo-100 pt-32">
	<div class="container-xl">
		<div class="text-center mb-12 animate-on-scroll">
			<h1 class="text-5xl font-bold text-gray-900 mb-6">Contact Us</h1>
			<p class="text-xl text-gray-600 max-w-3xl mx-auto">
				Have questions? Need help? We're here for you. Reach out to our friendly support team
				and we'll get back to you as soon as possible.
			</p>
		</div>
	</div>
</section>

<!-- Contact Info Section -->
<section class="section bg-white">
	<div class="container-xl">
		<div class="grid md:grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
			{#each contactInfo as info, index}
				{#if info.title === 'Live Chat'}
					<button
						on:click={openChat}
						class="card text-center animate-on-scroll hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
						style="animation-delay: {index * 0.1}s"
					>
						<h3 class="text-lg font-bold text-gray-900 mb-2">{info.title}</h3>
						<div class="text-blue-600 font-medium mb-2">{info.value}</div>
						<p class="text-gray-600 text-sm">{info.description}</p>
						<div class="mt-3 text-blue-600 text-sm font-medium">Click to start chatting →</div>
					</button>
				{:else}
					<div class="card text-center animate-on-scroll" style="animation-delay: {index * 0.1}s">
						<h3 class="text-lg font-bold text-gray-900 mb-2">{info.title}</h3>
						<div class="text-blue-600 font-medium mb-2">{info.value}</div>
						<p class="text-gray-600 text-sm">{info.description}</p>
					</div>
				{/if}
			{/each}
		</div>
	</div>
</section>

<!-- Contact Form Section -->
<section class="section bg-gray-50">
	<div class="container-xl">
		<div class="grid lg:grid-cols-2 gap-12">
			<!-- Contact Form -->
			<div class="animate-on-scroll">
				<div class="bg-white rounded-2xl shadow-lg p-8">
					<h2 class="text-3xl font-bold text-gray-900 mb-6">Send us a Message</h2>

					{#if submitMessage}
						<div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
							{submitMessage}
						</div>
					{/if}

					<form on:submit|preventDefault={handleSubmit} class="space-y-6">
						<div class="grid md:grid-cols-2 gap-6">
							<div>
								<label for="name" class="block text-sm font-medium text-gray-700 mb-2">Name *</label>
								<input
									type="text"
									id="name"
									bind:value={formData.name}
									required
									class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
									placeholder="Your full name"
								/>
							</div>
							<div>
								<label for="email" class="block text-sm font-medium text-gray-700 mb-2">Email *</label>
								<input
									type="email"
									id="email"
									bind:value={formData.email}
									required
									class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
									placeholder="your@email.com"
								/>
							</div>
						</div>

						<div>
							<label for="type" class="block text-sm font-medium text-gray-700 mb-2">Inquiry Type</label>
							<select
								id="type"
								bind:value={formData.type}
								class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
							>
								<option value="general">General Question</option>
								<option value="support">Technical Support</option>
								<option value="billing">Billing Question</option>
								<option value="professional">Become a Professional</option>
								<option value="partnership">Partnership Inquiry</option>
							</select>
						</div>

						<div>
							<label for="subject" class="block text-sm font-medium text-gray-700 mb-2">Subject *</label>
							<input
								type="text"
								id="subject"
								bind:value={formData.subject}
								required
								class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								placeholder="Brief description of your inquiry"
							/>
						</div>

						<div>
							<label for="message" class="block text-sm font-medium text-gray-700 mb-2">Message *</label>
							<textarea
								id="message"
								bind:value={formData.message}
								required
								rows="6"
								class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								placeholder="Please provide details about your inquiry..."
							></textarea>
						</div>

						<button
							type="submit"
							disabled={isSubmitting}
							class="btn btn-primary w-full text-lg py-4 hover-scale {isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}"
						>
							{isSubmitting ? 'Sending...' : 'Send Message'}
						</button>
					</form>
				</div>
			</div>

			<!-- FAQ Section -->
			<div class="animate-on-scroll" style="animation-delay: 0.2s">
				<h2 class="text-3xl font-bold text-gray-900 mb-8">Frequently Asked Questions</h2>
				<div class="space-y-6">
					{#each faqs as faq, index}
						<div class="bg-white rounded-lg shadow-sm p-6 hover-lift">
							<h3 class="text-lg font-semibold text-gray-900 mb-3">{faq.question}</h3>
							<p class="text-gray-600 leading-relaxed">{faq.answer}</p>
						</div>
					{/each}
				</div>

				<div class="mt-8 bg-blue-50 rounded-lg p-6">
					<h3 class="text-lg font-semibold text-gray-900 mb-3">Still have questions?</h3>
					<p class="text-gray-600 mb-4">
						Can't find what you're looking for? Our support team is always ready to help.
					</p>
					<div class="flex flex-col sm:flex-row gap-3">
						<a href="mailto:hello@fait.com" class="btn btn-primary hover-scale">
							Email Support
						</a>
						<button class="btn btn-secondary hover-scale">
							Start Live Chat
						</button>
					</div>
				</div>
			</div>
		</div>
	</div>
</section>

<!-- Emergency Support Section -->
<section class="section bg-red-600">
	<div class="container-xl text-center">
		<div class="animate-on-scroll">
			<h2 class="text-3xl font-bold text-white mb-4">Need Emergency Support?</h2>
			<p class="text-xl text-red-100 mb-6 max-w-2xl mx-auto">
				For urgent issues or emergencies related to ongoing services, contact our 24/7 emergency line.
			</p>
			<a href="tel:1-800-EMERGENCY" class="btn bg-white text-red-600 hover:bg-gray-100 text-lg px-8 py-4 hover-scale">
				📞 Emergency Line: 1-800-EMERGENCY
			</a>
		</div>
	</div>
</section>
