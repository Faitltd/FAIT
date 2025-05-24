import React, { useState } from 'react';
import { Button } from '../../../core/components/ui/Button';
import { LoadingSpinner } from '../../../core/components/common/LoadingSpinner';

export interface MessageThreadProps {
  conversationId: string;
  onSendMessage?: (message: string) => Promise<void>;
}

export interface Message {
  id: string;
  content: string;
  senderId: string;
  createdAt: string;
  isCurrentUser: boolean;
}

/**
 * MessageThread component for displaying and sending messages
 */
export const MessageThread: React.FC<MessageThreadProps> = ({
  conversationId,
  onSendMessage,
}) => {
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Mock messages for demonstration
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Hello! How can I help you today?',
      senderId: 'service-agent-1',
      createdAt: '2023-06-15T10:30:00Z',
      isCurrentUser: false,
    },
    {
      id: '2',
      content: 'I have a question about my booking.',
      senderId: 'current-user',
      createdAt: '2023-06-15T10:32:00Z',
      isCurrentUser: true,
    },
    {
      id: '3',
      content: 'Sure, what would you like to know?',
      senderId: 'service-agent-1',
      createdAt: '2023-06-15T10:33:00Z',
      isCurrentUser: false,
    },
  ]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim()) {
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Send message
      await onSendMessage?.(newMessage);
      
      // Add message to thread (in a real app, this would come from the server)
      const newMessageObj: Message = {
        id: `temp-${Date.now()}`,
        content: newMessage,
        senderId: 'current-user',
        createdAt: new Date().toISOString(),
        isCurrentUser: true,
      };
      
      setMessages((prev) => [...prev, newMessageObj]);
      setNewMessage('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.isCurrentUser ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs md:max-w-md rounded-lg p-3 ${
                message.isCurrentUser
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              <p>{message.content}</p>
              <p className={`text-xs mt-1 ${
                message.isCurrentUser ? 'text-blue-100' : 'text-gray-500'
              }`}>
                {new Date(message.createdAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>
        ))}
        
        {error && (
          <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
      </div>
      
      <div className="border-t p-4">
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <Button
            type="submit"
            disabled={isLoading || !newMessage.trim()}
          >
            {isLoading ? <LoadingSpinner size="sm" /> : 'Send'}
          </Button>
        </form>
      </div>
    </div>
  );
};
