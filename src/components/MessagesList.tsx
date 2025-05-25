import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import ServiceAgentChat from './ServiceAgentChat';

interface Message {
  id: string;
  booking_id: string;
  content: string;
  created_at: string;
  is_read: boolean;
  booking: {
    id: string;
    service_package: {
      title: string;
    };
    client: {
      full_name: string;
      avatar_url: string;
    };
  };
}

const MessagesList: React.FC = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Record<string, Message[]>>({});
  const [loading, setLoading] = useState(true);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!user) return;
      
      try {
        // Fetch all messages where the user is either sender or recipient
        const { data, error } = await supabase
          .from('messages')
          .select(`
            id,
            booking_id,
            content,
            created_at,
            is_read,
            booking:bookings (
              id,
              service_package:service_packages (
                title
              ),
              client:profiles!bookings_client_id_fkey (
                full_name,
                avatar_url
              )
            )
          `)
          .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        // Group messages by booking_id
        const groupedMessages = (data as Message[]).reduce((acc, message) => {
          if (!acc[message.booking_id]) {
            acc[message.booking_id] = [];
          }
          acc[message.booking_id].push(message);
          return acc;
        }, {} as Record<string, Message[]>);
        
        setConversations(groupedMessages);
      } catch (error) {
        console.error('Error fetching messages:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMessages();
    
    // Subscribe to new messages
    const subscription = supabase
      .channel('messages_changes')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages',
        filter: `recipient_id=eq.${user?.id}`
      }, async (payload) => {
        // Fetch the complete message with booking details
        const { data, error } = await supabase
          .from('messages')
          .select(`
            id,
            booking_id,
            content,
            created_at,
            is_read,
            booking:bookings (
              id,
              service_package:service_packages (
                title
              ),
              client:profiles!bookings_client_id_fkey (
                full_name,
                avatar_url
              )
            )
          `)
          .eq('id', payload.new.id)
          .single();
          
        if (error) {
          console.error('Error fetching new message details:', error);
          return;
        }
        
        setConversations(prev => {
          const newConversations = { ...prev };
          if (!newConversations[data.booking_id]) {
            newConversations[data.booking_id] = [];
          }
          newConversations[data.booking_id] = [
            data as unknown as Message,
            ...newConversations[data.booking_id]
          ];
          return newConversations;
        });
      })
      .subscribe();
      
    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  if (loading) {
    return (
      <div className="p-6 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (selectedBookingId) {
    return (
      <div className="h-full flex flex-col">
        <div className="p-2 bg-gray-100">
          <button 
            onClick={() => setSelectedBookingId(null)}
            className="text-blue-600 hover:text-blue-800"
          >
            ← Back to conversations
          </button>
        </div>
        <div className="flex-1">
          <ServiceAgentChat bookingId={selectedBookingId} />
        </div>
      </div>
    );
  }

  if (Object.keys(conversations).length === 0) {
    return (
      <div className="p-6 text-center text-gray-500">
        <p>No messages yet.</p>
      </div>
    );
  }

  return (
    <div className="divide-y">
      {Object.entries(conversations).map(([bookingId, messages]) => {
        const latestMessage = messages[0];
        return (
          <div 
            key={bookingId}
            className="p-4 hover:bg-gray-50 cursor-pointer"
            onClick={() => setSelectedBookingId(bookingId)}
          >
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <img 
                  src={latestMessage.booking.client.avatar_url || '/default-avatar.png'} 
                  alt={latestMessage.booking.client.full_name}
                  className="h-10 w-10 rounded-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between">
                  <p className="font-medium truncate">
                    {latestMessage.booking.client.full_name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(latestMessage.created_at), { addSuffix: true })}
                  </p>
                </div>
                <p className="text-sm text-gray-600 truncate">
                  {latestMessage.booking.service_package.title}
                </p>
                <p className="text-sm text-gray-500 truncate">
                  {latestMessage.content}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MessagesList;
