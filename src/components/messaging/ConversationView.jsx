import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { getConversation, sendMessage, getAttachmentUrl } from '../../api/messagingApi';
import { formatDistanceToNow, format } from 'date-fns';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const ConversationView = ({ conversationId, onBack }) => {
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [user, setUser] = useState(null);
  const [attachments, setAttachments] = useState([]);
  const [showAttachmentPreview, setShowAttachmentPreview] = useState(false);
  
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      if (user && conversationId) {
        fetchConversation(conversationId, user.id);
        
        // Subscribe to new messages for this conversation
        const messagesSubscription = supabase
          .channel(`conversation:${conversationId}`)
          .on('postgres_changes', {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `conversation_id=eq.${conversationId}`
          }, (payload) => {
            // Add new message to the list
            fetchConversation(conversationId, user.id);
          })
          .subscribe();
        
        return () => {
          supabase.removeChannel(messagesSubscription);
        };
      }
    };
    
    fetchUser();
  }, [conversationId]);

  useEffect(() => {
    // Scroll to bottom when messages change
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const fetchConversation = async (id, userId) => {
    try {
      setLoading(true);
      const data = await getConversation(id, userId);
      setConversation(data);
      setMessages(data.messages || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching conversation:', err);
      setError('Failed to load conversation');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() && attachments.length === 0) return;
    
    try {
      setSending(true);
      await sendMessage(
        conversationId,
        user.id,
        newMessage.trim(),
        attachments
      );
      
      setNewMessage('');
      setAttachments([]);
      setShowAttachmentPreview(false);
    } catch (err) {
      console.error('Error sending message:', err);
      alert('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setAttachments([...attachments, ...files]);
      setShowAttachmentPreview(true);
    }
  };

  const removeAttachment = (index) => {
    const newAttachments = [...attachments];
    newAttachments.splice(index, 1);
    setAttachments(newAttachments);
    
    if (newAttachments.length === 0) {
      setShowAttachmentPreview(false);
    }
  };

  const handleAttachmentClick = async (attachment) => {
    try {
      const url = await getAttachmentUrl(attachment.file_path);
      window.open(url, '_blank');
    } catch (err) {
      console.error('Error opening attachment:', err);
      alert('Failed to open attachment. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
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

  if (!conversation) {
    return (
      <div className="text-center py-8 px-4">
        <p>No conversation selected</p>
      </div>
    );
  }

  const otherUser = conversation.otherParticipant;
  const booking = conversation.bookings;
  const service = conversation.services;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-gray-200 px-4 py-4 sm:px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={onBack}
              className="mr-4 text-gray-400 hover:text-gray-500 md:hidden"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
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
              {service && (
                <p className="text-sm text-gray-500">
                  {service.name}
                </p>
              )}
            </div>
          </div>
          {booking && (
            <div className="flex items-center">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                booking.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
              </span>
              {booking.service_date && (
                <span className="ml-2 text-xs text-gray-500">
                  {format(new Date(booking.service_date), 'MMM d, yyyy')}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-gray-500">No messages yet</p>
          </div>
        ) : (
          messages.map((message) => {
            const isCurrentUser = message.sender_id === user?.id;
            const sender = isCurrentUser ? 'You' : `${otherUser.first_name} ${otherUser.last_name}`;
            const hasAttachments = message.attachments && message.attachments.length > 0;
            
            return (
              <div 
                key={message.id}
                className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-xs sm:max-w-md ${isCurrentUser ? 'bg-blue-100' : 'bg-gray-100'} rounded-lg px-4 py-2 shadow`}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-medium text-gray-600">{sender}</span>
                    <span className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-sm text-gray-800 whitespace-pre-wrap">{message.content}</p>
                  
                  {hasAttachments && (
                    <div className="mt-2 space-y-2">
                      {message.attachments.map((attachment) => (
                        <div 
                          key={attachment.id}
                          className="flex items-center p-2 bg-white rounded border border-gray-200 cursor-pointer hover:bg-gray-50"
                          onClick={() => handleAttachmentClick(attachment)}
                        >
                          <svg className="h-5 w-5 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                          </svg>
                          <div className="overflow-hidden">
                            <p className="text-xs font-medium text-gray-900 truncate">{attachment.file_name}</p>
                            <p className="text-xs text-gray-500">
                              {(attachment.file_size / 1024).toFixed(1)} KB
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Attachment Preview */}
      {showAttachmentPreview && attachments.length > 0 && (
        <div className="px-4 py-2 border-t border-gray-200 bg-gray-50">
          <div className="flex flex-wrap gap-2">
            {attachments.map((file, index) => (
              <div key={index} className="flex items-center p-2 bg-white rounded border border-gray-200">
                <svg className="h-5 w-5 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
                <div className="overflow-hidden mr-2">
                  <p className="text-xs font-medium text-gray-900 truncate">{file.name}</p>
                  <p className="text-xs text-gray-500">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => removeAttachment(index)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Message Input */}
      <div className="border-t border-gray-200 px-4 py-4 sm:px-6">
        <form onSubmit={handleSendMessage} className="flex space-x-3">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center justify-center p-2 rounded-full text-gray-400 hover:text-gray-500 hover:bg-gray-100"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              multiple
            />
          </button>
          <div className="flex-1 min-w-0">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              disabled={sending}
            />
          </div>
          <button
            type="submit"
            disabled={sending || (!newMessage.trim() && attachments.length === 0)}
            className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
              (sending || (!newMessage.trim() && attachments.length === 0)) ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {sending ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sending...
              </>
            ) : (
              'Send'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ConversationView;
