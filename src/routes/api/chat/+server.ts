import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// Example API endpoint for LLM integration
// You'll need to install: npm install openai

interface ChatMessage {
	role: 'system' | 'user' | 'assistant';
	content: string;
}

interface ChatRequest {
	model: string;
	messages: ChatMessage[];
	max_tokens: number;
	temperature: number;
}

// FAIT-specific system prompt
const FAIT_SYSTEM_PROMPT = `You are a helpful customer service agent for FAIT, a platform connecting customers with trusted local service professionals.

FAIT Services & Pricing:
- Home Cleaning: $80-150 (deep clean, regular maintenance, move-in/out cleaning)
- Handyman Services: $45-75/hour (repairs, installations, furniture assembly, minor electrical/plumbing)
- Gardening & Landscaping: $40-80/hour (lawn care, maintenance, seasonal cleanup, plant care)
- Moving Services: $100+/hour for 2 movers (local/long-distance moves, packing services)

Company Information:
- Founded by Ray Kinne and Kelli Trainer
- Mission: Connecting communities through trusted local service professionals
- All professionals are vetted, background-checked, and insured
- Available 7 days a week with flexible scheduling
- Contact: Admin@itsfait.com, 720-926-7341 (Monday-Friday, 9AM-6PM EST)

Booking Process:
1. Customer browses services or describes their needs
2. Customer selects preferred date/time
3. Customer provides project details
4. FAIT matches with qualified, vetted professional
5. Professional contacts customer to confirm details

Guidelines:
- Be helpful, professional, and friendly
- Provide specific pricing when asked
- Guide customers through the booking process
- Emphasize trust, safety, and quality (all pros are vetted and insured)
- Ask follow-up questions to better understand customer needs
- Offer to connect with human agents for complex issues
- Always mention that professionals are background-checked and insured
- For urgent issues, direct to phone: 720-926-7341

Response Style:
- Keep responses concise but informative
- Use a warm, professional tone
- Include relevant pricing information
- End with a question to continue the conversation
- Offer specific next steps when appropriate`;

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { messages, model = 'gpt-3.5-turbo', max_tokens = 500, temperature = 0.7 }: ChatRequest = await request.json();

		// Option 1: OpenAI Integration
		if (process.env.OPENAI_API_KEY) {
			const response = await fetch('https://api.openai.com/v1/chat/completions', {
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					model,
					messages: [
						{ role: 'system', content: FAIT_SYSTEM_PROMPT },
						...messages
					],
					max_tokens,
					temperature
				})
			});

			if (!response.ok) {
				throw new Error(`OpenAI API error: ${response.statusText}`);
			}

			const data = await response.json();
			return json(data);
		}

		// Option 2: Anthropic Claude Integration
		if (process.env.ANTHROPIC_API_KEY) {
			const response = await fetch('https://api.anthropic.com/v1/messages', {
				method: 'POST',
				headers: {
					'x-api-key': process.env.ANTHROPIC_API_KEY,
					'Content-Type': 'application/json',
					'anthropic-version': '2023-06-01'
				},
				body: JSON.stringify({
					model: 'claude-3-sonnet-20240229',
					max_tokens,
					system: FAIT_SYSTEM_PROMPT,
					messages: messages.filter(m => m.role !== 'system')
				})
			});

			if (!response.ok) {
				throw new Error(`Anthropic API error: ${response.statusText}`);
			}

			const data = await response.json();
			
			// Convert Anthropic response format to OpenAI format for consistency
			return json({
				choices: [{
					message: {
						content: data.content[0].text,
						role: 'assistant'
					}
				}]
			});
		}

		// Fallback: Enhanced rule-based responses
		const userMessage = messages[messages.length - 1]?.content?.toLowerCase() || '';
		const fallbackResponse = getFallbackResponse(userMessage);

		return json({
			choices: [{
				message: {
					content: fallbackResponse,
					role: 'assistant'
				}
			}]
		});

	} catch (error) {
		console.error('Chat API error:', error);
		
		// Return fallback response on error
		return json({
			choices: [{
				message: {
					content: "I'm here to help with FAIT services! I can assist with cleaning, handyman work, gardening, moving, pricing, and booking. You can also contact our team at Admin@itsfait.com or 720-926-7341. What would you like to know?",
					role: 'assistant'
				}
			}]
		});
	}
};

function getFallbackResponse(message: string): string {
	// Enhanced fallback responses with FAIT-specific information
	if (message.includes('clean')) {
		return 'Our professional cleaning services start at $80-150 depending on your home size and cleaning type. We offer deep cleaning, regular maintenance, and move-in/out cleaning. All our cleaning professionals are vetted, background-checked, and insured. Would you like to book a cleaning service or get a custom quote? What size is your home?';
	}
	
	if (message.includes('handyman') || message.includes('repair') || message.includes('fix')) {
		return 'Our handyman services are $45-75 per hour for repairs, installations, furniture assembly, and minor electrical/plumbing work. All our handymen are licensed, insured, and background-checked. Same-day availability is often possible. What type of work do you need done?';
	}
	
	if (message.includes('garden') || message.includes('lawn') || message.includes('landscape')) {
		return 'Our gardening and landscaping services are $40-80 per hour for lawn care, maintenance, seasonal cleanup, and plant care. Weather-dependent scheduling with advance booking recommended. All our gardeners are experienced and insured. What gardening work do you need help with?';
	}
	
	if (message.includes('mov') || message.includes('relocat')) {
		return 'Our moving services start at $100 per hour for 2 professional movers. We handle local and long-distance moves, plus packing services. All movers are background-checked and insured. 1-2 weeks advance notice is recommended for best availability. When are you planning to move and what size home?';
	}
	
	if (message.includes('price') || message.includes('cost') || message.includes('how much')) {
		return 'Our transparent pricing: Cleaning $80-150, Handyman $45-75/hr, Gardening $40-80/hr, Moving $100+/hr for 2 movers. All professionals are vetted and insured. Exact pricing depends on your specific needs and location. Which service are you interested in for a more detailed quote?';
	}
	
	if (message.includes('book') || message.includes('schedule') || message.includes('hire')) {
		return 'Booking with FAIT is easy! 1) Tell us what service you need 2) Choose your preferred date/time 3) Provide project details 4) We match you with a qualified, vetted professional. Most services can be booked same-day or next-day. Which service would you like to book?';
	}
	
	if (message.includes('safe') || message.includes('insur') || message.includes('trust')) {
		return 'Safety and trust are our top priorities! All FAIT professionals are thoroughly vetted, background-checked, and fully insured. We guarantee quality service and your peace of mind. Founded by Ray Kinne and Kelli Trainer, we\'re committed to connecting you with only the most reliable professionals. What service can we help you with?';
	}
	
	if (message.includes('contact') || message.includes('phone') || message.includes('email') || message.includes('speak')) {
		return 'You can reach our team at Admin@itsfait.com or call 720-926-7341 (Monday-Friday, 9AM-6PM EST). For immediate assistance, I\'m here 24/7 to help with service information, pricing, and booking! What specific question can I help you with right now?';
	}
	
	// Default response
	return 'Welcome to FAIT! I can help you find trusted, vetted professionals for cleaning, handyman work, gardening, moving, and more. All our professionals are background-checked and insured. I can provide pricing information, help with booking, or answer any questions about our services. What can I help you with today?';
}
