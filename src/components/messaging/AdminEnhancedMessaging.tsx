import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Search, User, ArrowLeft } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import LoadingSpinner from '../LoadingSpinner';
import { Link } from 'react-router-dom';

interface Attachment {
  id: string;
  url: string;
  filename: string;
  content_type: string;
}

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  is_read: boolean;
  attachments: Attachment[];
  sender?: {
    full_name: string;
    avatar_url: string | null;
    user_type: string;
  };
}

interface Conversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  status?: string;
  booking_id?: string;
  participants: {
    id: string;
    full_name: string;
    avatar_url: string | null;
    user_type: string;
  }[];
  last_message?: {
    content: string;
    created_at: string;
    sender_id: string;
  };
}

const AdminEnhancedMessaging: React.FC = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [filteredConversations, setFilteredConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch all conversations
  useEffect(() => {
    if (!user) return;

    const fetchConversations = async () => {
      try {
        setLoading(true);

        // For admin, fetch all conversations
        const { data, error } = await supabase
          .from('conversations')
          .select(`
            id,
            title,
            created_at,
            updated_at,
            status,
            booking_id,
            participants:conversation_participants(
              user_id,
              profiles(id, full_name, avatar_url, user_type)
            ),
            last_message:messages(content, created_at, sender_id)
          `)
          .order('updated_at', { ascending: false });

        if (error) throw error;

        // Process the data to match our Conversation interface
        const processedConversations: Conversation[] = await Promise.all(data.map(async (conv: any) => {
          const participants = conv.participants.map((p: any) => ({
            id: p.profiles.id,
            full_name: p.profiles.full_name,
            avatar_url: p.profiles.avatar_url,
            user_type: p.profiles.user_type
          }));

          // Get the last message if available
          const lastMessage = conv.last_message && conv.last_message.length > 0
            ? {
                content: conv.last_message[0].content,
                created_at: conv.last_message[0].created_at,
                sender_id: conv.last_message[0].sender_id
              }
            : undefined;

          return {
            id: conv.id,
            title: conv.title || `Conversation ${conv.id.substring(0, 8)}`,
            created_at: conv.created_at,
            updated_at: conv.updated_at,
            status: conv.status || 'active',
            booking_id: conv.booking_id,
            participants,
            last_message: lastMessage
          };
        }));

        setConversations(processedConversations);
        setFilteredConversations(processedConversations);
      } catch (err) {
        console.error('Error fetching conversations:', err);
        setError('Failed to load conversations');
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();

    // Subscribe to conversation updates
    const conversationsSubscription = supabase
      .channel('admin_conversations_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'conversations'
      }, () => {
        fetchConversations();
      })
      .subscribe();

    // Subscribe to new messages
    const messagesSubscription = supabase
      .channel('admin_messages_changes')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages'
      }, (payload) => {
        // If the message belongs to the selected conversation, add it to messages
        if (selectedConversation && payload.new.conversation_id === selectedConversation.id) {
          fetchMessages(selectedConversation.id);
        }
        // Refresh conversations to update last message
        fetchConversations();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(conversationsSubscription);
      supabase.removeChannel(messagesSubscription);
    };
  }, [user]);

  // Filter conversations when search term or status filter changes
  useEffect(() => {
    let filtered = conversations;

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(conv => conv.status === statusFilter);
    }

    // Apply search term filter
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(conv => {
        // Search in conversation title
        if (conv.title.toLowerCase().includes(term)) return true;

        // Search in participant names
        if (conv.participants.some(p => p.full_name.toLowerCase().includes(term))) return true;

        // Search in last message
        if (conv.last_message && conv.last_message.content.toLowerCase().includes(term)) return true;

        return false;
      });
    }

    setFilteredConversations(filtered);
  }, [searchTerm, statusFilter, conversations]);

  // Fetch messages when a conversation is selected
  useEffect(() => {
    if (!selectedConversation) return;

    fetchMessages(selectedConversation.id);
  }, [selectedConversation]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchMessages = async (conversationId: string) => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('messages')
        .select(`
          id,
          conversation_id,
          sender_id,
          content,
          created_at,
          is_read,
          attachments,
          sender:profiles!messages_sender_id_fkey(id, full_name, avatar_url, user_type)
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      setMessages(data as Message[]);
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const getParticipantsByType = (conversation: Conversation, userType: string) => {
    return conversation.participants.filter(p => p.user_type === userType);
  };

  const getConversationTitle = (conversation: Conversation) => {
    // If there's a title, use it
    if (conversation.title && conversation.title !== `Conversation ${conversation.id.substring(0, 8)}`) {
      return conversation.title;
    }

    // Otherwise, create a title from participants
    const clients = getParticipantsByType(conversation, 'client');
    const serviceAgents = getParticipantsByType(conversation, 'service_agent');

    if (clients.length > 0 && serviceAgents.length > 0) {
      return `${clients[0].full_name} & ${serviceAgents[0].full_name}`;
    }

    // Fallback
    return `Conversation ${conversation.id.substring(0, 8)}`;
  };

  if (loading && conversations.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link to="/dashboard/admin" className="inline-flex items-center text-blue-600 hover:text-blue-800">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-2">All Conversations</h1>
      </div>

      <div className="flex h-[700px] border rounded-lg overflow-hidden bg-white shadow-sm">
        {/* Conversations sidebar */}
        <div className="w-1/3 border-r bg-gray-50">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold">Conversations</h2>
            <div className="mt-2 relative">
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-4 py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            </div>
            <div className="mt-3 flex space-x-2">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1 text-xs rounded-full ${statusFilter === 'all' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}
              >
                All
              </button>
              <button
                onClick={() => setStatusFilter('active')}
                className={`px-3 py-1 text-xs rounded-full ${statusFilter === 'active' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}
              >
                Active
              </button>
              <button
                onClick={() => setStatusFilter('completed')}
                className={`px-3 py-1 text-xs rounded-full ${statusFilter === 'completed' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}
              >
                Completed
              </button>
              <button
                onClick={() => setStatusFilter('archived')}
                className={`px-3 py-1 text-xs rounded-full ${statusFilter === 'archived' ? 'bg-gray-100 text-gray-800 border border-gray-300' : 'bg-gray-100 text-gray-800'}`}
              >
                Archived
              </button>
            </div>
          </div>

          <div className="overflow-y-auto h-[calc(100%-8rem)]">
            {filteredConversations.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                {searchTerm ? 'No conversations match your search' : 'No conversations found'}
              </div>
            ) : (
              filteredConversations.map(conversation => {
                const clients = getParticipantsByType(conversation, 'client');
                const serviceAgents = getParticipantsByType(conversation, 'service_agent');

                return (
                  <div
                    key={conversation.id}
                    className={`p-4 border-b cursor-pointer hover:bg-gray-100 ${
                      selectedConversation?.id === conversation.id ? 'bg-blue-50' : ''
                    } ${
                      conversation.status === 'completed' ? 'opacity-70' : ''
                    }`}
                    onClick={() => setSelectedConversation(conversation)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0 relative">
                        {clients.length > 0 && (
                          <img
                            src={clients[0].avatar_url || '/default-avatar.png'}
                            alt={clients[0].full_name}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        )}
                        {serviceAgents.length > 0 && (
                          <div className="absolute -bottom-1 -right-1 border-2 border-white rounded-full overflow-hidden">
                            <img
                              src={serviceAgents[0].avatar_url || '/default-avatar.png'}
                              alt={serviceAgents[0].full_name}
                              className="h-6 w-6 rounded-full object-cover"
                            />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between">
                          <div className="flex items-center">
                            <p className="font-medium truncate">
                              {getConversationTitle(conversation)}
                            </p>
                            {conversation.status === 'completed' && (
                              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Completed
                              </span>
                            )}
                            {conversation.status === 'archived' && (
                              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                Archived
                              </span>
                            )}
                          </div>
                          {conversation.last_message && (
                            <p className="text-xs text-gray-500">
                              {formatDistanceToNow(new Date(conversation.last_message.created_at), { addSuffix: true })}
                            </p>
                          )}
                        </div>
                        <div className="flex justify-between">
                          <p className="text-xs text-gray-500">
                            {clients.length > 0 ? clients[0].full_name : 'No client'} & {serviceAgents.length > 0 ? serviceAgents[0].full_name : 'No service agent'}
                          </p>
                        </div>
                        {conversation.last_message && (
                          <p className="text-sm text-gray-500 truncate">
                            {conversation.participants.find(p => p.id === conversation.last_message?.sender_id)?.full_name || 'Unknown'}: {conversation.last_message.content || 'Attachment'}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Message area */}
        <div className="w-2/3 flex flex-col">
          {selectedConversation ? (
            <>
              {/* Conversation header */}
              <div className="p-4 border-b bg-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 relative">
                      {getParticipantsByType(selectedConversation, 'client').length > 0 && (
                        <img
                          src={getParticipantsByType(selectedConversation, 'client')[0].avatar_url || '/default-avatar.png'}
                          alt={getParticipantsByType(selectedConversation, 'client')[0].full_name}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      )}
                      {getParticipantsByType(selectedConversation, 'service_agent').length > 0 && (
                        <div className="absolute -bottom-1 -right-1 border-2 border-white rounded-full overflow-hidden">
                          <img
                            src={getParticipantsByType(selectedConversation, 'service_agent')[0].avatar_url || '/default-avatar.png'}
                            alt={getParticipantsByType(selectedConversation, 'service_agent')[0].full_name}
                            className="h-6 w-6 rounded-full object-cover"
                          />
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center">
                        <h3 className="text-lg font-medium">
                          {getConversationTitle(selectedConversation)}
                        </h3>
                        {selectedConversation.status === 'completed' && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                            Completed
                          </span>
                        )}
                        {selectedConversation.status === 'archived' && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                            Archived
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">
                        {getParticipantsByType(selectedConversation, 'client').length > 0 ? getParticipantsByType(selectedConversation, 'client')[0].full_name : 'No client'} & {getParticipantsByType(selectedConversation, 'service_agent').length > 0 ? getParticipantsByType(selectedConversation, 'service_agent')[0].full_name : 'No service agent'}
                      </p>
                    </div>
                  </div>
                  {selectedConversation.booking_id && (
                    <a
                      href={`/dashboard/admin/bookings/${selectedConversation.booking_id}`}
                      className="text-sm text-blue-600 hover:text-blue-800"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View Booking
                    </a>
                  )}
                </div>
              </div>

              {/* Completed conversation notice */}
              {selectedConversation.status === 'completed' && (
                <div className="p-2 bg-green-50 border-b border-green-100 text-sm text-green-800 text-center">
                  This conversation is related to a completed booking.
                </div>
              )}

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500">No messages in this conversation yet.</p>
                  </div>
                ) : (
                  messages.map(message => {
                    return (
                      <div
                        key={message.id}
                        className="flex"
                      >
                        <div className="max-w-[75%] rounded-lg px-4 py-2 bg-white border border-gray-200 text-gray-800">
                          <div className="flex items-center space-x-2 mb-1">
                            <img
                              src={message.sender?.avatar_url || '/default-avatar.png'}
                              alt={message.sender?.full_name || 'User'}
                              className="h-5 w-5 rounded-full object-cover"
                            />
                            <span className="text-xs font-medium text-gray-700">
                              {message.sender?.full_name || 'Unknown User'}
                              <span className="text-gray-500 ml-1">
                                ({message.sender?.user_type || 'unknown'})
                              </span>
                            </span>
                          </div>
                          <p className="whitespace-pre-wrap">{message.content}</p>

                          {/* Attachments */}
                          {message.attachments && message.attachments.length > 0 && (
                            <div className="mt-2 space-y-1">
                              {message.attachments.map(attachment => (
                                <a
                                  key={attachment.id}
                                  href={attachment.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="block text-sm text-blue-600 hover:text-blue-800"
                                >
                                  📎 {attachment.filename}
                                </a>
                              ))}
                            </div>
                          )}

                          <div className="text-xs text-gray-500 text-right mt-1">
                            {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Admin message note */}
              <div className="p-4 border-t bg-white">
                <div className="bg-gray-50 border border-gray-200 rounded-md p-3 text-sm text-gray-700">
                  As an admin, you can only view conversations. You cannot send messages.
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full bg-gray-50">
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-700">Select a conversation</h3>
                <p className="text-gray-500 mt-1">Choose a conversation from the list to view messages</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminEnhancedMessaging;
