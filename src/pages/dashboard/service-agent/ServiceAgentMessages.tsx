import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../../lib/supabaseClient';
import { useAuth } from '../../../contexts/AuthContext';
import { MessageSquare, ArrowLeft, User } from 'lucide-react';

type Message = {
  id: string;
  sender_id: string;
  recipient_id: string;
  message_text: string;
  created_at: string;
  is_read: boolean;
  senders?: {
    full_name: string;
  };
};

const ServiceAgentMessages = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [conversationContent, setConversationContent] = useState<string>('');

  useEffect(() => {
    const fetchMessages = async () => {
      if (!user) return;

      try {
        setLoading(true);

        // Fetch unread messages
        const { data: messagesData, error: messagesError } = await supabase
          .from('messages')
          .select('id, sender_id, message_text, created_at, senders:sender_id(full_name)')
          .eq('recipient_id', user.id)
          .order('created_at', { ascending: false });

        if (messagesError) {
          console.error('Error fetching messages:', messagesError);
        } else {
          setMessages(messagesData || []);
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [user]);

  const handleMessageClick = (messageId: string) => {
    setSelectedMessageId(messageId);

    // Find the selected message
    const selectedMessage = messages.find(msg => msg.id === messageId);

    if (selectedMessage) {
      // In a real implementation, this would fetch the full conversation
      // For now, we'll just show the message content
      setConversationContent(selectedMessage.message_text);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link to="/dashboard/service-agent" className="inline-flex items-center text-blue-600 hover:text-blue-800">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-2">Messages</h1>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-3">
          {/* Messages List */}
          <div className="border-r border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Messages</h2>
            </div>
            <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
              {messages.length === 0 ? (
                <div className="p-4 text-center text-gray-500">No messages found</div>
              ) : (
                messages.map((message) => (
                  <button
                    key={message.id}
                    className={`w-full text-left p-4 hover:bg-gray-50 focus:outline-none ${
                      selectedMessageId === message.id ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => handleMessageClick(message.id)}
                  >
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <User className="h-5 w-5 text-gray-400" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">
                          {message.senders?.full_name || 'Unknown Sender'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(message.created_at).toLocaleString()}
                        </p>
                        <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                          {message.message_text}
                        </p>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Conversation View */}
          <div className="col-span-2 flex flex-col h-[600px]">
            {selectedMessageId ? (
              <div className="flex-1 p-4 overflow-y-auto">
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="text-sm">{conversationContent}</div>
                </div>
                <div className="mt-4 p-4 border-t border-gray-200">
                  <div className="flex">
                    <input
                      type="text"
                      placeholder="Type your reply..."
                      className="flex-1 border border-gray-300 rounded-l-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      className="bg-blue-600 text-white px-4 py-2 rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      Reply
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <MessageSquare className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                  <p>Select a message to view the conversation</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceAgentMessages;
