<script lang="ts">
  import { onMount } from 'svelte';
  import { auth } from '$lib/stores/auth';
  import { messaging } from '$lib/stores/messaging';
  import Button from '$lib/components/ui/Button.svelte';
  import Card from '$lib/components/ui/Card.svelte';
  import { fade } from 'svelte/transition';
  
  // Props
  export let bookingId: string;
  export let providerId: string;
  export let clientId: string;
  
  // State
  let message = '';
  let isLoading = true;
  let error: string | null = null;
  let conversationId: string | null = null;
  
  // Initialize on mount
  onMount(async () => {
    try {
      isLoading = true;
      
      // Get or create conversation for this booking
      const result = await messaging.getOrCreateConversationForBooking(
        bookingId,
        providerId,
        clientId
      );
      
      if (result.success) {
        conversationId = result.conversation.id;
        
        // Load messages
        await messaging.loadMessages(conversationId);
      }
      
      isLoading = false;
    } catch (err) {
      console.error('Failed to load conversation:', err);
      error = err instanceof Error ? err.message : 'Failed to load conversation';
      isLoading = false;
    }
  });
  
  // Format date
  function formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // If today, show time
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // If yesterday, show "Yesterday"
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    
    // Otherwise, show date
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }
  
  // Send message
  async function sendMessage() {
    if (!message.trim() || !conversationId) return;
    
    await messaging.sendMessage(conversationId, message);
    
    // Clear message input
    message = '';
  }
  
  // Handle keydown in message input
  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  }
</script>

<Card variant="default" padding="md" class="booking-chat {$$props.class || ''}">
  <h3 class="text-lg font-bold mb-4">Messages</h3>
  
  {#if isLoading}
    <div class="flex justify-center items-center py-4">
      <div class="spinner"></div>
    </div>
  {:else if error}
    <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" in:fade>
      <p>{error}</p>
    </div>
  {:else}
    <!-- Messages list -->
    <div class="h-64 overflow-y-auto mb-4 space-y-4 border border-gray-200 rounded-md p-3">
      {#if $messaging.currentMessages.length === 0}
        <div class="text-center py-8">
          <p class="text-gray-600">No messages yet. Send a message to start the conversation.</p>
        </div>
      {:else}
        {#each $messaging.currentMessages as message}
          <div class="flex {message.senderId === $auth.user?.id ? 'justify-end' : 'justify-start'}">
            <div 
              class="max-w-[75%] rounded-lg px-4 py-2 {message.senderId === $auth.user?.id ? 'bg-fait-blue text-white' : 'bg-gray-100 text-gray-800'}"
              in:fade={{ duration: 150 }}
            >
              <p>{message.content}</p>
              <p class="text-xs {message.senderId === $auth.user?.id ? 'text-blue-100' : 'text-gray-500'} text-right mt-1">
                {formatDate(message.createdAt)}
              </p>
            </div>
          </div>
        {/each}
      {/if}
    </div>
    
    <!-- Message input -->
    <div class="flex space-x-2">
      <textarea
        bind:value={message}
        on:keydown={handleKeydown}
        placeholder="Type a message..."
        class="flex-grow px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-fait-blue resize-none"
        rows="2"
      ></textarea>
      <Button 
        variant="primary" 
        on:click={sendMessage}
        disabled={!message.trim() || $messaging.isLoading}
      >
        Send
      </Button>
    </div>
    
    <div class="mt-4 text-center">
      <a href="/messages" class="text-fait-blue hover:underline">View all messages</a>
    </div>
  {/if}
</Card>
