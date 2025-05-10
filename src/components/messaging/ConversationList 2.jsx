import React, { useState, useEffect } from 'react';
import supabase from '../../utils/supabaseClient';;
import { getConversations } from '../../api/messagingApi';
import { formatDistanceToNow } from 'date-fns';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
// Using singleton Supabase client;

const ConversationList = ({ onSelectConversation, selectedConversationId }) => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      if (user) {
        fetchConversations(user.id);
        
        // Subscribe to new messages
        const messagesSubscription = supabase
          .channel('public:messages')
          .on('postgres_changes', {
            event: 'INSERT',
            schema: 'public',
            table: 'messages'
          }, () => {
            // Refresh conversations when new message is received
            fetchConversations(user.id);
          })
          .subscribe();
        
        return () => {
          supabase.removeChannel(messagesSubscription);
        };
      }
    };
    
    fetchUser();
  }, []);

  const fetchConversations = async (userId) => {
    try {
      setLoading(true);
      const data = await getConversations(userId);
      setConversations(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching conversations:', err);
      setError('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
        {error}
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="text-center py-8 px-4">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No conversations</h3>
        <p className="mt-1 text-sm text-gray-500">
          You don't have any conversations yet.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-y-auto h-full">
      <ul className="divide-y divide-gray-200">
        {conversations.map((conversation) => {
          const otherUser = conversation.otherParticipant;
          const lastMessage = conversation.lastMessage;
          
          return (
            <li 
              key={conversation.id}
              className={`px-4 py-4 hover:bg-gray-50 cursor-pointer ${
                selectedConversationId === conversation.id ? 'bg-blue-50' : ''
              }`}
              onClick={() => onSelectConversation(conversation.id)}
            >
              <div className="flex justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    {otherUser.avatar_url ? (
                      <img
                        className="h-10 w-10 rounded-full"
                        src={otherUser.avatar_url}
                        alt={`${otherUser.first_name} ${otherUser.last_name}`}
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                        <span className="text-gray-600 font-medium">
                          {otherUser.first_name?.charAt(0) || ''}
                          {otherUser.last_name?.charAt(0) || ''}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">
                      {otherUser.first_name} {otherUser.last_name}
                    </p>
                    <p className="text-sm text-gray-500 truncate max-w-xs">
                      {conversation.services?.name && (
                        <span className="font-medium text-gray-600">
                          {conversation.services.name}
                        </span>
                      )}
                      {conversation.services?.name && conversation.bookings?.status && ' • '}
                      {conversation.bookings?.status && (
                        <span className={`${
                          conversation.bookings.status === 'confirmed' ? 'text-green-600' :
                          conversation.bookings.status === 'pending' ? 'text-yellow-600' :
                          conversation.bookings.status === 'completed' ? 'text-blue-600' :
                          'text-gray-600'
                        }`}>
                          {conversation.bookings.status.charAt(0).toUpperCase() + conversation.bookings.status.slice(1)}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  {lastMessage && (
                    <p className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(lastMessage.created_at), { addSuffix: true })}
                    </p>
                  )}
                  {conversation.unreadCount > 0 && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-1">
                      {conversation.unreadCount}
                    </span>
                  )}
                </div>
              </div>
              {lastMessage && (
                <div className="mt-2">
                  <p className="text-sm text-gray-600 truncate">
                    {lastMessage.sender_id === user?.id ? 'You: ' : ''}
                    {lastMessage.content}
                  </p>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default ConversationList;
