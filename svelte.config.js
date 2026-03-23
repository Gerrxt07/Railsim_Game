import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

export default {
	// Consult https://svelte.dev/docs#compile-time-svelte-preprocess
	// for more information about preprocessors
	preprocess: vitePreprocess(),
	
	compilerOptions: {
		// Enable runes mode (Svelte 5)
		runes: true
	},

	vitePlugin: {
		// Improves dev startup by prebundling Svelte libraries
		prebundleSvelteLibraries: true
	}
};
