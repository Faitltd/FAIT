<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { auth } from '$lib/stores/auth';
  import { messaging } from '$lib/stores/messaging';
  import Button from '$lib/components/ui/Button.svelte';
  import Card from '$lib/components/ui/Card.svelte';
  import { fade, fly } from 'svelte/transition';
  
  // State
  let message = '';
  let isLoading = true;
  let error: string | null = null;
  
  // Initialize on mount
  onMount(async () => {
    // Check if user is authenticated
    await auth.checkAuth();
    
    if (!$auth.user) {
      // Redirect to login if not authenticated
      goto('/login');
      return;
    }
    
    try {
      isLoading = true;
      
      // Load conversations
      await messaging.loadConversations();
      
      isLoading = false;
    } catch (err) {
      console.error('Failed to load conversations:', err);
      error = err instanceof Error ? err.message : 'Failed to load conversations';
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
  
  // Get other participant name
  function getOtherParticipantName(participants: string[]): string {
    if (!$auth.user) return 'Unknown';
    
    const otherParticipantId = participants.find(id => id !== $auth.user?.id);
    
    // In a real app, you would fetch user details from a users store
    // For now, just return the ID
    return otherParticipantId || 'Unknown';
  }
  
  // Select conversation
  async function selectConversation(conversationId: string) {
    await messaging.loadMessages(conversationId);
  }
  
  // Send message
  async function sendMessage() {
    if (!message.trim() || !$messaging.currentConversation) return;
    
    await messaging.sendMessage($messaging.currentConversation, message);
    
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

<svelte:head>
  <title>Messages - FAIT</title>
  <meta name="description" content="View and send messages." />
</svelte:head>

<section class="bg-fait-light py-12">
  <div class="container-custom">
    <h1 class="text-3xl font-ivy font-bold text-fait-dark mb-6">Messages</h1>
    
    {#if isLoading}
      <div class="flex justify-center items-center py-12">
        <div class="spinner"></div>
      </div>
    {:else if error}
      <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6" in:fade>
        <p>{error}</p>
        <Button variant="secondary" size="sm" class="mt-2" on:click={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    {:else}
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Conversations list -->
        <div class="lg:col-span-1">
          <Card variant="default" padding="md">
            <h2 class="text-xl font-bold mb-4">Conversations</h2>
            
            {#if $messaging.conversations.length === 0}
              <div class="text-center py-8 bg-gray-50 rounded-md">
                <p class="text-gray-600">No conversations yet.</p>
              </div>
            {:else}
              <div class="space-y-2">
                {#each $messaging.conversations as conversation}
                  <button
                    class="w-full text-left p-3 rounded-md {$messaging.currentConversation === conversation.id ? 'bg-fait-blue text-white' : 'hover:bg-gray-100'}"
                    on:click={() => selectConversation(conversation.id)}
                  >
                    <div class="flex justify-between items-start">
                      <div>
                        <p class="font-medium">{getOtherParticipantName(conversation.participants)}</p>
                        <p class="text-sm {$messaging.currentConversation === conversation.id ? 'text-blue-100' : 'text-gray-600'} truncate">
                          {conversation.lastMessage || 'No messages yet'}
                        </p>
                      </div>
                      <div class="text-right">
                        <p class="text-xs {$messaging.currentConversation === conversation.id ? 'text-blue-100' : 'text-gray-500'}">
                          {formatDate(conversation.lastMessageTime)}
                        </p>
                        {#if conversation.unreadCount > 0}
                          <span class="inline-block mt-1 px-2 py-0.5 text-xs rounded-full bg-red-500 text-white">
                            {conversation.unreadCount}
                          </span>
                        {/if}
                      </div>
                    </div>
                  </button>
                {/each}
              </div>
            {/if}
          </Card>
        </div>
        
        <!-- Messages -->
        <div class="lg:col-span-2">
          <Card variant="elevated" padding="md" class="h-full flex flex-col">
            {#if !$messaging.currentConversation}
              <div class="flex-grow flex items-center justify-center">
                <p class="text-gray-600">Select a conversation to view messages.</p>
              </div>
            {:else if $messaging.isLoading}
              <div class="flex-grow flex items-center justify-center">
                <div class="spinner"></div>
              </div>
            {:else}
              <!-- Messages header -->
              <div class="border-b border-gray-200 pb-3 mb-3">
                <h3 class="text-lg font-bold">
                  {getOtherParticipantName($messaging.conversations.find(c => c.id === $messaging.currentConversation)?.participants || [])}
                </h3>
              </div>
              
              <!-- Messages list -->
              <div class="flex-grow overflow-y-auto mb-4 space-y-4">
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
              <div class="border-t border-gray-200 pt-3">
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
              </div>
            {/if}
          </Card>
        </div>
      </div>
    {/if}
  </div>
</section>
