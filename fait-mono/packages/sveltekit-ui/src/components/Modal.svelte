<script lang="ts">
  import { fade, scale } from 'svelte/transition';
  import { X } from 'lucide-svelte';
  import { createEventDispatcher, onMount } from 'svelte';
  
  export let open = false;
  export let title: string | undefined = undefined;
  export let closeOnEscape = true;
  export let closeOnOutsideClick = true;
  export let showCloseButton = true;
  export let size: 'sm' | 'md' | 'lg' | 'xl' | 'full' = 'md';
  
  const dispatch = createEventDispatcher();
  
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-full mx-4'
  };
  
  function close() {
    dispatch('close');
    open = false;
  }
  
  function handleKeydown(e: KeyboardEvent) {
    if (closeOnEscape && e.key === 'Escape' && open) {
      close();
    }
  }
  
  function handleOutsideClick(e: MouseEvent) {
    if (closeOnOutsideClick && (e.target as HTMLElement).classList.contains('modal-backdrop')) {
      close();
    }
  }
  
  onMount(() => {
    document.addEventListener('keydown', handleKeydown);
    
    return () => {
      document.removeEventListener('keydown', handleKeydown);
    };
  });
</script>

{#if open}
  <div 
    class="fixed inset-0 z-50 overflow-y-auto"
    aria-labelledby={title ? 'modal-title' : undefined}
    role="dialog"
    aria-modal="true"
  >
    <!-- Backdrop -->
    <div 
      class="fixed inset-0 bg-black bg-opacity-50 modal-backdrop"
      transition:fade={{ duration: 200 }}
      on:click={handleOutsideClick}
    ></div>
    
    <!-- Modal -->
    <div class="flex items-center justify-center min-h-screen p-4">
      <div 
        class="bg-white rounded-lg shadow-xl w-full {sizeClasses[size]} relative"
        transition:scale={{ duration: 200, start: 0.95 }}
      >
        {#if title || showCloseButton}
          <div class="flex justify-between items-center p-4 border-b border-gray-200">
            {#if title}
              <h3 id="modal-title" class="text-lg font-medium text-gray-900">{title}</h3>
            {:else}
              <div></div>
            {/if}
            
            {#if showCloseButton}
              <button
                type="button"
                class="text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                on:click={close}
                aria-label="Close"
              >
                <X class="w-5 h-5" />
              </button>
            {/if}
          </div>
        {/if}
        
        <div class="p-4">
          <slot />
        </div>
        
        {#if $$slots.footer}
          <div class="px-4 py-3 bg-gray-50 border-t border-gray-200 rounded-b-lg">
            <slot name="footer" />
          </div>
        {/if}
      </div>
    </div>
  </div>
{/if}
