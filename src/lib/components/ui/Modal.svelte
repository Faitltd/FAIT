<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { fade, scale } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';

	export let isOpen = false;
	export let title = '';
	export let size: 'sm' | 'md' | 'lg' | 'xl' = 'md';
	export let closeOnBackdrop = true;
	export let showCloseButton = true;

	const dispatch = createEventDispatcher();

	$: sizeClasses = {
		sm: 'max-w-md',
		md: 'max-w-lg',
		lg: 'max-w-2xl',
		xl: 'max-w-4xl'
	};

	function handleBackdropClick(event: MouseEvent) {
		if (closeOnBackdrop && event.target === event.currentTarget) {
			close();
		}
	}

	function close() {
		dispatch('close');
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape' && isOpen) {
			close();
		}
	}
</script>

<svelte:window on:keydown={handleKeydown} />

{#if isOpen}
	<!-- Backdrop -->
	<div
		class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
		on:click={handleBackdropClick}
		transition:fade={{ duration: 200 }}
	>
		<!-- Modal -->
		<div
			class="bg-white rounded-lg shadow-xl w-full {sizeClasses[size]} max-h-[90vh] overflow-hidden"
			transition:scale={{ duration: 200, easing: quintOut }}
		>
			<!-- Header -->
			{#if title || showCloseButton}
				<div class="flex items-center justify-between p-6 border-b border-gray-200">
					{#if title}
						<h2 class="text-xl font-semibold text-gray-900">{title}</h2>
					{:else}
						<div></div>
					{/if}
					
					{#if showCloseButton}
						<button
							type="button"
							class="text-gray-400 hover:text-gray-600 transition-colors"
							on:click={close}
						>
							<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
							</svg>
						</button>
					{/if}
				</div>
			{/if}

			<!-- Content -->
			<div class="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
				<slot />
			</div>
		</div>
	</div>
{/if}
