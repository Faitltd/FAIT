<script lang="ts">
	import { onMount } from 'svelte';
	import { fade, fly } from 'svelte/transition';

	interface Message {
		id: string;
		text: string;
		sender: 'user' | 'bot';
		timestamp: Date;
	}

	let isOpen = false;
	let messages: Message[] = [
		{
			id: '1',
			text: 'Hello! I\'m your FAIT assistant. How can I help you today?',
			sender: 'bot',
			timestamp: new Date()
		}
	];
	let currentMessage = '';
	let isTyping = false;
	let chatContainer: HTMLElement;

	// Enhanced knowledge base and responses
	const faitKnowledgeBase = {
		services: {
			cleaning: {
				description: 'Professional home cleaning services including deep cleaning, regular maintenance, move-in/out cleaning',
				pricing: 'Starting at $80-150 depending on home size and cleaning type',
				duration: '2-4 hours typically',
				booking: 'Available 7 days a week with flexible scheduling'
			},
			handyman: {
				description: 'General repairs, installations, maintenance, furniture assembly, minor electrical work',
				pricing: 'Hourly rates $45-75 or project-based quotes',
				duration: 'Varies by project complexity',
				booking: 'Same-day and next-day availability often possible'
			},
			plumbing: {
				description: 'Professional plumbing services including leak repairs, drain cleaning, fixture installation, pipe repairs, water heater service',
				pricing: 'Service call $75-100, hourly rates $85-125, common repairs: toilet repair $150-300, faucet installation $125-250, drain cleaning $100-200',
				duration: '1-4 hours for most repairs',
				booking: 'Emergency service available 24/7, regular appointments same-day or next-day'
			},
			electrical: {
				description: 'Licensed electrical work including outlet installation, light fixtures, ceiling fans, electrical panel upgrades, troubleshooting',
				pricing: 'Service call $75-100, hourly rates $75-125, outlet installation $125-200, light fixture $100-300, panel upgrade $800-2000',
				duration: '1-6 hours depending on complexity',
				booking: 'Licensed electricians available, advance booking recommended for major work'
			},
			gardening: {
				description: 'Lawn care, landscaping, garden maintenance, seasonal cleanup, plant care',
				pricing: '$40-80 per hour or seasonal packages available',
				duration: '1-6 hours depending on yard size',
				booking: 'Weather-dependent scheduling, advance booking recommended'
			},
			moving: {
				description: 'Local and long-distance moving, packing services, furniture moving',
				pricing: 'Starting at $100/hour for 2 movers, full-service packages available',
				duration: '4-8 hours for typical moves',
				booking: '1-2 weeks advance notice recommended'
			}
		},
		company: {
			founded: 'FAIT was founded by Ray Kinne and Kelli Trainer',
			mission: 'Connecting communities through trusted local service professionals',
			coverage: 'Currently serving multiple metropolitan areas',
			guarantee: 'All professionals are vetted and insured'
		}
	};

	const responses = {
		greeting: [
			'Hello! I\'m your FAIT assistant. I can help you find trusted service professionals, get pricing information, or answer questions about our platform. What can I help you with today?',
			'Hi there! Welcome to FAIT - your trusted platform for connecting with local service professionals. How can I assist you?',
			'Welcome to FAIT! I\'m here to help you find the perfect professional for your needs. What type of service are you looking for?'
		],
		services: [
			'FAIT offers vetted professionals for: Home Cleaning ($80-150), Handyman Services ($45-75/hr), Plumbing ($85-125/hr), Electrical ($75-125/hr), Gardening ($40-80/hr), Moving ($100+/hr), and many more. <a href="/services" class="text-blue-600 underline font-semibold">View All Services →</a>',
			'We connect you with trusted professionals for home improvement, maintenance, cleaning, plumbing, electrical, gardening, moving, and specialized services. All our professionals are licensed, vetted and insured. <a href="/booking" class="text-blue-600 underline font-semibold">Book a Service →</a>'
		],
		pricing: [
			'Here are our typical price ranges: Cleaning $80-150, Handyman $45-75/hr, Plumbing $85-125/hr + service call, Electrical $75-125/hr + service call, Gardening $40-80/hr, Moving $100+/hr. Exact pricing depends on your location and specific needs. Would you like a custom quote for a particular service?',
			'Our pricing is competitive and transparent. Most services include service calls ($75-100) plus hourly rates or project-based pricing. For accurate pricing, I recommend getting a free quote through our booking system or contacting Admin@itsfait.com with your specific requirements.'
		],
		contact: [
			'You can reach our team at Admin@itsfait.com or call 720-926-7341 (Monday-Friday, 9AM-6PM EST). For immediate assistance, I\'m here 24/7! What specific question can I help you with?',
			'Contact us anytime! Email: Admin@itsfait.com, Phone: 720-926-7341. Our human team is available weekdays 9AM-6PM EST, but I\'m here 24/7 to help with questions and bookings.'
		],
		booking: [
			'Booking is easy! Browse our services, select what you need, choose your preferred time, and we\'ll match you with a vetted professional. Most services can be booked same-day or next-day. <a href="/booking" class="text-blue-600 underline font-semibold">Start Booking →</a>',
			'To book: 1) Choose your service 2) Select date/time 3) Provide project details 4) We match you with a qualified professional. All our pros are background-checked and insured. <a href="/booking" class="text-blue-600 underline font-semibold">Book Now →</a>'
		],
		default: [
			'I can help you with service information, pricing, booking, or general questions about FAIT. We connect you with vetted professionals for home services. What would you like to know?',
			'I\'m here to help! I can assist with finding services, explaining pricing, helping with bookings, or answering questions about our platform. What specific information do you need?',
			'Great question! For detailed assistance, I can help you explore our services, understand pricing, or guide you through booking. You can also reach our team at Admin@itsfait.com for specialized support.'
		]
	};

	function toggleChat() {
		isOpen = !isOpen;
	}

	function getRandomResponse(category: keyof typeof responses): string {
		const categoryResponses = responses[category];
		return categoryResponses[Math.floor(Math.random() * categoryResponses.length)];
	}

	function getSpecificServiceInfo(message: string): string | null {
		const lowerMessage = message.toLowerCase();

		if (lowerMessage.includes('plumber') || lowerMessage.includes('plumbing') ||
			lowerMessage.includes('leak') || lowerMessage.includes('drain') ||
			lowerMessage.includes('toilet') || lowerMessage.includes('faucet') ||
			lowerMessage.includes('pipe') || lowerMessage.includes('water heater') ||
			lowerMessage.includes('clog') || lowerMessage.includes('sink')) {
			const service = faitKnowledgeBase.services.plumbing;
			return `${service.description}. ${service.pricing}. ${service.booking}. Ready to book? <a href="/booking?service=plumbing" class="text-blue-600 underline font-semibold">Book Plumbing Service →</a>`;
		}
		if (lowerMessage.includes('electrician') || lowerMessage.includes('electrical') ||
			lowerMessage.includes('outlet') || lowerMessage.includes('wiring') ||
			lowerMessage.includes('light') || lowerMessage.includes('ceiling fan') ||
			lowerMessage.includes('panel') || lowerMessage.includes('breaker')) {
			const service = faitKnowledgeBase.services.electrical;
			return `${service.description}. ${service.pricing}. ${service.booking}. Ready to book? <a href="/booking?service=electrical" class="text-blue-600 underline font-semibold">Book Electrical Service →</a>`;
		}
		if (lowerMessage.includes('clean') || lowerMessage.includes('maid') ||
			lowerMessage.includes('house cleaning') || lowerMessage.includes('deep clean') ||
			lowerMessage.includes('housekeeping') || lowerMessage.includes('sanitize')) {
			const service = faitKnowledgeBase.services.cleaning;
			return `${service.description}. ${service.pricing}. ${service.booking}. Ready to book? <a href="/booking?service=cleaning" class="text-blue-600 underline font-semibold">Book Cleaning Service →</a>`;
		}
		if (lowerMessage.includes('handyman') || lowerMessage.includes('repair') || lowerMessage.includes('fix') ||
			lowerMessage.includes('maintenance') || lowerMessage.includes('installation') || lowerMessage.includes('assembly') ||
			lowerMessage.includes('mount') || lowerMessage.includes('hang') || lowerMessage.includes('install')) {
			const service = faitKnowledgeBase.services.handyman;
			return `${service.description}. ${service.pricing}. ${service.booking}. Ready to book? <a href="/booking?service=handyman" class="text-blue-600 underline font-semibold">Book Handyman Service →</a>`;
		}
		if (lowerMessage.includes('garden') || lowerMessage.includes('lawn') || lowerMessage.includes('landscape') ||
			lowerMessage.includes('yard') || lowerMessage.includes('grass') || lowerMessage.includes('landscaping') ||
			lowerMessage.includes('mowing') || lowerMessage.includes('trimming') || lowerMessage.includes('pruning') ||
			lowerMessage.includes('weeding') || lowerMessage.includes('mulch') || lowerMessage.includes('plant')) {
			const service = faitKnowledgeBase.services.gardening;
			return `${service.description}. ${service.pricing}. ${service.booking}. Ready to book? <a href="/booking?service=gardening" class="text-blue-600 underline font-semibold">Book Gardening Service →</a>`;
		}
		if (lowerMessage.includes('mov') || lowerMessage.includes('relocat') || lowerMessage.includes('pack') ||
			lowerMessage.includes('transport') || lowerMessage.includes('furniture moving') || lowerMessage.includes('boxes') ||
			lowerMessage.includes('loading') || lowerMessage.includes('unloading') || lowerMessage.includes('truck')) {
			const service = faitKnowledgeBase.services.moving;
			return `${service.description}. ${service.pricing}. ${service.booking}. Ready to book? <a href="/booking?service=moving" class="text-blue-600 underline font-semibold">Book Moving Service →</a>`;
		}
		return null;
	}

	function categorizeMessage(message: string): keyof typeof responses {
		const lowerMessage = message.toLowerCase();

		// Check for greetings
		if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey') ||
			lowerMessage.includes('good morning') || lowerMessage.includes('good afternoon')) {
			return 'greeting';
		}

		// Check for booking-related queries
		if (lowerMessage.includes('book') || lowerMessage.includes('schedule') || lowerMessage.includes('appointment') ||
			lowerMessage.includes('hire') || lowerMessage.includes('when can') || lowerMessage.includes('available')) {
			return 'booking';
		}

		// Check for service inquiries
		if (lowerMessage.includes('service') || lowerMessage.includes('clean') || lowerMessage.includes('handyman') ||
			lowerMessage.includes('garden') || lowerMessage.includes('mov') || lowerMessage.includes('repair') ||
			lowerMessage.includes('plumber') || lowerMessage.includes('plumbing') || lowerMessage.includes('electrician') ||
			lowerMessage.includes('electrical') || lowerMessage.includes('maid') || lowerMessage.includes('lawn') ||
			lowerMessage.includes('landscape') || lowerMessage.includes('maintenance') || lowerMessage.includes('installation') ||
			lowerMessage.includes('what do you') || lowerMessage.includes('what can you')) {
			return 'services';
		}

		// Check for pricing questions
		if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('how much') ||
			lowerMessage.includes('rate') || lowerMessage.includes('fee') || lowerMessage.includes('charge')) {
			return 'pricing';
		}

		// Check for contact information
		if (lowerMessage.includes('contact') || lowerMessage.includes('phone') || lowerMessage.includes('email') ||
			lowerMessage.includes('call') || lowerMessage.includes('reach') || lowerMessage.includes('speak')) {
			return 'contact';
		}

		return 'default';
	}

	async function sendMessage() {
		if (!currentMessage.trim()) return;

		const userMessage: Message = {
			id: Date.now().toString(),
			text: currentMessage,
			sender: 'user',
			timestamp: new Date()
		};

		messages = [...messages, userMessage];
		const messageToProcess = currentMessage;
		currentMessage = '';
		isTyping = true;

		// Scroll to bottom
		setTimeout(() => {
			if (chatContainer) {
				chatContainer.scrollTop = chatContainer.scrollHeight;
			}
		}, 100);

		// Simulate AI response delay
		setTimeout(() => {
			// Check for specific service information first
			const specificInfo = getSpecificServiceInfo(messageToProcess);
			let responseText: string;

			if (specificInfo) {
				responseText = specificInfo;
			} else {
				const category = categorizeMessage(messageToProcess);
				responseText = getRandomResponse(category);
			}

			const botResponse: Message = {
				id: (Date.now() + 1).toString(),
				text: responseText,
				sender: 'bot',
				timestamp: new Date()
			};

			messages = [...messages, botResponse];
			isTyping = false;

			// Scroll to bottom after bot response
			setTimeout(() => {
				if (chatContainer) {
					chatContainer.scrollTop = chatContainer.scrollHeight;
				}
			}, 100);
		}, 1000 + Math.random() * 1000); // Random delay between 1-2 seconds
	}

	function handleKeyPress(event: KeyboardEvent) {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault();
			sendMessage();
		}
	}

	function formatTime(date: Date): string {
		return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
	}

	// Listen for custom event to open chat
	onMount(() => {
		const handleOpenChat = () => {
			isOpen = true;
		};

		window.addEventListener('openChat', handleOpenChat);

		return () => {
			window.removeEventListener('openChat', handleOpenChat);
		};
	});
</script>

<!-- Chat Widget Button -->
{#if !isOpen}
	<button
		class="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transition-all duration-300 transform hover:scale-110 z-50"
		on:click={toggleChat}
		transition:fade={{ duration: 200 }}
	>
		<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.959 8.959 0 01-4.906-1.456L3 21l2.456-5.094A8.959 8.959 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
		</svg>
		<span class="sr-only">Open chat</span>
	</button>
{/if}

<!-- Chat Window -->
{#if isOpen}
	<div
		class="fixed bottom-6 right-6 w-96 h-[500px] bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col z-50"
		transition:fly={{ y: 20, duration: 300 }}
	>
		<!-- Chat Header -->
		<div class="bg-blue-600 text-white p-4 rounded-t-lg flex justify-between items-center">
			<div class="flex items-center space-x-3">
				<div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
					<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
					</svg>
				</div>
				<div>
					<h3 class="font-semibold">FAIT Assistant</h3>
					<p class="text-xs text-blue-100">Available 24/7</p>
				</div>
			</div>
			<button
				on:click={toggleChat}
				class="text-blue-100 hover:text-white transition-colors"
				aria-label="Close chat"
			>
				<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
				</svg>
			</button>
		</div>

		<!-- Chat Messages -->
		<div
			bind:this={chatContainer}
			class="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50"
		>
			{#each messages as message (message.id)}
				<div class="flex {message.sender === 'user' ? 'justify-end' : 'justify-start'}">
					<div class="max-w-xs lg:max-w-md">
						<div
							class="rounded-lg px-4 py-2 {message.sender === 'user'
								? 'bg-blue-600 text-white'
								: 'bg-white text-gray-800 border border-gray-200'}"
						>
							<div class="text-sm chat-message-content">{@html message.text}</div>
						</div>
						<p class="text-xs text-gray-500 mt-1 {message.sender === 'user' ? 'text-right' : 'text-left'}">
							{formatTime(message.timestamp)}
						</p>
					</div>
				</div>
			{/each}

			{#if isTyping}
				<div class="flex justify-start">
					<div class="max-w-xs lg:max-w-md">
						<div class="bg-white text-gray-800 border border-gray-200 rounded-lg px-4 py-2">
							<div class="flex space-x-1">
								<div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
								<div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
								<div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
							</div>
						</div>
					</div>
				</div>
			{/if}
		</div>

		<!-- Chat Input -->
		<div class="p-4 border-t border-gray-200 bg-white rounded-b-lg">
			<div class="flex space-x-2">
				<input
					type="text"
					bind:value={currentMessage}
					on:keypress={handleKeyPress}
					placeholder="Type your message..."
					class="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
					disabled={isTyping}
				/>
				<button
					on:click={sendMessage}
					disabled={!currentMessage.trim() || isTyping}
					class="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-lg px-4 py-2 transition-colors"
					aria-label="Send message"
				>
					<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
					</svg>
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	@keyframes bounce {
		0%, 80%, 100% {
			transform: translateY(0);
		}
		40% {
			transform: translateY(-10px);
		}
	}

	.animate-bounce {
		animation: bounce 1.4s infinite;
	}

	/* Ensure links in chat messages are properly styled and clickable */
	:global(.chat-message-content a) {
		color: #2563eb !important;
		text-decoration: underline !important;
		font-weight: 600 !important;
		cursor: pointer !important;
		transition: color 0.2s ease !important;
	}

	:global(.chat-message-content a:hover) {
		color: #1d4ed8 !important;
		text-decoration: underline !important;
	}

	:global(.chat-message-content a:visited) {
		color: #2563eb !important;
	}
</style>
