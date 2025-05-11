import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_name: string;
  content: string;
  created_at: string;
  is_read: boolean;
}

interface Conversation {
  id: string;
  other_user_id: string;
  other_user_name: string;
  last_message: Message;
  unread_count: number;
}

const MessagePreview: React.FC = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchConversations = async () => {
      if (!user) return;
      
      try {
        // In a real implementation, you would fetch from your conversations table
        // For now, we'll simulate with some mock data
        const mockConversations: Conversation[] = [
          {
            id: '1',
            other_user_id: 'provider1',
            other_user_name: 'Denver Plumbing Pros',
            last_message: {
              id: 'm1',
              conversation_id: '1',
              sender_id: 'provider1',
              sender_name: 'Denver Plumbing Pros',
              content: 'I can come by on Tuesday at 10 AM to take a look at your bathroom plumbing issue.',
              created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
              is_read: false
            },
            unread_count: 1
          },
          {
            id: '2',
            other_user_id: 'provider2',
            other_user_name: 'Tile Masters',
            last_message: {
              id: 'm2',
              conversation_id: '2',
              sender_id: user.id,
              sender_name: 'You',
              content: 'Thanks for the quote. I'll review it and get back to you soon.',
              created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
              is_read: true
            },
            unread_count: 0
          },
          {
            id: '3',
            other_user_id: 'provider3',
            other_user_name: 'Elite Electricians',
            last_message: {
              id: 'm3',
              conversation_id: '3',
              sender_id: 'provider3',
              sender_name: 'Elite Electricians',
              content: 'We've completed the electrical work for your kitchen renovation. Please let us know if you have any questions.',
              created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
              is_read: true
            },
            unread_count: 0
          }
        ];
        
        setConversations(mockConversations);
      } catch (err) {
        console.error('Error fetching conversations:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchConversations();
  }, [user]);
  
  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-start animate-pulse">
            <div className="h-10 w-10 rounded-full bg-gray-200 mr-3"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }
  
  if (conversations.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-gray-500">No messages yet</p>
        <Link
          to="/service-providers"
          className="mt-2 inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
        >
          Find service providers to message
        </Link>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {conversations.map((conversation) => (
        <Link
          key={conversation.id}
          to={`/messages/${conversation.id}`}
          className="flex items-start p-3 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 mr-3">
            {conversation.other_user_name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-900">
                {conversation.other_user_name}
              </span>
              <span className="text-xs text-gray-500">
                {formatDistanceToNow(new Date(conversation.last_message.created_at), { addSuffix: true })}
              </span>
            </div>
            <p className="text-sm text-gray-500 truncate">
              {conversation.last_message.sender_id === user?.id ? 'You: ' : ''}
              {conversation.last_message.content}
            </p>
          </div>
          {conversation.unread_count > 0 && (
            <div className="ml-2 flex-shrink-0 h-5 w-5 rounded-full bg-blue-600 flex items-center justify-center">
              <span className="text-xs text-white">{conversation.unread_count}</span>
            </div>
          )}
        </Link>
      ))}
      
      <div className="pt-2 text-center">
        <Link to="/messages" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
          View All Messages
        </Link>
      </div>
    </div>
  );
};

export default MessagePreview;
