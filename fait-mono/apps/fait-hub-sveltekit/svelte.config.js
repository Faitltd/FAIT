import adapterAuto from '@sveltejs/adapter-auto';
import adapterStatic from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

// Determine if we're building for Firebase Hosting
const isFirebase = process.env.FIREBASE_HOSTING === 'true';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://kit.svelte.dev/docs/integrations#preprocessors
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	kit: {
		// Use static adapter for Firebase Hosting, auto adapter for other environments
		adapter: isFirebase
			? adapterStatic({
				// Static adapter options
				pages: 'build',
				assets: 'build',
				fallback: 'index.html',
				precompress: false,
				strict: true
			})
			: adapterAuto(),
		alias: {
			'$lib': './src/lib',
			'$components': './src/lib/components',
			'$utils': './src/lib/utils'
		}
	}
};

export default config;
