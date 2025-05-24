import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Send, Paperclip, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import LoadingSpinner from '../LoadingSpinner';

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
  unread_count: number;
}

interface EnhancedMessagingProps {
  initialConversationId?: string;
}

const EnhancedMessaging: React.FC<EnhancedMessagingProps> = ({ initialConversationId }) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch conversations on component mount
  useEffect(() => {
    if (!user) return;

    const fetchConversations = async () => {
      try {
        setLoading(true);

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
          .contains('participants', [{ user_id: user.id }])
          .order('updated_at', { ascending: false });

        if (error) throw error;

        // Process the data to match our Conversation interface
        const processedConversations: Conversation[] = data.map((conv: any) => {
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

          // Count unread messages
          const { count } = await supabase
            .from('messages')
            .select('id', { count: 'exact' })
            .eq('conversation_id', conv.id)
            .eq('is_read', false)
            .neq('sender_id', user.id);

          return {
            id: conv.id,
            title: conv.title,
            created_at: conv.created_at,
            updated_at: conv.updated_at,
            status: conv.status || 'active',
            booking_id: conv.booking_id,
            participants,
            last_message: lastMessage,
            unread_count: count || 0
          };
        });

        setConversations(processedConversations);

        // If initialConversationId is provided, select that conversation
        if (initialConversationId) {
          const initialConv = processedConversations.find(c => c.id === initialConversationId);
          if (initialConv) {
            setSelectedConversation(initialConv);
          }
        }
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
      .channel('conversations_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'conversations',
        filter: `participants->contains->[{"user_id":"${user.id}"}]`
      }, () => {
        fetchConversations();
      })
      .subscribe();

    // Subscribe to new messages
    const messagesSubscription = supabase
      .channel('messages_changes')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages'
      }, (payload) => {
        // If the message belongs to the selected conversation, add it to messages
        if (selectedConversation && payload.new.conversation_id === selectedConversation.id) {
          fetchMessages(selectedConversation.id);
        }
        // Refresh conversations to update last message and unread count
        fetchConversations();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(conversationsSubscription);
      supabase.removeChannel(messagesSubscription);
    };
  }, [user, initialConversationId]);

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
          sender:profiles!messages_sender_id_fkey(full_name, avatar_url)
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      setMessages(data as Message[]);

      // Mark messages as read
      if (user) {
        await supabase
          .from('messages')
          .update({ is_read: true })
          .eq('conversation_id', conversationId)
          .neq('sender_id', user.id)
          .eq('is_read', false);
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!newMessage.trim() && attachments.length === 0) || !user || !selectedConversation) return;

    setSending(true);
    try {
      // First, upload any attachments
      const uploadedAttachments: Attachment[] = [];

      if (attachments.length > 0) {
        for (const file of attachments) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
          const filePath = `attachments/${user.id}/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('message-attachments')
            .upload(filePath, file);

          if (uploadError) throw uploadError;

          const { data: urlData } = supabase.storage
            .from('message-attachments')
            .getPublicUrl(filePath);

          uploadedAttachments.push({
            id: fileName,
            url: urlData.publicUrl,
            filename: file.name,
            content_type: file.type
          });
        }
      }

      // Then, insert the message
      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: selectedConversation.id,
          sender_id: user.id,
          content: newMessage.trim(),
          attachments: uploadedAttachments.length > 0 ? uploadedAttachments : null
        });

      if (error) throw error;

      // Clear form
      setNewMessage('');
      setAttachments([]);
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setAttachments([...attachments, ...Array.from(e.target.files)]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const getOtherParticipant = (conversation: Conversation) => {
    if (!user) return null;
    return conversation.participants.find(p => p.id !== user.id);
  };

  if (loading && conversations.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="flex h-full border rounded-lg overflow-hidden">
      {/* Conversations sidebar */}
      <div className="w-1/3 border-r bg-gray-50">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Messages</h2>
        </div>

        <div className="overflow-y-auto h-[calc(100%-4rem)]">
          {conversations.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              No conversations yet
            </div>
          ) : (
            conversations.map(conversation => {
              const otherParticipant = getOtherParticipant(conversation);
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
                    <div className="flex-shrink-0">
                      <img
                        src={otherParticipant?.avatar_url || '/default-avatar.png'}
                        alt={otherParticipant?.full_name || 'User'}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between">
                        <div className="flex items-center">
                          <p className="font-medium truncate">
                            {otherParticipant?.full_name || conversation.title}
                          </p>
                          {conversation.status === 'completed' && (
                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                              Completed
                            </span>
                          )}
                          {conversation.status === 'archived' && (
                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
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
                      {conversation.last_message && (
                        <p className="text-sm text-gray-500 truncate">
                          {conversation.last_message.sender_id === user?.id ? 'You: ' : ''}
                          {conversation.last_message.content || 'Attachment'}
                        </p>
                      )}
                      {conversation.unread_count > 0 && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {conversation.unread_count} new
                        </span>
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
                  <div className="flex-shrink-0">
                    <img
                      src={getOtherParticipant(selectedConversation)?.avatar_url || '/default-avatar.png'}
                      alt={getOtherParticipant(selectedConversation)?.full_name || 'User'}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="flex items-center">
                      <h3 className="text-lg font-medium">
                        {getOtherParticipant(selectedConversation)?.full_name || selectedConversation.title}
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
                      {getOtherParticipant(selectedConversation)?.user_type || ''}
                    </p>
                  </div>
                </div>
                {selectedConversation.booking_id && (
                  <a
                    href={`/dashboard/${user?.user_type === 'client' ? 'client' : 'service-agent'}/bookings/${selectedConversation.booking_id}`}
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
                This conversation is related to a completed booking. You can still view the message history.
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500">No messages yet. Start the conversation!</p>
                </div>
              ) : (
                messages.map(message => {
                  const isCurrentUser = message.sender_id === user?.id;
                  return (
                    <div
                      key={message.id}
                      className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[75%] rounded-lg px-4 py-2 ${
                          isCurrentUser ? 'bg-blue-600 text-white' : 'bg-white text-gray-800 border'
                        }`}
                      >
                        <div className="text-sm font-medium mb-1">
                          {isCurrentUser ? 'You' : message.sender?.full_name}
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
                                className={`block text-sm ${
                                  isCurrentUser ? 'text-blue-100 hover:text-white' : 'text-blue-600 hover:text-blue-800'
                                }`}
                              >
                                📎 {attachment.filename}
                              </a>
                            ))}
                          </div>
                        )}

                        <div className="text-xs opacity-70 text-right mt-1">
                          {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message input */}
            <form onSubmit={handleSendMessage} className="p-4 border-t bg-white">
              {selectedConversation.status === 'completed' && (
                <div className="mb-4 bg-gray-50 border border-gray-200 rounded-md p-3 text-sm text-gray-700">
                  This conversation is related to a completed booking. You cannot send new messages.
                </div>
              )}
              {/* Attachment preview */}
              {attachments.length > 0 && (
                <div className="mb-2 flex flex-wrap gap-2">
                  {attachments.map((file, index) => (
                    <div key={index} className="flex items-center bg-gray-100 rounded-full px-3 py-1">
                      <span className="text-sm truncate max-w-[150px]">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => removeAttachment(index)}
                        className="ml-1 text-gray-500 hover:text-gray-700"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handleFileSelect}
                  className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
                  disabled={sending || selectedConversation.status === 'completed'}
                >
                  <Paperclip size={20} />
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  multiple
                  disabled={selectedConversation.status === 'completed'}
                />
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={selectedConversation.status === 'completed' ? 'Conversation is completed' : 'Type your message...'}
                  className="flex-1 border border-gray-300 rounded-md px-4 py-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={sending || selectedConversation.status === 'completed'}
                />
                <button
                  type="submit"
                  disabled={sending || (!newMessage.trim() && attachments.length === 0) || selectedConversation.status === 'completed'}
                  className="bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {sending ? <LoadingSpinner size="small" /> : <Send size={20} />}
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex items-center justify-center h-full bg-gray-50">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-700">Select a conversation</h3>
              <p className="text-gray-500 mt-1">Choose a conversation from the list to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedMessaging;
