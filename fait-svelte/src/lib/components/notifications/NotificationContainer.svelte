<script lang="ts">
  import { notifications } from '$lib/stores/notifications';
  import NotificationItem from './NotificationItem.svelte';
  
  // Position of the notification container
  export let position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center' = 'top-right';
  
  // Position classes
  const positionClasses = {
    'top-right': 'fixed top-4 right-4 z-50',
    'top-left': 'fixed top-4 left-4 z-50',
    'bottom-right': 'fixed bottom-4 right-4 z-50',
    'bottom-left': 'fixed bottom-4 left-4 z-50',
    'top-center': 'fixed top-4 left-1/2 transform -translate-x-1/2 z-50',
    'bottom-center': 'fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50'
  };
</script>

<div class={`${positionClasses[position]} max-w-sm w-full flex flex-col`}>
  {#each $notifications as notification (notification.id)}
    <NotificationItem {notification} />
  {/each}
</div>
