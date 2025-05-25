<script lang="ts">
	import { onMount } from 'svelte';

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
	<title>Privacy Policy - FAIT</title>
	<meta name="description" content="Learn how FAIT protects your privacy and handles your personal information on our professional services platform." />
</svelte:head>

<section class="section bg-gradient-to-br from-blue-50 to-indigo-100 pt-32">
	<div class="container-xl">
		<div class="text-center mb-12 animate-on-scroll">
			<h1 class="text-5xl font-bold text-gray-900 mb-6">Privacy Policy</h1>
			<p class="text-xl text-gray-600 max-w-3xl mx-auto">
				Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
			</p>
		</div>
	</div>
</section>

<section class="section bg-white">
	<div class="container-xl max-w-4xl">
		<div class="prose prose-lg mx-auto animate-on-scroll">
			<h2>1. Information We Collect</h2>
			<p>
				We collect information you provide directly to us, such as when you create an account, 
				use our services, or contact us for support.
			</p>
			
			<h3>Personal Information</h3>
			<ul>
				<li>Name, email address, and phone number</li>
				<li>Address and location information</li>
				<li>Payment information (processed securely by third parties)</li>
				<li>Profile information and preferences</li>
			</ul>

			<h3>Usage Information</h3>
			<ul>
				<li>How you interact with our platform</li>
				<li>Pages visited and features used</li>
				<li>Search queries and booking history</li>
				<li>Device information and IP address</li>
			</ul>

			<h2>2. How We Use Your Information</h2>
			<p>
				We use the information we collect to:
			</p>
			<ul>
				<li>Provide and improve our services</li>
				<li>Connect you with appropriate professionals</li>
				<li>Process payments and transactions</li>
				<li>Send important updates and notifications</li>
				<li>Provide customer support</li>
				<li>Ensure platform safety and security</li>
			</ul>

			<h2>3. Information Sharing</h2>
			<p>
				We may share your information in the following circumstances:
			</p>
			
			<h3>With Service Professionals</h3>
			<p>
				When you request services, we share relevant contact and project information with 
				professionals to facilitate service delivery.
			</p>

			<h3>With Service Providers</h3>
			<p>
				We work with trusted third parties who help us operate our platform, including 
				payment processors, hosting providers, and analytics services.
			</p>

			<h3>For Legal Compliance</h3>
			<p>
				We may disclose information when required by law or to protect our rights, 
				safety, or the rights and safety of others.
			</p>

			<h2>4. Data Security</h2>
			<p>
				We implement appropriate technical and organizational measures to protect your 
				personal information against unauthorized access, alteration, disclosure, or destruction.
			</p>

			<h2>5. Your Rights and Choices</h2>
			<p>
				You have the right to:
			</p>
			<ul>
				<li>Access and update your personal information</li>
				<li>Delete your account and associated data</li>
				<li>Opt out of marketing communications</li>
				<li>Request a copy of your data</li>
				<li>Object to certain data processing activities</li>
			</ul>

			<h2>6. Cookies and Tracking</h2>
			<p>
				We use cookies and similar technologies to enhance your experience, analyze usage, 
				and provide personalized content. You can control cookie settings through your browser.
			</p>

			<h2>7. Data Retention</h2>
			<p>
				We retain your information for as long as necessary to provide our services and 
				comply with legal obligations. You can request deletion of your account at any time.
			</p>

			<h2>8. International Data Transfers</h2>
			<p>
				Your information may be transferred to and processed in countries other than your own. 
				We ensure appropriate safeguards are in place for such transfers.
			</p>

			<h2>9. Children's Privacy</h2>
			<p>
				Our services are not intended for children under 13. We do not knowingly collect 
				personal information from children under 13.
			</p>

			<h2>10. Changes to This Policy</h2>
			<p>
				We may update this Privacy Policy from time to time. We will notify you of any 
				material changes by posting the new policy on our website.
			</p>

			<h2>11. Contact Us</h2>
			<p>
				If you have questions about this Privacy Policy or our data practices, please contact us:
			</p>
			<ul>
				<li>Email: privacy@fait.com</li>
				<li>Phone: 1-800-FAIT-HELP</li>
				<li>Address: 123 Innovation Drive, Tech City, TC 12345</li>
			</ul>
		</div>
	</div>
</section>

<section class="section bg-green-600">
	<div class="container-xl text-center">
		<div class="animate-on-scroll">
			<h2 class="text-3xl font-bold text-white mb-4">Your Privacy Matters</h2>
			<p class="text-xl text-green-100 mb-6 max-w-2xl mx-auto">
				We're committed to protecting your privacy and being transparent about how we handle your data.
			</p>
			<div class="flex flex-col sm:flex-row gap-4 justify-center">
				<a href="/contact" class="btn bg-white text-green-600 hover:bg-gray-100 text-lg px-8 py-4 hover-scale">
					Privacy Questions
				</a>
				<a href="/settings" class="btn border-2 border-white text-white hover:bg-white hover:text-green-600 text-lg px-8 py-4 hover-scale">
					Manage Privacy Settings
				</a>
			</div>
		</div>
	</div>
</section>
