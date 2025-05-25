import React, { useState } from 'react';
import { PageLayout } from '../modules/core/components/layout/PageLayout';
import { ConversationList } from '../modules/communication/components/messaging/ConversationList';
import { MessageThread } from '../modules/communication/components/messaging/MessageThread';
import { useMessaging } from '../modules/communication/hooks/useMessaging';
import { Conversation } from '../modules/communication/types/communication';
import { LoadingSpinner } from '../modules/core/components/common/LoadingSpinner';

/**
 * MessagingPage component for displaying and managing messages
 */
const MessagingPage: React.FC = () => {
  const {
    conversations,
    selectedConversation,
    messages,
    isLoadingConversations,
    isLoadingMessages,
    error,
    selectConversation,
    sendMessage,
  } = useMessaging();

  const [isCreatingConversation, setIsCreatingConversation] = useState(false);

  // Handle conversation selection
  const handleSelectConversation = (conversation: Conversation) => {
    selectConversation(conversation);
  };

  // Handle create conversation
  const handleCreateConversation = () => {
    setIsCreatingConversation(true);
  };

  // Handle message sending
  const handleSendMessage = async (message: string) => {
    if (!message.trim()) return;
    
    try {
      await sendMessage(message);
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  return (
    <PageLayout
      title="Messages"
      description="Communicate with clients and service agents"
    >
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-3 h-[calc(100vh-200px)]">
          <div className="border-r">
            <ConversationList
              conversations={conversations}
              selectedConversation={selectedConversation}
              isLoading={isLoadingConversations}
              error={error}
              onSelectConversation={handleSelectConversation}
              onCreateConversation={handleCreateConversation}
            />
          </div>
          
          <div className="md:col-span-2">
            {selectedConversation ? (
              <MessageThread
                conversationId={selectedConversation.id}
                onSendMessage={handleSendMessage}
              />
            ) : (
              <div className="h-full flex items-center justify-center p-4">
                <div className="text-center">
                  <p className="text-gray-500">
                    Select a conversation to start messaging
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default MessagingPage;
