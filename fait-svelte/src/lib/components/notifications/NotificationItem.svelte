<script lang="ts">
  import { fly, fade } from 'svelte/transition';
  import { notifications, type Notification } from '$lib/stores/notifications';
  
  export let notification: Notification;
  
  // Icon mapping based on notification type
  const icons = {
    success: `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>`,
    error: `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>`,
    warning: `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>`,
    info: `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>`
  };
  
  // Background color based on notification type
  const bgColors = {
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    warning: 'bg-yellow-50 border-yellow-200',
    info: 'bg-blue-50 border-blue-200'
  };
  
  // Text color based on notification type
  const textColors = {
    success: 'text-green-800',
    error: 'text-red-800',
    warning: 'text-yellow-800',
    info: 'text-blue-800'
  };
  
  // Icon color based on notification type
  const iconColors = {
    success: 'text-green-500',
    error: 'text-red-500',
    warning: 'text-yellow-500',
    info: 'text-blue-500'
  };
  
  // Dismiss the notification
  function dismiss() {
    notifications.remove(notification.id);
  }
</script>

<div
  in:fly={{ y: 20, duration: 300 }}
  out:fade={{ duration: 200 }}
  class={`flex items-start p-4 mb-3 rounded-lg border ${bgColors[notification.type]} shadow-md`}
  role="alert"
>
  <div class={`flex-shrink-0 ${iconColors[notification.type]}`}>
    {@html icons[notification.type]}
  </div>
  
  <div class="ml-3 flex-1">
    {#if notification.title}
      <h3 class={`text-sm font-medium ${textColors[notification.type]}`}>
        {notification.title}
      </h3>
    {/if}
    
    <div class={`text-sm ${textColors[notification.type]} ${notification.title ? 'mt-1' : ''}`}>
      {notification.message}
    </div>
  </div>
  
  {#if notification.dismissible}
    <button
      on:click={dismiss}
      class={`ml-auto -mx-1.5 -my-1.5 ${bgColors[notification.type]} ${textColors[notification.type]} rounded-lg focus:ring-2 focus:ring-blue-400 p-1.5 inline-flex h-8 w-8 hover:bg-opacity-75`}
      aria-label="Dismiss"
    >
      <span class="sr-only">Dismiss</span>
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
      </svg>
    </button>
  {/if}
</div>
