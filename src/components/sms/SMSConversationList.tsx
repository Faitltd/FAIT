import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { smsService } from '../../services/SMSService';
import { formatDistanceToNow } from 'date-fns';
import { MessageSquare, Phone, User, Search } from 'lucide-react';

interface SMSConversationListProps {
  onSelectConversation: (phoneNumber: string) => void;
  selectedPhoneNumber?: string;
}

const SMSConversationList: React.FC<SMSConversationListProps> = ({
  onSelectConversation,
  selectedPhoneNumber
}) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!user) return;
    
    const fetchConversations = async () => {
      try {
        setLoading(true);
        const data = await smsService.getSMSConversations(user.id);
        setConversations(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching SMS conversations:', err);
        setError('Failed to load conversations');
      } finally {
        setLoading(false);
      }
    };
    
    fetchConversations();
    
    // Set up polling for new messages
    const intervalId = setInterval(fetchConversations, 30000); // Every 30 seconds
    
    return () => clearInterval(intervalId);
  }, [user]);

  const filteredConversations = conversations.filter(conv => 
    conv.phoneNumber.includes(searchTerm) || 
    (conv.lastMessageText && conv.lastMessageText.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSelectConversation = (phoneNumber: string, conversationId: string) => {
    onSelectConversation(phoneNumber);
    
    // Mark as read if it has unread messages
    const conversation = conversations.find(c => c.id === conversationId);
    if (conversation && conversation.unreadCount > 0) {
      smsService.markConversationAsRead(conversationId)
        .then(() => {
          // Update local state to reflect read status
          setConversations(prevConversations => 
            prevConversations.map(c => 
              c.id === conversationId ? { ...c, unreadCount: 0 } : c
            )
          );
        })
        .catch(err => console.error('Error marking conversation as read:', err));
    }
  };

  if (loading && conversations.length === 0) {
    return (
      <div className="flex flex-col h-full p-4 border-r border-gray-200">
        <div className="flex items-center justify-center h-full">
          <div className="animate-pulse text-gray-400">Loading conversations...</div>
        </div>
      </div>
    );
  }

  if (error && conversations.length === 0) {
    return (
      <div className="flex flex-col h-full p-4 border-r border-gray-200">
        <div className="flex flex-col items-center justify-center h-full text-red-500">
          <div className="mb-2">Error loading conversations</div>
          <button 
            className="px-4 py-2 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full border-r border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold mb-4">Messages</h2>
        <div className="relative">
          <input
            type="text"
            placeholder="Search conversations..."
            className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-4 text-gray-500">
            <MessageSquare className="h-12 w-12 mb-2 text-gray-300" />
            <p className="text-center">No conversations found</p>
            {searchTerm && (
              <button 
                className="mt-2 text-blue-500 hover:underline"
                onClick={() => setSearchTerm('')}
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {filteredConversations.map((conversation) => (
              <li 
                key={conversation.id}
                className={`hover:bg-gray-50 cursor-pointer ${
                  selectedPhoneNumber === conversation.phoneNumber ? 'bg-blue-50' : ''
                }`}
                onClick={() => handleSelectConversation(conversation.phoneNumber, conversation.id)}
              >
                <div className="flex items-start p-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <Phone className="h-5 w-5 text-gray-500" />
                    </div>
                  </div>
                  <div className="ml-3 flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {conversation.phoneNumber}
                      </p>
                      <p className="text-xs text-gray-500">
                        {conversation.lastMessageAt 
                          ? formatDistanceToNow(new Date(conversation.lastMessageAt), { addSuffix: true }) 
                          : ''}
                      </p>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-500 truncate">
                        {conversation.lastMessageText || 'No messages'}
                      </p>
                      {conversation.unreadCount > 0 && (
                        <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-blue-500 rounded-full">
                          {conversation.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      
      <div className="p-4 border-t border-gray-200">
        <button
          className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md flex items-center justify-center"
          onClick={() => {
            const phoneNumber = prompt('Enter phone number to message:');
            if (phoneNumber) {
              onSelectConversation(phoneNumber);
            }
          }}
        >
          <User className="h-5 w-5 mr-2" />
          New Conversation
        </button>
      </div>
    </div>
  );
};

export default SMSConversationList;
