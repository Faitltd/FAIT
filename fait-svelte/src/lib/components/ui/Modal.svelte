<script lang="ts">
  import { createEventDispatcher, onMount, onDestroy } from 'svelte';
  import { fade, scale } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';
  import { trapFocus, announce, createAriaId } from '$lib/utils/accessibility';

  // Props
  export let open = false;
  export let title = '';
  export let closeOnEscape = true;
  export let closeOnOutsideClick = true;
  export let showCloseButton = true;
  export let size: 'sm' | 'md' | 'lg' | 'xl' = 'md';
  export let ariaLabelledBy = '';
  export let ariaDescribedBy = '';

  // Local state
  let modalElement: HTMLDivElement;
  let previouslyFocusedElement: HTMLElement | null = null;
  let removeFocusTrap: (() => void) | null = null;

  // Generate IDs for ARIA attributes if not provided
  const titleId = ariaLabelledBy || createAriaId('modal-title');
  const descriptionId = ariaDescribedBy || createAriaId('modal-description');

  // Event dispatcher
  const dispatch = createEventDispatcher();

  // Handle close
  function close() {
    dispatch('close');
  }

  // Handle keydown
  function handleKeydown(event: KeyboardEvent) {
    if (closeOnEscape && event.key === 'Escape' && open) {
      close();
    }
  }

  // Handle outside click
  function handleOutsideClick(event: MouseEvent) {
    if (closeOnOutsideClick && event.target === event.currentTarget && open) {
      close();
    }
  }

  // Handle modal opening
  function handleOpen() {
    // Save the currently focused element
    previouslyFocusedElement = document.activeElement as HTMLElement;

    // Prevent body scrolling
    document.body.style.overflow = 'hidden';

    // Announce to screen readers
    announce(`Dialog opened: ${title}`, true);

    // Trap focus inside the modal
    if (modalElement) {
      removeFocusTrap = trapFocus(modalElement);
    }
  }

  // Handle modal closing
  function handleClose() {
    // Restore body scrolling
    document.body.style.overflow = '';

    // Announce to screen readers
    announce('Dialog closed', false);

    // Remove focus trap
    if (removeFocusTrap) {
      removeFocusTrap();
      removeFocusTrap = null;
    }

    // Restore focus to the previously focused element
    if (previouslyFocusedElement && 'focus' in previouslyFocusedElement) {
      previouslyFocusedElement.focus();
    }
  }

  // Set up event listeners
  onMount(() => {
    document.addEventListener('keydown', handleKeydown);

    // Handle initial open state
    if (open) {
      handleOpen();
    }
  });

  // Clean up event listeners
  onDestroy(() => {
    document.removeEventListener('keydown', handleKeydown);

    // Clean up if modal is still open
    if (open) {
      handleClose();
    }
  });

  // Watch for changes to open state
  $: {
    if (typeof document !== 'undefined') {
      if (open) {
        handleOpen();
      } else if (previouslyFocusedElement) {
        handleClose();
      }
    }
  }

  // Compute size classes
  $: sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl'
  };
</script>

{#if open}
  <!-- Backdrop -->
  <div
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
    on:click={handleOutsideClick}
    on:keydown={handleKeydown}
    role="presentation"
    transition:fade={{ duration: 200 }}
  >
    <!-- Modal dialog -->
    <div
      bind:this={modalElement}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      class="bg-white rounded-lg shadow-xl w-full {sizeClasses[size]} overflow-hidden"
      transition:scale={{ duration: 200, easing: quintOut, start: 0.95 }}
    >
      <!-- Header -->
      {#if title || showCloseButton}
        <div class="flex justify-between items-center p-4 border-b border-gray-200">
          {#if title}
            <h3 id={titleId} class="text-lg font-medium text-gray-900">{title}</h3>
          {:else}
            <div></div>
          {/if}

          {#if showCloseButton}
            <button
              type="button"
              class="text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-fait-blue focus:ring-offset-2 rounded-full p-1"
              on:click={close}
              aria-label="Close dialog"
            >
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          {/if}
        </div>
      {/if}

      <!-- Content -->
      <div id={descriptionId} class="p-4">
        <slot />
      </div>

      <!-- Footer -->
      <slot name="footer">
        <!-- Optional footer content -->
      </slot>
    </div>
  </div>
{/if}
