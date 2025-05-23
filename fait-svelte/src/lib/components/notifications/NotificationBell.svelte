<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { writable } from 'svelte/store';
  import { fade, fly } from 'svelte/transition';
  import { auth } from '$lib/stores/auth';
  import { bookings } from '$lib/stores/bookings';
  
  // Notification store
  const notifications = writable<Notification[]>([]);
  
  // Notification type
  interface Notification {
    id: string;
    type: 'booking' | 'message' | 'system';
    title: string;
    message: string;
    read: boolean;
    createdAt: string;
    link?: string;
  }
  
  // Local state
  let isOpen = false;
  let unreadCount = 0;
  let interval: number | null = null;
  
  // Toggle dropdown
  function toggleDropdown() {
    isOpen = !isOpen;
  }
  
  // Close dropdown when clicking outside
  function handleClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const dropdown = document.getElementById('notification-dropdown');
    const bell = document.getElementById('notification-bell');
    
    if (dropdown && bell && !dropdown.contains(target) && !bell.contains(target)) {
      isOpen = false;
    }
  }
  
  // Mark notification as read
  function markAsRead(id: string) {
    notifications.update(items => {
      return items.map(item => {
        if (item.id === id) {
          return { ...item, read: true };
        }
        return item;
      });
    });
  }
  
  // Mark all as read
  function markAllAsRead() {
    notifications.update(items => {
      return items.map(item => ({ ...item, read: true }));
    });
  }
  
  // Remove notification
  function removeNotification(id: string) {
    notifications.update(items => items.filter(item => item.id !== id));
  }
  
  // Format relative time
  function formatRelativeTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffSecs < 60) {
      return 'just now';
    } else if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  }
  
  // Check for new notifications
  async function checkNotifications() {
    if (!$auth.isAuthenticated) return;
    
    // In a real app, this would call an API endpoint to get notifications
    // For now, we'll simulate by checking for pending bookings
    
    // Load bookings if not already loaded
    if ($bookings.bookings.length === 0) {
      await bookings.loadUserBookings();
    }
    
    // Create notifications for pending bookings
    const pendingBookings = $bookings.pendingBookings;
    
    if (pendingBookings.length > 0) {
      notifications.update(items => {
        // Filter out existing booking notifications
        const existingIds = items
          .filter(item => item.type === 'booking')
          .map(item => item.id);
        
        // Create new notifications for bookings not already in the list
        const newNotifications = pendingBookings
          .filter(booking => !existingIds.includes(booking.id))
          .map(booking => ({
            id: booking.id,
            type: 'booking' as const,
            title: 'Booking Update',
            message: `Your booking for ${booking.date} is pending confirmation.`,
            read: false,
            createdAt: booking.createdAt,
            link: `/bookings/${booking.id}`
          }));
        
        return [...items, ...newNotifications];
      });
    }
  }
  
  // Update unread count when notifications change
  notifications.subscribe(items => {
    unreadCount = items.filter(item => !item.read).length;
  });
  
  // Set up event listeners and initial check
  onMount(() => {
    document.addEventListener('click', handleClickOutside);
    
    // Check for notifications on mount
    checkNotifications();
    
    // Set up interval to check for notifications
    interval = window.setInterval(checkNotifications, 60000); // Check every minute
  });
  
  // Clean up event listeners and interval
  onDestroy(() => {
    document.removeEventListener('click', handleClickOutside);
    
    if (interval) {
      clearInterval(interval);
    }
  });
</script>

<div class="relative">
  <button
    id="notification-bell"
    class="relative p-1 rounded-full text-gray-600 hover:text-fait-blue focus:outline-none"
    on:click={toggleDropdown}
    aria-label="Notifications"
  >
    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
    
    {#if unreadCount > 0}
      <span class="absolute top-0 right-0 block h-4 w-4 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center">
        {unreadCount > 9 ? '9+' : unreadCount}
      </span>
    {/if}
  </button>
  
  {#if isOpen}
    <div
      id="notification-dropdown"
      class="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg py-1 z-10"
      transition:fly={{ y: -10, duration: 200 }}
    >
      <div class="px-4 py-2 border-b border-gray-200 flex justify-between items-center">
        <h3 class="font-medium">Notifications</h3>
        {#if unreadCount > 0}
          <button
            class="text-sm text-fait-blue hover:underline"
            on:click={markAllAsRead}
          >
            Mark all as read
          </button>
        {/if}
      </div>
      
      <div class="max-h-96 overflow-y-auto">
        {#if $notifications.length === 0}
          <div class="px-4 py-6 text-center text-gray-500">
            <p>No notifications</p>
          </div>
        {:else}
          {#each $notifications as notification (notification.id)}
            <div
              class="px-4 py-3 hover:bg-gray-50 border-b border-gray-100 {notification.read ? '' : 'bg-blue-50'}"
              transition:fade={{ duration: 200 }}
            >
              <div class="flex justify-between">
                <div class="flex-1">
                  <div class="flex items-start">
                    <div class="flex-shrink-0 mr-3">
                      {#if notification.type === 'booking'}
                        <div class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-500">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      {:else if notification.type === 'message'}
                        <div class="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-500">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                          </svg>
                        </div>
                      {:else}
                        <div class="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-500">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                      {/if}
                    </div>
                    
                    <div class="flex-1">
                      <p class="font-medium text-sm">{notification.title}</p>
                      <p class="text-sm text-gray-600">{notification.message}</p>
                      <p class="text-xs text-gray-500 mt-1">{formatRelativeTime(notification.createdAt)}</p>
                    </div>
                  </div>
                  
                  {#if notification.link}
                    <a
                      href={notification.link}
                      class="text-sm text-fait-blue hover:underline mt-2 inline-block"
                      on:click={() => markAsRead(notification.id)}
                    >
                      View Details
                    </a>
                  {/if}
                </div>
                
                <button
                  class="text-gray-400 hover:text-gray-600 ml-2"
                  on:click={() => removeNotification(notification.id)}
                  aria-label="Remove notification"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          {/each}
        {/if}
      </div>
      
      <div class="px-4 py-2 border-t border-gray-200 text-center">
        <a href="/notifications" class="text-sm text-fait-blue hover:underline">View All Notifications</a>
      </div>
    </div>
  {/if}
</div>
