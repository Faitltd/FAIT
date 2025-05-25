<script lang="ts">
  import { onMount } from 'svelte';
  import { auth } from '$lib/stores/auth';
  import { messages } from '$lib/stores/messages';
  import type { Conversation, Message } from '$lib/stores/messages';
  import Button from '$lib/components/ui/Button.svelte';
  import Card from '$lib/components/ui/Card.svelte';
  
  let selectedConversation: Conversation | null = null;
  let newMessage = '';
  let isLoading = true;
  let error = null;
  
  // Load user conversations
  onMount(async () => {
    if ($auth.user) {
      isLoading = true;
      error = null;
      
      const result = await messages.loadUserConversations($auth.user.id);
      
      isLoading = false;
      
      if (!result.success) {
        error = result.error || 'Failed to load conversations';
      }
    }
  });
  
  // Select conversation
  async function selectConversation(conversation: Conversation) {
    selectedConversation = conversation;
    
    // Load conversation messages
    const result = await messages.loadConversationMessages(conversation.id);
    
    if (!result.success) {
      error = result.error || 'Failed to load messages';
    } else if ($auth.user) {
      // Mark messages as read
      await messages.markMessagesAsRead(conversation.id, $auth.user.id);
    }
  }
  
  // Send message
  async function sendMessage() {
    if (!newMessage.trim() || !selectedConversation || !$auth.user) return;
    
    // Get recipient
    const recipient = selectedConversation.participants.find(p => p.id !== $auth.user?.id);
    
    if (!recipient) return;
    
    // Send message
    const result = await messages.sendMessage({
      conversationId: selectedConversation.id,
      senderId: $auth.user.id,
      senderName: $auth.user.name,
      recipientId: recipient.id,
      recipientName: recipient.name,
      content: newMessage
    });
    
    if (result.success) {
      newMessage = '';
    } else {
      error = result.error || 'Failed to send message';
    }
  }
  
  // Format date
  function formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date >= today) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (date >= yesterday) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  }
  
  // Get other participant
  function getOtherParticipant(conversation: Conversation): { id: string; name: string } {
    const otherParticipant = conversation.participants.find(p => p.id !== $auth.user?.id);
    return otherParticipant || { id: '', name: 'Unknown' };
  }
</script>

<svelte:head>
  <title>Messages - FAIT</title>
  <meta name="description" content="Chat with service providers and clients on the FAIT platform." />
</svelte:head>

<section class="bg-fait-light py-8">
  <div class="container-custom">
    <h1 class="text-3xl font-ivy font-bold text-fait-dark mb-6">Messages</h1>
    
    {#if isLoading}
      <div class="bg-white rounded-lg shadow-md p-8 text-center">
        <p class="text-gray-600">Loading conversations...</p>
      </div>
    {:else if error}
      <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
        <p>{error}</p>
      </div>
    {:else}
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Conversations List -->
        <div class="lg:col-span-1">
          <Card variant="elevated" padding="none">
            <div class="p-4 border-b border-gray-200">
              <h2 class="font-bold">Conversations</h2>
            </div>
            
            {#if $messages.conversations.length === 0}
              <div class="p-6 text-center text-gray-500">
                <p>No conversations yet</p>
              </div>
            {:else}
              <div class="divide-y divide-gray-100">
                {#each $messages.conversations as conversation}
                  <button 
                    class="w-full text-left p-4 hover:bg-gray-50 transition-colors {selectedConversation?.id === conversation.id ? 'bg-gray-50' : ''}"
                    on:click={() => selectConversation(conversation)}
                  >
                    <div class="flex items-center">
                      <div class="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 mr-3">
                        {getOtherParticipant(conversation).name.charAt(0)}
                      </div>
                      
                      <div class="flex-1 min-w-0">
                        <div class="flex justify-between">
                          <h3 class="font-medium truncate">{getOtherParticipant(conversation).name}</h3>
                          <span class="text-xs text-gray-500">{formatDate(conversation.lastMessage.createdAt)}</span>
                        </div>
                        
                        <div class="flex items-center">
                          <p class="text-sm text-gray-600 truncate {conversation.unreadCount > 0 ? 'font-medium' : ''}">
                            {conversation.lastMessage.senderId === $auth.user?.id ? 'You: ' : ''}
                            {conversation.lastMessage.content}
                          </p>
                          
                          {#if conversation.unreadCount > 0}
                            <span class="ml-2 w-5 h-5 bg-fait-blue rounded-full text-white text-xs flex items-center justify-center">
                              {conversation.unreadCount}
                            </span>
                          {/if}
                        </div>
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
          {#if selectedConversation}
            <Card variant="elevated" padding="none" class="flex flex-col h-[600px]">
              <!-- Conversation Header -->
              <div class="p-4 border-b border-gray-200 flex items-center">
                <div class="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 mr-3">
                  {getOtherParticipant(selectedConversation).name.charAt(0)}
                </div>
                <div>
                  <h2 class="font-bold">{getOtherParticipant(selectedConversation).name}</h2>
                </div>
              </div>
              
              <!-- Messages List -->
              <div class="flex-1 overflow-y-auto p-4 space-y-4">
                {#if $messages.messages.length === 0}
                  <div class="text-center text-gray-500 py-8">
                    <p>No messages yet</p>
                    <p class="text-sm mt-1">Start the conversation by sending a message</p>
                  </div>
                {:else}
                  {#each $messages.messages as message}
                    <div class="flex {message.senderId === $auth.user?.id ? 'justify-end' : 'justify-start'}">
                      <div class="max-w-[75%] {message.senderId === $auth.user?.id ? 'bg-fait-blue text-white' : 'bg-gray-100 text-gray-800'} rounded-lg px-4 py-2">
                        <p>{message.content}</p>
                        <p class="text-xs {message.senderId === $auth.user?.id ? 'text-blue-100' : 'text-gray-500'} text-right mt-1">
                          {formatDate(message.createdAt)}
                        </p>
                      </div>
                    </div>
                  {/each}
                {/if}
              </div>
              
              <!-- Message Input -->
              <div class="p-4 border-t border-gray-200">
                <form on:submit|preventDefault={sendMessage} class="flex space-x-2">
                  <input 
                    type="text" 
                    bind:value={newMessage} 
                    placeholder="Type a message..." 
                    class="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-fait-blue"
                  />
                  <Button type="submit" variant="primary" disabled={!newMessage.trim()}>Send</Button>
                </form>
              </div>
            </Card>
          {:else}
            <Card variant="elevated" padding="lg" class="h-[600px] flex items-center justify-center">
              <div class="text-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                <h2 class="text-xl font-bold text-gray-700 mb-2">Your Messages</h2>
                <p class="text-gray-500 mb-4">Select a conversation to view messages</p>
              </div>
            </Card>
          {/if}
        </div>
      </div>
    {/if}
  </div>
</section>
