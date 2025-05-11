import React from 'react';
import { Conversation } from '../../types/communication';
import { Button } from '../../../core/components/ui/Button';
import { LoadingSpinner } from '../../../core/components/common/LoadingSpinner';

export interface ConversationListProps {
  conversations: Conversation[];
  selectedConversation: Conversation | null;
  isLoading: boolean;
  error: string | null;
  onSelectConversation: (conversation: Conversation) => void;
  onCreateConversation: () => void;
}

/**
 * ConversationList component for displaying a list of conversations
 */
export const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  selectedConversation,
  isLoading,
  error,
  onSelectConversation,
  onCreateConversation,
}) => {
  // Format date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // If the date is today, show the time
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // If the date is yesterday, show "Yesterday"
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    
    // If the date is this year, show the month and day
    if (date.getFullYear() === now.getFullYear()) {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
    
    // Otherwise, show the full date
    return date.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });
  };

  // Get conversation title
  const getConversationTitle = (conversation: Conversation): string => {
    if (conversation.title) {
      return conversation.title;
    }
    
    // If no title, use participant names
    return conversation.participants
      .map(participant => `${participant.firstName} ${participant.lastName}`)
      .join(', ');
  };

  // Get last message preview
  const getLastMessagePreview = (conversation: Conversation): string => {
    if (!conversation.lastMessage) {
      return 'No messages yet';
    }
    
    return conversation.lastMessage.content.length > 30
      ? `${conversation.lastMessage.content.substring(0, 30)}...`
      : conversation.lastMessage.content;
  };

  if (isLoading && conversations.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <LoadingSpinner size="lg" message="Loading conversations..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded mb-4">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">Messages</h2>
          <Button size="sm" onClick={onCreateConversation}>
            New Message
          </Button>
        </div>
      </div>
      
      {conversations.length === 0 ? (
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <p className="text-gray-500 mb-4">No conversations yet</p>
            <Button onClick={onCreateConversation}>Start a Conversation</Button>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          {conversations.map((conversation) => (
            <div
              key={conversation.id}
              className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
                selectedConversation?.id === conversation.id ? 'bg-blue-50' : ''
              }`}
              onClick={() => onSelectConversation(conversation)}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {getConversationTitle(conversation)}
                    </h3>
                    <span className="text-xs text-gray-500">
                      {conversation.lastMessage
                        ? formatDate(conversation.lastMessage.createdAt)
                        : formatDate(conversation.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 truncate">
                    {getLastMessagePreview(conversation)}
                  </p>
                </div>
                
                {conversation.unreadCount > 0 && (
                  <div className="ml-2 bg-blue-500 text-white text-xs font-medium rounded-full h-5 w-5 flex items-center justify-center">
                    {conversation.unreadCount}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
