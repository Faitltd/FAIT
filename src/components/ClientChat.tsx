import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Send, ArrowLeft } from 'lucide-react';
import type { Database } from '../lib/database.types';

type Message = Database['public']['Tables']['messages']['Row'] & {
  sender: Pick<Database['public']['Tables']['profiles']['Row'], 'full_name' | 'avatar_url'>;
};

interface ClientChatProps {
  bookingId: string;
  onBack: () => void;
}

const ClientChat: React.FC<ClientChatProps> = ({ bookingId, onBack }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [bookingDetails, setBookingDetails] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        // Fetch booking details first
        const { data: bookingData, error: bookingError } = await supabase
          .from('bookings')
          .select(`
            id,
            client_id,
            service_package_id,
            scheduled_date,
            status,
            total_amount,
            notes,
            created_at,
            updated_at,
            service_package:service_packages(
              id,
              title,
              service_agent_id
            )
          `)
          .eq('id', bookingId)
          .single();

        if (bookingError) throw bookingError;
        setBookingDetails(bookingData);

        // Then fetch messages
        const { data, error } = await supabase
          .from('messages')
          .select(`
            id,
            booking_id,
            sender_id,
            recipient_id,
            content,
            is_read,
            created_at,
            updated_at,
            sender:profiles!messages_sender_id_fkey(full_name, avatar_url)
          `)
          .eq('booking_id', bookingId)
          .order('created_at', { ascending: true });

        if (error) throw error;
        setMessages(data as Message[]);

        // Subscribe to new messages
        const subscription = supabase
          .channel(`messages:booking_id=eq.${bookingId}`)
          .on('postgres_changes', {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `booking_id=eq.${bookingId}`
          }, payload => {
            // Only fetch minimal data needed
            const { data: senderData } = await supabase
              .from('profiles')
              .select('full_name, avatar_url')
              .eq('id', payload.new.sender_id)
              .single();

            setMessages(prev => [...prev, {
              id: payload.new.id,
              content: payload.new.content,
              created_at: payload.new.created_at,
              sender_id: payload.new.sender_id,
              sender: senderData
            }]);
          })
          .subscribe();

        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error('Error fetching messages:', error);
      } finally {
        setLoading(false);
      }
    };

    if (bookingId) {
      fetchMessages();
    }
  }, [bookingId]);

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !bookingDetails) return;

    setSending(true);
    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          booking_id: bookingId,
          sender_id: user.id,
          recipient_id: bookingDetails.service_package.service_agent_id,
          content: newMessage.trim(),
        });

      if (error) throw error;
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[600px]">
      <div className="px-6 py-4 border-b border-gray-200 flex items-center">
        <button
          onClick={onBack}
          className="mr-3 text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h3 className="font-medium text-gray-900">
            {bookingDetails?.service_package?.title}
          </h3>
          <p className="text-sm text-gray-500">
            Booking #{bookingId.substring(0, 8)}
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <p className="text-center text-gray-500 my-8">
            No messages yet. Start the conversation!
          </p>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[75%] rounded-lg px-4 py-2 ${
                  message.sender_id === user?.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                <div className="text-sm font-medium mb-1">
                  {message.sender_id === user?.id ? 'You' : message.sender.full_name}
                </div>
                <p>{message.content}</p>
                <div className="text-xs opacity-70 text-right mt-1">
                  {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="border-t border-gray-200 p-4">
        <div className="flex items-center">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 border border-gray-300 rounded-l-md px-4 py-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={sending}
          />
          <button
            type="submit"
            disabled={sending || !newMessage.trim()}
            className="bg-blue-600 text-white px-4 py-2 rounded-r-md hover:bg-blue-700 disabled:opacity-50"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ClientChat;
