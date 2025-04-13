import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { Send } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Message {
  id: string;
  content: string;
  created_at: string;
  sender_id: string;
  sender?: {
    full_name: string;
    avatar_url: string;
  };
}

interface ServiceAgentChatProps {
  bookingId: string;
}

const ServiceAgentChat: React.FC<ServiceAgentChatProps> = ({ bookingId }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [bookingDetails, setBookingDetails] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchBookingAndMessages = async () => {
      if (!user) return;
      
      try {
        // Fetch booking details
        const { data: bookingData, error: bookingError } = await supabase
          .from('bookings')
          .select(`
            id,
            client_id,
            service_package_id,
            client:profiles!bookings_client_id_fkey (
              id,
              full_name,
              avatar_url
            )
          `)
          .eq('id', bookingId)
          .single();
          
        if (bookingError) throw bookingError;
        setBookingDetails(bookingData);
        
        // Fetch messages
        const { data, error } = await supabase
          .from('messages')
          .select(`
            id,
            content,
            created_at,
            sender_id,
            sender:profiles!messages_sender_id_fkey (
              full_name,
              avatar_url
            )
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
          }, async (payload) => {
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
    
    fetchBookingAndMessages();
  }, [bookingId, user]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
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
          recipient_id: bookingDetails.client_id,
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
    <div className="flex flex-col h-full">
      <div className="bg-white p-4 border-b">
        <h3 className="text-lg font-semibold">
          Chat with {bookingDetails?.client?.full_name || 'Client'}
        </h3>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 my-8">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((message) => (
            <div 
              key={message.id} 
              className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[75%] rounded-lg p-3 ${
                  message.sender_id === user?.id 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                <div className="text-sm">
                  {message.content}
                </div>
                <div 
                  className={`text-xs mt-1 ${
                    message.sender_id === user?.id 
                      ? 'text-blue-100' 
                      : 'text-gray-500'
                  }`}
                >
                  {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={handleSendMessage} className="p-4 border-t flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={sending}
        />
        <button
          type="submit"
          className="bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          disabled={sending || !newMessage.trim()}
        >
          {sending ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : (
            <Send size={18} />
          )}
        </button>
      </form>
    </div>
  );
};

export default ServiceAgentChat;
