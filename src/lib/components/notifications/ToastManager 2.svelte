<script lang="ts">
  import { writable } from 'svelte/store';
  import Toast from './Toast.svelte';
  
  // Define toast interface
  interface ToastItem {
    id: string;
    type: 'info' | 'success' | 'warning' | 'error';
    title: string;
    message: string;
    duration?: number;
    showClose?: boolean;
  }
  
  // Create toast store
  export const toasts = writable<ToastItem[]>([]);
  
  // Add toast
  export function addToast(toast: Omit<ToastItem, 'id'>) {
    const id = Math.random().toString(36).substring(2, 9);
    toasts.update(items => [...items, { ...toast, id }]);
    return id;
  }
  
  // Remove toast
  export function removeToast(id: string) {
    toasts.update(items => items.filter(item => item.id !== id));
  }
  
  // Show success toast
  export function showSuccess(title: string, message: string, duration = 5000) {
    return addToast({ type: 'success', title, message, duration });
  }
  
  // Show info toast
  export function showInfo(title: string, message: string, duration = 5000) {
    return addToast({ type: 'info', title, message, duration });
  }
  
  // Show warning toast
  export function showWarning(title: string, message: string, duration = 5000) {
    return addToast({ type: 'warning', title, message, duration });
  }
  
  // Show error toast
  export function showError(title: string, message: string, duration = 5000) {
    return addToast({ type: 'error', title, message, duration });
  }
</script>

<div class="fixed bottom-0 right-0 z-50 p-4 space-y-4">
  {#each $toasts as toast (toast.id)}
    <Toast 
      type={toast.type} 
      title={toast.title} 
      message={toast.message} 
      duration={toast.duration || 5000} 
      showClose={toast.showClose !== false}
      on:close={() => removeToast(toast.id)}
    />
  {/each}
</div>
