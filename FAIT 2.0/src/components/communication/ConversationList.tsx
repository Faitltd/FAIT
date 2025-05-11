import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, MessageSquare } from 'lucide-react';
import { Conversation } from '../../types/communication';
import { formatDistanceToNow } from 'date-fns';

interface ConversationListProps {
  conversations: Conversation[];
  selectedConversationId: string | null;
  onSelectConversation: (conversation: Conversation) => void;
  onNewConversation: () => void;
  isLoading: boolean;
}

const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  selectedConversationId,
  onSelectConversation,
  onNewConversation,
  isLoading
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const filteredConversations = conversations.filter(conversation => {
    const participantNames = conversation.participant_profiles
      ?.map(p => p.full_name?.toLowerCase())
      .join(' ');
    
    return (
      participantNames?.includes(searchQuery.toLowerCase()) ||
      conversation.title?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  if (isLoading) {
    return (
      <div className="h-full flex flex-col border-r border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Messages</h2>
            <button
              className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
              onClick={onNewConversation}
            >
              <Plus size={20} />
            </button>
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder="Search conversations..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              disabled
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-center space-x-3 p-3 rounded-lg">
                <div className="rounded-full bg-gray-200 h-10 w-10"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="h-3 bg-gray-200 rounded w-10"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col border-r border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Messages</h2>
          <button
            className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
            onClick={onNewConversation}
          >
            <Plus size={20} />
          </button>
        </div>
        <div className="relative">
          <input
            type="text"
            placeholder="Search conversations..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-4 text-center">
            <MessageSquare className="h-12 w-12 text-gray-400 mb-2" />
            <p className="text-gray-500 mb-4">No conversations found</p>
            <button
              onClick={onNewConversation}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Start a new conversation
            </button>
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {filteredConversations.map((conversation) => {
              // Get the other participants (excluding current user)
              const otherParticipants = conversation.participant_profiles || [];
              
              // Determine the conversation name
              const conversationName = conversation.title || 
                otherParticipants.map(p => p.full_name).join(', ');
              
              // Get the last message if available
              const lastMessage = conversation.messages && conversation.messages.length > 0
                ? conversation.messages[0]
                : null;
              
              return (
                <div
                  key={conversation.id}
                  className={`flex items-center p-3 rounded-lg cursor-pointer ${
                    selectedConversationId === conversation.id
                      ? 'bg-blue-50'
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => onSelectConversation(conversation)}
                >
                  <div className="flex-shrink-0 relative">
                    {otherParticipants.length > 0 && otherParticipants[0].avatar_url ? (
                      <img
                        src={otherParticipants[0].avatar_url}
                        alt={otherParticipants[0].full_name}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                        <span className="text-gray-600 font-medium">
                          {conversationName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    
                    {conversation.unread_count > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {conversation.unread_count}
                      </span>
                    )}
                  </div>
                  
                  <div className="ml-3 flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {conversationName}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {lastMessage ? lastMessage.content : 'No messages yet'}
                    </p>
                  </div>
                  
                  <div className="ml-2 flex-shrink-0">
                    <p className="text-xs text-gray-400">
                      {conversation.last_message_at
                        ? formatDistanceToNow(new Date(conversation.last_message_at), { addSuffix: true })
                        : formatDistanceToNow(new Date(conversation.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversationList;
