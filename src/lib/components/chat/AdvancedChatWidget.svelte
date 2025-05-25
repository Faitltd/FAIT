<script lang="ts">
	import { onMount } from 'svelte';
	import { fade, fly } from 'svelte/transition';

	interface Message {
		id: string;
		text: string;
		sender: 'user' | 'bot';
		timestamp: Date;
		rating?: number;
	}

	interface ChatConfig {
		apiEndpoint: string;
		model: string;
		systemPrompt: string;
		maxTokens: number;
	}

	let isOpen = false;
	let messages: Message[] = [
		{
			id: '1',
			text: 'Hello! I\'m your FAIT assistant powered by advanced AI. I can help you with detailed service information, pricing, booking, and answer any questions about our platform. How can I assist you today?',
			sender: 'bot',
			timestamp: new Date()
		}
	];
	let currentMessage = '';
	let isTyping = false;
	let chatContainer: HTMLElement;
	let conversationContext: string[] = [];

	// Configuration for LLM integration
	const chatConfig: ChatConfig = {
		apiEndpoint: '/api/chat', // Your backend endpoint
		model: 'gpt-4',
		systemPrompt: `You are a helpful customer service agent for FAIT, a platform connecting customers with trusted local service professionals. 

FAIT Services & Pricing:
- Home Cleaning: $80-150 (deep clean, regular maintenance, move-in/out)
- Handyman Services: $45-75/hour (repairs, installations, furniture assembly)
- Gardening & Landscaping: $40-80/hour (lawn care, maintenance, seasonal cleanup)
- Moving Services: $100+/hour for 2 movers (local/long-distance, packing)

Company Info:
- Founded by Ray Kinne and Kelli Trainer
- All professionals are vetted, background-checked, and insured
- Available 7 days a week with flexible scheduling
- Contact: Admin@itsfait.com, 720-926-7341 (Mon-Fri 9AM-6PM EST)

Guidelines:
- Be helpful, professional, and friendly
- Provide specific pricing when asked
- Guide customers through booking process
- Emphasize trust, safety, and quality
- Ask follow-up questions to understand needs
- Offer to connect with human agents for complex issues`,
		maxTokens: 500
	};

	function toggleChat() {
		isOpen = !isOpen;
	}

	// Advanced LLM integration function
	async function getLLMResponse(userMessage: string): Promise<string> {
		try {
			// Add user message to context
			conversationContext.push(`User: ${userMessage}`);
			
			// Keep only last 10 messages for context (to manage token limits)
			if (conversationContext.length > 10) {
				conversationContext = conversationContext.slice(-10);
			}

			const response = await fetch(chatConfig.apiEndpoint, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					model: chatConfig.model,
					messages: [
						{
							role: 'system',
							content: chatConfig.systemPrompt
						},
						{
							role: 'user',
							content: `Context: ${conversationContext.join('\n')}\n\nCurrent question: ${userMessage}`
						}
					],
					max_tokens: chatConfig.maxTokens,
					temperature: 0.7
				})
			});

			if (!response.ok) {
				throw new Error('Failed to get response from LLM');
			}

			const data = await response.json();
			const botResponse = data.choices[0].message.content;
			
			// Add bot response to context
			conversationContext.push(`Assistant: ${botResponse}`);
			
			return botResponse;
		} catch (error) {
			console.error('LLM API Error:', error);
			// Fallback to enhanced rule-based responses
			return getFallbackResponse(userMessage);
		}
	}

	// Fallback responses when LLM API is unavailable
	function getFallbackResponse(message: string): string {
		const lowerMessage = message.toLowerCase();
		
		if (lowerMessage.includes('clean')) {
			return 'Our cleaning services start at $80-150 depending on home size. We offer deep cleaning, regular maintenance, and move-in/out cleaning. All our professionals are vetted and insured. Would you like to book a cleaning service or get a custom quote?';
		}
		if (lowerMessage.includes('handyman') || lowerMessage.includes('repair')) {
			return 'Our handyman services are $45-75/hour for repairs, installations, furniture assembly, and minor electrical/plumbing work. Same-day availability is often possible. What type of work do you need done?';
		}
		if (lowerMessage.includes('garden') || lowerMessage.includes('lawn')) {
			return 'Our gardening and landscaping services are $40-80/hour for lawn care, maintenance, and seasonal cleanup. Weather-dependent scheduling with advance booking recommended. What gardening work do you need?';
		}
		if (lowerMessage.includes('mov')) {
			return 'Our moving services start at $100/hour for 2 movers. We handle local and long-distance moves, plus packing services. 1-2 weeks advance notice is recommended. When are you planning to move?';
		}
		if (lowerMessage.includes('price') || lowerMessage.includes('cost')) {
			return 'Our pricing varies by service: Cleaning $80-150, Handyman $45-75/hr, Gardening $40-80/hr, Moving $100+/hr. All professionals are insured. Would you like a specific quote for a particular service?';
		}
		if (lowerMessage.includes('book') || lowerMessage.includes('schedule')) {
			return 'Booking is easy! Browse our services, select your preferred time, and we\'ll match you with a vetted professional. Most services available same-day or next-day. Which service would you like to book?';
		}
		
		return 'I\'m here to help with FAIT services! I can assist with cleaning, handyman work, gardening, moving, pricing, and booking. You can also contact our team at Admin@itsfait.com or 720-926-7341. What would you like to know?';
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

		try {
			// Get response from LLM or fallback
			const responseText = await getLLMResponse(messageToProcess);

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
		} catch (error) {
			console.error('Error sending message:', error);
			isTyping = false;
		}
	}

	function rateMessage(messageId: string, rating: number) {
		messages = messages.map(msg => 
			msg.id === messageId ? { ...msg, rating } : msg
		);
		
		// Send rating to analytics/training system
		fetch('/api/chat/feedback', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ messageId, rating, timestamp: new Date() })
		}).catch(console.error);
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
					<h3 class="font-semibold">FAIT AI Assistant</h3>
					<p class="text-xs text-blue-100">Powered by Advanced AI</p>
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
							<p class="text-sm">{message.text}</p>
						</div>
						<div class="flex items-center justify-between mt-1">
							<p class="text-xs text-gray-500 {message.sender === 'user' ? 'text-right' : 'text-left'}">
								{formatTime(message.timestamp)}
							</p>
							{#if message.sender === 'bot'}
								<div class="flex space-x-1">
									<button
										on:click={() => rateMessage(message.id, 1)}
										class="text-xs text-gray-400 hover:text-green-500 {message.rating === 1 ? 'text-green-500' : ''}"
										aria-label="Rate as helpful"
									>
										👍
									</button>
									<button
										on:click={() => rateMessage(message.id, -1)}
										class="text-xs text-gray-400 hover:text-red-500 {message.rating === -1 ? 'text-red-500' : ''}"
										aria-label="Rate as not helpful"
									>
										👎
									</button>
								</div>
							{/if}
						</div>
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
					placeholder="Ask me anything about FAIT services..."
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
</style>
