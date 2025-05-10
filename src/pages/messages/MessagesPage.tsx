import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';
import Navbar from '../../components/Navbar';
import { 
  MessageSquare, 
  Search, 
  Send, 
  User, 
  Calendar, 
  Clock, 
  Paperclip, 
  X, 
  AlertCircle 
} from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';
import { formatDistanceToNow } from 'date-fns';

type Conversation = {
  id: string;
  client_id: string;
  service_agent_id: string;
  booking_id: string;
  service_id: string;
  status: string;
  created_at: string;
  updated_at: string;
  client: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    avatar_url: string | null;
  };
  service_agent: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    avatar_url: string | null;
  };
  bookings: {
    id: string;
    status: string;
    service_date: string;
    price: number;
  };
  services: {
    id: string;
    name: string;
    description: string;
  };
  messages: Message[];
  unread_count?: number;
};

type Message = {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  read: boolean;
  created_at: string;
};

const MessagesPage: React.FC = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id);
      markConversationAsRead(selectedConversation.id);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('conversations')
        .select(`
          id,
          status,
          created_at,
          updated_at,
          booking_id,
          service_id,
          client:client_id(id, first_name, last_name, email, avatar_url),
          service_agent:service_agent_id(id, first_name, last_name, email, avatar_url),
          bookings:booking_id(id, status, service_date, price),
          services:service_id(id, name, description),
          messages:messages(id, sender_id, content, read, created_at)
        `)
        .or(`client_id.eq.${user.id},service_agent_id.eq.${user.id}`)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      // Process conversations to add unread count
      const processedConversations = data.map(conversation => {
        const unreadCount = conversation.messages.filter(
          (msg: Message) => msg.sender_id !== user.id && !msg.read
        ).length;
        return { ...conversation, unread_count: unreadCount };
      });

      setConversations(processedConversations);
      
      // Select the first conversation if none is selected
      if (processedConversations.length > 0 && !selectedConversation) {
        setSelectedConversation(processedConversations[0]);
      }
    } catch (err: any) {
      console.error('Error fetching conversations:', err);
      setError(err.message || 'Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      setMessages(data || []);
    } catch (err: any) {
      console.error('Error fetching messages:', err);
      setError(err.message || 'Failed to load messages');
    }
  };

  const markConversationAsRead = async (conversationId: string) => {
    if (!user) return;

    try {
      // Mark all messages from other users as read
      const { error } = await supabase
        .from('messages')
        .update({ read: true })
        .eq('conversation_id', conversationId)
        .neq('sender_id', user.id)
        .eq('read', false);

      if (error) throw error;

      // Update local state
      setConversations(conversations.map(conv => {
        if (conv.id === conversationId) {
          return { ...conv, unread_count: 0 };
        }
        return conv;
      }));
    } catch (err) {
      console.error('Error marking messages as read:', err);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !selectedConversation || !newMessage.trim()) return;

    try {
      setSending(true);

      // Insert message
      const { data: message, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: selectedConversation.id,
          sender_id: user.id,
          content: newMessage.trim(),
          read: false
        })
        .select()
        .single();

      if (error) throw error;

      // Update conversation's updated_at timestamp
      await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', selectedConversation.id);

      // Add new message to the list
      setMessages([...messages, message]);
      
      // Clear input
      setNewMessage('');
      
      // Refresh conversations to update order
      fetchConversations();
    } catch (err: any) {
      console.error('Error sending message:', err);
      alert('Failed to send message: ' + err.message);
    } finally {
      setSending(false);
    }
  };

  const getOtherParticipant = (conversation: Conversation) => {
    if (!user) return null;
    
    return user.id === conversation.client.id
      ? conversation.service_agent
      : conversation.client;
  };

  const filteredConversations = conversations.filter(conversation => {
    if (!searchQuery) return true;
    
    const otherParticipant = getOtherParticipant(conversation);
    const query = searchQuery.toLowerCase();
    
    return (
      otherParticipant?.first_name?.toLowerCase().includes(query) ||
      otherParticipant?.last_name?.toLowerCase().includes(query) ||
      otherParticipant?.email?.toLowerCase().includes(query) ||
      conversation.services?.name?.toLowerCase().includes(query) ||
      conversation.messages.some(msg => msg.content.toLowerCase().includes(query))
    );
  });

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Messages</h1>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-3 h-[calc(100vh-200px)]">
              {/* Conversations List */}
              <div className="md:col-span-1 border-r border-gray-200">
                <div className="p-4 border-b border-gray-200">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Search conversations..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>

                <div className="overflow-y-auto h-[calc(100vh-264px)]">
                  {filteredConversations.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      No conversations found
                    </div>
                  ) : (
                    filteredConversations.map((conversation) => {
                      const otherParticipant = getOtherParticipant(conversation);
                      const lastMessage = conversation.messages[conversation.messages.length - 1];
                      
                      return (
                        <button
                          key={conversation.id}
                          className={`w-full text-left p-4 border-b border-gray-100 hover:bg-gray-50 focus:outline-none transition-colors ${
                            selectedConversation?.id === conversation.id ? 'bg-blue-50' : ''
                          }`}
                          onClick={() => setSelectedConversation(conversation)}
                        >
                          <div className="flex items-start">
                            <div className="flex-shrink-0">
                              {otherParticipant?.avatar_url ? (
                                <img
                                  src={otherParticipant.avatar_url}
                                  alt={`${otherParticipant.first_name} ${otherParticipant.last_name}`}
                                  className="h-10 w-10 rounded-full"
                                />
                              ) : (
                                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                  <User className="h-6 w-6 text-gray-500" />
                                </div>
                              )}
                            </div>
                            <div className="ml-3 flex-1">
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-medium text-gray-900">
                                  {otherParticipant?.first_name} {otherParticipant?.last_name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {lastMessage && formatDistanceToNow(new Date(lastMessage.created_at), { addSuffix: true })}
                                </p>
                              </div>
                              <div className="flex items-center justify-between">
                                <p className="text-sm text-gray-500 truncate">
                                  {lastMessage?.content || 'No messages yet'}
                                </p>
                                {conversation.unread_count > 0 && (
                                  <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-blue-600 rounded-full">
                                    {conversation.unread_count}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-gray-400 mt-1 truncate">
                                {conversation.services?.name || 'No service'}
                              </p>
                            </div>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Message View */}
              <div className="md:col-span-2 flex flex-col">
                {selectedConversation ? (
                  <>
                    {/* Conversation Header */}
                    <div className="p-4 border-b border-gray-200 bg-gray-50">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          {getOtherParticipant(selectedConversation)?.avatar_url ? (
                            <img
                              src={getOtherParticipant(selectedConversation)?.avatar_url || ''}
                              alt={`${getOtherParticipant(selectedConversation)?.first_name} ${getOtherParticipant(selectedConversation)?.last_name}`}
                              className="h-10 w-10 rounded-full"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                              <User className="h-6 w-6 text-gray-500" />
                            </div>
                          )}
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">
                            {getOtherParticipant(selectedConversation)?.first_name} {getOtherParticipant(selectedConversation)?.last_name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {selectedConversation.services?.name}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 p-4 overflow-y-auto">
                      {messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-500">
                          <MessageSquare className="h-12 w-12 text-gray-300 mb-2" />
                          <p>No messages yet</p>
                          <p className="text-sm">Start the conversation by sending a message</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {messages.map((message) => {
                            const isCurrentUser = message.sender_id === user?.id;
                            
                            return (
                              <div
                                key={message.id}
                                className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                              >
                                <div
                                  className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-lg ${
                                    isCurrentUser
                                      ? 'bg-blue-600 text-white'
                                      : 'bg-gray-100 text-gray-800'
                                  }`}
                                >
                                  <p className="text-sm">{message.content}</p>
                                  <p
                                    className={`text-xs mt-1 ${
                                      isCurrentUser ? 'text-blue-200' : 'text-gray-500'
                                    }`}
                                  >
                                    {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                          <div ref={messagesEndRef} />
                        </div>
                      )}
                    </div>

                    {/* Message Input */}
                    <div className="p-4 border-t border-gray-200">
                      <form onSubmit={handleSendMessage} className="flex items-center">
                        <input
                          type="text"
                          className="flex-1 border border-gray-300 rounded-l-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Type your message..."
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          disabled={sending}
                        />
                        <button
                          type="submit"
                          className="bg-blue-600 text-white px-4 py-2 rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={!newMessage.trim() || sending}
                        >
                          {sending ? (
                            <LoadingSpinner size="sm" />
                          ) : (
                            <Send className="h-5 w-5" />
                          )}
                        </button>
                      </form>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full bg-gray-50 p-4">
                    <MessageSquare className="h-12 w-12 text-gray-300 mb-4" />
                    <p className="text-gray-500 text-center">Select a conversation or start a new one</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default MessagesPage;
