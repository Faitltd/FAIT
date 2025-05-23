<script lang="ts">
	const currentYear = new Date().getFullYear();
	
	const footerLinks = {
		company: [
			{ name: 'About Us', href: '/about' },
			{ name: 'Contact', href: '/contact' },
			{ name: 'Careers', href: '/careers' },
			{ name: 'Press', href: '/press' }
		],
		services: [
			{ name: 'Browse Services', href: '/services' },
			{ name: 'Become a Pro', href: '/signup' },
			{ name: 'How It Works', href: '/how-it-works' },
			{ name: 'Pricing', href: '/pricing' }
		],
		support: [
			{ name: 'Help Center', href: '/help' },
			{ name: 'Safety', href: '/safety' },
			{ name: 'Trust & Safety', href: '/trust-safety' },
			{ name: 'Community', href: '/community' }
		],
		legal: [
			{ name: 'Terms of Service', href: '/terms' },
			{ name: 'Privacy Policy', href: '/privacy' },
			{ name: 'Cookie Policy', href: '/cookies' },
			{ name: 'Accessibility', href: '/accessibility' }
		]
	};

	const socialLinks = [
		{ name: 'Facebook', href: '#', icon: 'facebook' },
		{ name: 'Twitter', href: '#', icon: 'twitter' },
		{ name: 'Instagram', href: '#', icon: 'instagram' },
		{ name: 'LinkedIn', href: '#', icon: 'linkedin' }
	];
</script>

<footer class="bg-gray-900 text-white">
	<!-- Main Footer Content -->
	<div class="container-xl py-16">
		<div class="grid lg:grid-cols-5 gap-8">
			<!-- Brand Section -->
			<div class="lg:col-span-2">
				<a href="/" class="flex items-center space-x-2 text-white hover:text-gray-300 transition-colors mb-6">
					<svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
						<polyline points="9 22 9 12 15 12 15 22"></polyline>
					</svg>
					<span class="font-sans text-2xl font-bold">FAIT</span>
				</a>
				<p class="text-gray-300 mb-6 leading-relaxed">
					Connecting customers with trusted professionals for all your service needs. 
					Quality, reliability, and satisfaction guaranteed.
				</p>
				
				<!-- Newsletter Signup -->
				<div class="mb-6">
					<h4 class="font-semibold mb-3">Stay Updated</h4>
					<div class="flex">
						<input
							type="email"
							placeholder="Enter your email"
							class="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
						/>
						<button class="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-r-lg transition-colors">
							Subscribe
						</button>
					</div>
				</div>

				<!-- Social Links -->
				<div class="flex space-x-4">
					{#each socialLinks as social}
						<a
							href={social.href}
							class="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors"
							aria-label={social.name}
						>
							{#if social.icon === 'facebook'}
								<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
									<path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
								</svg>
							{:else if social.icon === 'twitter'}
								<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
									<path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
								</svg>
							{:else if social.icon === 'instagram'}
								<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
									<path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987 6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297C4.198 14.895 3.708 13.744 3.708 12.447s.49-2.448 1.297-3.323c.875-.807 2.026-1.297 3.323-1.297s2.448.49 3.323 1.297c.807.875 1.297 2.026 1.297 3.323s-.49 2.448-1.297 3.323c-.875.807-2.026 1.297-3.323 1.297zm7.718-1.297c-.875.807-2.026 1.297-3.323 1.297s-2.448-.49-3.323-1.297c-.807-.875-1.297-2.026-1.297-3.323s.49-2.448 1.297-3.323c.875-.807 2.026-1.297 3.323-1.297s2.448.49 3.323 1.297c.807.875 1.297 2.026 1.297 3.323s-.49 2.448-1.297 3.323z"/>
								</svg>
							{:else if social.icon === 'linkedin'}
								<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
									<path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
								</svg>
							{/if}
						</a>
					{/each}
				</div>
			</div>

			<!-- Company Links -->
			<div>
				<h4 class="font-semibold mb-4">Company</h4>
				<ul class="space-y-3">
					{#each footerLinks.company as link}
						<li>
							<a href={link.href} class="text-gray-300 hover:text-white transition-colors">
								{link.name}
							</a>
						</li>
					{/each}
				</ul>
			</div>

			<!-- Services Links -->
			<div>
				<h4 class="font-semibold mb-4">Services</h4>
				<ul class="space-y-3">
					{#each footerLinks.services as link}
						<li>
							<a href={link.href} class="text-gray-300 hover:text-white transition-colors">
								{link.name}
							</a>
						</li>
					{/each}
				</ul>
			</div>

			<!-- Support & Legal Links -->
			<div>
				<h4 class="font-semibold mb-4">Support</h4>
				<ul class="space-y-3 mb-6">
					{#each footerLinks.support as link}
						<li>
							<a href={link.href} class="text-gray-300 hover:text-white transition-colors">
								{link.name}
							</a>
						</li>
					{/each}
				</ul>
				
				<h4 class="font-semibold mb-4">Legal</h4>
				<ul class="space-y-3">
					{#each footerLinks.legal as link}
						<li>
							<a href={link.href} class="text-gray-300 hover:text-white transition-colors">
								{link.name}
							</a>
						</li>
					{/each}
				</ul>
			</div>
		</div>
	</div>

	<!-- Bottom Bar -->
	<div class="border-t border-gray-800">
		<div class="container-xl py-6">
			<div class="flex flex-col md:flex-row justify-between items-center">
				<div class="text-gray-400 text-sm mb-4 md:mb-0">
					© {currentYear} FAIT. All rights reserved.
				</div>
				
				<div class="flex items-center space-x-6 text-sm text-gray-400">
					<span>🌍 Available nationwide</span>
					<span>📞 1-800-FAIT-HELP</span>
					<span>✉️ hello@fait.com</span>
				</div>
			</div>
		</div>
	</div>
</footer>
