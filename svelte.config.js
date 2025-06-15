import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://kit.svelte.dev/docs/integrations#preprocessors
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	kit: {
		// adapter-auto only supports some environments, see https://kit.svelte.dev/docs/adapter-auto for a list.
		// If your environment is not supported or you settled on a specific environment, switch out the adapter.
		// See https://kit.svelte.dev/docs/adapters for more information about adapters.
		adapter: adapter(),
		
		// Configure aliases for easier imports
		alias: {
			$components: 'src/components',
			$lib: 'src/lib',
			$utils: 'src/utils',
			$types: 'src/types',
			$services: 'src/services',
			$stores: 'src/lib/stores'
		},

		// Configure CSP for security
		csp: {
			mode: 'auto',
			directives: {
				'script-src': ['self', 'unsafe-inline', 'unsafe-eval', 'https://js.stripe.com', 'https://maps.googleapis.com'],
				'style-src': ['self', 'unsafe-inline', 'https://fonts.googleapis.com'],
				'font-src': ['self', 'https://fonts.gstatic.com'],
				'img-src': ['self', 'data:', 'https:', 'blob:'],
				'connect-src': ['self', 'https://*.supabase.co', 'https://api.stripe.com', 'wss://*.supabase.co']
			}
		},

		// Configure service worker
		serviceWorker: {
			register: true
		},

		// Configure prerendering for better performance
		prerender: {
			handleHttpError: 'warn',
			handleMissingId: 'warn',
			entries: [
				'/',
				'/about',
				'/services',
				'/contact',
				'/privacy',
				'/terms'
			]
		}
	}
};

export default config;
