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
	<title>Terms of Service - FAIT</title>
	<meta name="description" content="Read FAIT's Terms of Service to understand your rights and responsibilities when using our professional services platform." />
</svelte:head>

<section class="section bg-gradient-to-br from-blue-50 to-indigo-100 pt-32">
	<div class="container-xl">
		<div class="text-center mb-12 animate-on-scroll">
			<h1 class="text-5xl font-bold text-gray-900 mb-6">Terms of Service</h1>
			<p class="text-xl text-gray-600 max-w-3xl mx-auto">
				Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
			</p>
		</div>
	</div>
</section>

<section class="section bg-white">
	<div class="container-xl max-w-4xl">
		<div class="prose prose-lg mx-auto animate-on-scroll">
			<h2>1. Acceptance of Terms</h2>
			<p>
				By accessing and using FAIT's services, you accept and agree to be bound by the terms and provision of this agreement. 
				If you do not agree to abide by the above, please do not use this service.
			</p>

			<h2>2. Description of Service</h2>
			<p>
				FAIT is a platform that connects customers with professional service providers. We facilitate introductions and 
				provide tools for communication, booking, and payment processing, but we are not a party to the actual service agreements 
				between customers and professionals.
			</p>

			<h2>3. User Accounts</h2>
			<p>
				To access certain features of our service, you may be required to create an account. You are responsible for:
			</p>
			<ul>
				<li>Maintaining the confidentiality of your account credentials</li>
				<li>All activities that occur under your account</li>
				<li>Providing accurate and complete information</li>
				<li>Updating your information as necessary</li>
			</ul>

			<h2>4. Professional Services</h2>
			<p>
				Professionals using our platform agree to:
			</p>
			<ul>
				<li>Provide accurate information about their qualifications and services</li>
				<li>Maintain appropriate licenses and insurance as required by law</li>
				<li>Deliver services in a professional and timely manner</li>
				<li>Comply with all applicable laws and regulations</li>
			</ul>

			<h2>5. Customer Responsibilities</h2>
			<p>
				Customers using our platform agree to:
			</p>
			<ul>
				<li>Provide accurate project descriptions and requirements</li>
				<li>Communicate clearly and respectfully with professionals</li>
				<li>Make payments as agreed upon</li>
				<li>Provide honest and fair reviews</li>
			</ul>

			<h2>6. Payments and Fees</h2>
			<p>
				FAIT may charge fees for certain services. All fees will be clearly disclosed before you incur them. 
				Payment processing is handled through secure third-party providers.
			</p>

			<h2>7. Privacy and Data Protection</h2>
			<p>
				Your privacy is important to us. Please review our Privacy Policy to understand how we collect, 
				use, and protect your information.
			</p>

			<h2>8. Limitation of Liability</h2>
			<p>
				FAIT acts as an intermediary platform and is not responsible for the quality, safety, or legality 
				of services provided by professionals. We do not guarantee the accuracy of professional profiles 
				or the outcome of any services.
			</p>

			<h2>9. Dispute Resolution</h2>
			<p>
				In the event of disputes between customers and professionals, FAIT may provide mediation services 
				but is not obligated to resolve such disputes. Users are encouraged to resolve issues directly 
				when possible.
			</p>

			<h2>10. Termination</h2>
			<p>
				We reserve the right to terminate or suspend accounts that violate these terms or engage in 
				fraudulent, abusive, or illegal activities.
			</p>

			<h2>11. Changes to Terms</h2>
			<p>
				We may update these terms from time to time. Users will be notified of significant changes, 
				and continued use of the service constitutes acceptance of the updated terms.
			</p>

			<h2>12. Contact Information</h2>
			<p>
				If you have questions about these Terms of Service, please contact us at:
			</p>
			<ul>
				<li>Email: legal@fait.com</li>
				<li>Phone: 1-800-FAIT-HELP</li>
				<li>Address: 123 Innovation Drive, Tech City, TC 12345</li>
			</ul>
		</div>
	</div>
</section>

<section class="section bg-blue-600">
	<div class="container-xl text-center">
		<div class="animate-on-scroll">
			<h2 class="text-3xl font-bold text-white mb-4">Questions About Our Terms?</h2>
			<p class="text-xl text-blue-100 mb-6 max-w-2xl mx-auto">
				Our legal team is here to help clarify any questions you may have about our Terms of Service.
			</p>
			<a href="/contact" class="btn bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-4 hover-scale">
				Contact Legal Team
			</a>
		</div>
	</div>
</section>
