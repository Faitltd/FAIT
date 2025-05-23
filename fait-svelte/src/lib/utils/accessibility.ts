/**
 * Accessibility utilities for keyboard navigation and focus management
 */

/**
 * Trap focus within an element
 * @param element The element to trap focus within
 * @returns A function to remove the trap
 */
export function trapFocus(element: HTMLElement): () => void {
  // Find all focusable elements
  const focusableElements = element.querySelectorAll(
    'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
  );
  
  if (focusableElements.length === 0) return () => {};
  
  const firstElement = focusableElements[0] as HTMLElement;
  const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
  
  // Focus the first element
  firstElement.focus();
  
  // Handle keydown events
  const handleKeyDown = (event: KeyboardEvent) => {
    // If Tab key is pressed
    if (event.key === 'Tab') {
      // If Shift + Tab is pressed and the active element is the first focusable element
      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      }
      // If Tab is pressed and the active element is the last focusable element
      else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }
    // If Escape key is pressed
    else if (event.key === 'Escape') {
      // Dispatch a custom event that can be listened for
      element.dispatchEvent(new CustomEvent('escape'));
    }
  };
  
  // Add event listener
  element.addEventListener('keydown', handleKeyDown);
  
  // Return a function to remove the trap
  return () => {
    element.removeEventListener('keydown', handleKeyDown);
  };
}

/**
 * Set focus to an element when it's mounted
 * @param node The element to focus
 * @param enabled Whether focus should be enabled
 * @returns An object with update and destroy methods
 */
export function focusOnMount(node: HTMLElement, enabled = true) {
  if (enabled) {
    // Set focus after a short delay to allow for animations
    const timeoutId = setTimeout(() => {
      node.focus();
    }, 50);
    
    return {
      update(newEnabled: boolean) {
        // If enabled changes, clear the timeout
        if (!newEnabled) {
          clearTimeout(timeoutId);
        }
      },
      destroy() {
        // Clean up
        clearTimeout(timeoutId);
      }
    };
  }
  
  return {};
}

/**
 * Announce a message to screen readers
 * @param message The message to announce
 * @param priority Whether the message is a priority announcement
 */
export function announce(message: string, priority = false): void {
  // Create or get the live region
  let liveRegion = document.getElementById(
    priority ? 'aria-live-assertive' : 'aria-live-polite'
  );
  
  // If the live region doesn't exist, create it
  if (!liveRegion) {
    liveRegion = document.createElement('div');
    liveRegion.id = priority ? 'aria-live-assertive' : 'aria-live-polite';
    liveRegion.setAttribute('aria-live', priority ? 'assertive' : 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.className = 'sr-only'; // Screen reader only
    document.body.appendChild(liveRegion);
  }
  
  // Set the message
  liveRegion.textContent = message;
  
  // Clear the message after a delay
  setTimeout(() => {
    liveRegion.textContent = '';
  }, 3000);
}

/**
 * Create a unique ID for ARIA attributes
 * @param prefix The prefix for the ID
 * @returns A unique ID
 */
export function createAriaId(prefix = 'aria'): string {
  return `${prefix}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Check if an element is visible to screen readers
 * @param element The element to check
 * @returns Whether the element is visible to screen readers
 */
export function isVisibleToScreenReader(element: HTMLElement): boolean {
  // Get computed style
  const style = window.getComputedStyle(element);
  
  // Check if the element is hidden
  if (
    element.hasAttribute('aria-hidden') && 
    element.getAttribute('aria-hidden') === 'true'
  ) {
    return false;
  }
  
  // Check if the element is visually hidden but still accessible
  if (
    element.classList.contains('sr-only') || 
    element.classList.contains('visually-hidden')
  ) {
    return true;
  }
  
  // Check if the element is hidden with CSS
  if (
    style.display === 'none' || 
    style.visibility === 'hidden' || 
    style.opacity === '0'
  ) {
    return false;
  }
  
  return true;
}

/**
 * Add skip link for keyboard navigation
 * @param targetId The ID of the target element to skip to
 * @param label The label for the skip link
 */
export function addSkipLink(targetId: string, label = 'Skip to content'): void {
  // Check if the skip link already exists
  if (document.getElementById('skip-link')) {
    return;
  }
  
  // Create the skip link
  const skipLink = document.createElement('a');
  skipLink.id = 'skip-link';
  skipLink.href = `#${targetId}`;
  skipLink.className = 'skip-link';
  skipLink.textContent = label;
  
  // Add styles
  skipLink.style.position = 'absolute';
  skipLink.style.top = '-40px';
  skipLink.style.left = '0';
  skipLink.style.padding = '8px 16px';
  skipLink.style.background = '#000';
  skipLink.style.color = '#fff';
  skipLink.style.zIndex = '9999';
  skipLink.style.transition = 'top 0.2s';
  
  // Add focus styles
  skipLink.addEventListener('focus', () => {
    skipLink.style.top = '0';
  });
  
  skipLink.addEventListener('blur', () => {
    skipLink.style.top = '-40px';
  });
  
  // Add to the document
  document.body.insertBefore(skipLink, document.body.firstChild);
  
  // Make sure the target element is focusable
  const targetElement = document.getElementById(targetId);
  if (targetElement && !targetElement.hasAttribute('tabindex')) {
    targetElement.setAttribute('tabindex', '-1');
  }
}
