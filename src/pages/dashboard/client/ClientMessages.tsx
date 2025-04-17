import React, { useEffect, useState, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabase';
import type { Database } from '../../../lib/database.types';
import { ArrowLeft, Send, User, Calendar } from 'lucide-react';
import { getSimulatedBookings } from '../../../utils/simulatedBookings';

type Booking = Database['public']['Tables']['bookings']['Row'] & {
  service_package: Pick<Database['public']['Tables']['service_packages']['Row'], 'title'> & {
    service_agent: Pick<Database['public']['Tables']['profiles']['Row'], 'full_name' | 'avatar_url'>;
  };
};

type Message = {
  id: string;
  booking_id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
  updated_at: string;
  sender?: {
    full_name: string;
    avatar_url: string | null;
  };
  is_from_me?: boolean;
  sender_name?: string;
  sender_avatar?: string;
};

const ClientMessages = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const initialBookingId = searchParams.get('booking');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(initialBookingId);
  // Store messages by booking ID to persist them when switching conversations
  const [messagesByBookingId, setMessagesByBookingId] = useState<Record<string, Message[]>>({});
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        if (!user) return;

        // Get real bookings from the database - simplified approach
        const { data: bookingsData, error: bookingsError } = await supabase
          .from('bookings')
          .select('*')
          .eq('client_id', user.id)
          .order('scheduled_date', { ascending: false });

        if (bookingsError) throw bookingsError;

        // Process each booking to get its service package only (no service agent)
        const processedData = await Promise.all(bookingsData.map(async (booking) => {
          // Get service package
          const { data: servicePackage, error: servicePackageError } = await supabase
            .from('service_packages')
            .select('id, title, description, price, duration, is_active, created_at, updated_at')
            .eq('id', booking.service_package_id)
            .single();

          if (servicePackageError && servicePackageError.code !== 'PGRST116') {
            console.error('Error fetching service package:', servicePackageError);
            return {
              ...booking,
              service_package: null
            };
          }

          // Return the processed booking without service agent info
          return {
            ...booking,
            service_package: servicePackage ? {
              ...servicePackage,
              // Add a placeholder service agent to satisfy the type
              service_agent: {
                full_name: 'Service Agent',
                avatar_url: null
              }
            } : null
          };
        }));

        // Get simulated bookings from localStorage
        const simulatedBookings = getSimulatedBookings(user.id);

        // Combine real and simulated bookings
        const allBookings = [...(processedData || []), ...simulatedBookings] as Booking[];

        // Sort by scheduled date (newest first)
        allBookings.sort((a, b) => {
          return new Date(b.scheduled_date).getTime() - new Date(a.scheduled_date).getTime();
        });

        setBookings(allBookings);

        // If no booking is selected but we have bookings, select the first one
        if (!selectedBookingId && allBookings.length > 0) {
          setSelectedBookingId(allBookings[0].id);
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching bookings:', error);
        setLoading(false);
      }
    };

    fetchBookings();
  }, [user, selectedBookingId]);

  // Effect to load messages when selected booking changes
  useEffect(() => {
    if (!selectedBookingId || !user) return;

    // If we already have messages for this booking, use them
    if (messagesByBookingId[selectedBookingId]) {
      setMessages(messagesByBookingId[selectedBookingId]);

      // Scroll to bottom when loading existing messages
      setTimeout(() => {
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);

      return;
    }

    const fetchMessages = async () => {
      try {
        // Check if this is a simulated booking
        if (selectedBookingId.startsWith('simulated-')) {
          // For simulated bookings, create a welcome message
          const simulatedMessages = [
            {
              id: 'welcome-' + Date.now(),
              booking_id: selectedBookingId,
              sender_id: 'system',
              recipient_id: user.id,
              content: 'Welcome! This is a simulated conversation for your demo booking. In a real booking, you would be able to message the service agent here.',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              is_read: true,
              is_from_me: false,
              sender_name: 'System',
              sender_avatar: null
            }
          ];

          // Store messages by booking ID and update current messages
          setMessagesByBookingId(prev => ({
            ...prev,
            [selectedBookingId]: simulatedMessages
          }));
          setMessages(simulatedMessages);
          return;
        }

        // For real bookings, fetch messages from the database
        const { data: messagesData, error: messagesError } = await supabase
          .from('messages')
          .select('*')
          .eq('booking_id', selectedBookingId)
          .order('created_at', { ascending: true });

        if (messagesError) throw messagesError;

        // Process each message to get sender information
        const data = await Promise.all(messagesData.map(async (message) => {
          // Get sender profile
          const { data: senderData, error: senderError } = await supabase
            .from('profiles')
            .select('full_name, avatar_url')
            .eq('id', message.sender_id)
            .single();

          if (senderError && senderError.code !== 'PGRST116') {
            console.error('Error fetching sender:', senderError);
            return {
              ...message,
              sender: {
                full_name: 'Unknown User',
                avatar_url: null
              }
            };
          }

          return {
            ...message,
            sender: senderData || {
              full_name: 'Unknown User',
              avatar_url: null
            }
          };
        }));

        // Format messages with additional fields needed for UI
        const formattedMessages = data.map(msg => ({
          id: msg.id,
          booking_id: msg.booking_id,
          sender_id: msg.sender_id,
          recipient_id: msg.recipient_id,
          content: msg.content,
          created_at: msg.created_at,
          updated_at: msg.updated_at,
          is_read: msg.is_read,
          is_from_me: msg.sender_id === user.id,
          sender_name: msg.sender.full_name,
          sender_avatar: msg.sender.avatar_url
        }));

        // Store messages by booking ID and update current messages
        setMessagesByBookingId(prev => ({
          ...prev,
          [selectedBookingId]: formattedMessages
        }));
        setMessages(formattedMessages);

        // Scroll to bottom when loading new messages
        setTimeout(() => {
          if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    fetchMessages();

    // Only set up subscription for real bookings
    if (!selectedBookingId.startsWith('simulated-')) {
      // Subscribe to new messages
      const subscription = supabase
        .channel(`messages:booking_id=eq.${selectedBookingId}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `booking_id=eq.${selectedBookingId}`
        }, async (payload) => {
          // Use placeholder sender info to avoid database issues
          const senderData = {
            full_name: payload.new.sender_id === user.id ? 'You' : 'Service Agent',
            avatar_url: null
          };

          const newMsg = {
            id: payload.new.id,
            booking_id: payload.new.booking_id,
            sender_id: payload.new.sender_id,
            content: payload.new.content,
            created_at: payload.new.created_at,
            is_from_me: payload.new.sender_id === user.id,
            sender_name: senderData?.full_name || 'Unknown',
            sender_avatar: senderData?.avatar_url
          };

          setMessages(prev => [...prev, newMsg]);
        })
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }

    // No cleanup needed for simulated bookings
    return () => {};
  }, [selectedBookingId, user]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !selectedBookingId) return;

    setSendingMessage(true);
    try {
      // Find the service agent ID for the selected booking
      const selectedBooking = bookings.find(b => b.id === selectedBookingId);
      if (!selectedBooking) throw new Error('Booking not found');

      // Check if this is a simulated booking
      if (selectedBookingId.startsWith('simulated-')) {
        // For simulated bookings, just add the message to the UI
        const newMsg = {
          id: 'msg-' + Date.now(),
          booking_id: selectedBookingId,
          sender_id: user.id,
          content: newMessage.trim(),
          created_at: new Date().toISOString(),
          is_from_me: true,
          sender_name: user.user_metadata?.full_name || 'You',
          sender_avatar: null
        };

        setMessages(prev => [...prev, newMsg]);

        // Simulate a response after a short delay
        setTimeout(() => {
          const responseMsg = {
            id: 'response-' + Date.now(),
            booking_id: selectedBookingId,
            sender_id: 'service-agent',
            content: 'This is a simulated response. In a real booking, the service agent would respond to your message.',
            created_at: new Date().toISOString(),
            is_from_me: false,
            sender_name: selectedBooking.service_package.service_agent?.full_name || 'Service Agent',
            sender_avatar: selectedBooking.service_package.service_agent?.avatar_url
          };

          setMessages(prev => [...prev, responseMsg]);
        }, 1000);

        setNewMessage('');
      } else {
        // For real bookings, send the message to the database
        // First, get the service package to find the service_agent_id
        const { data: servicePackageData, error: servicePackageError } = await supabase
          .from('service_packages')
          .select('service_agent_id')
          .eq('id', selectedBooking.service_package_id)
          .single();

        if (servicePackageError) throw servicePackageError;
        if (!servicePackageData || !servicePackageData.service_agent_id) {
          throw new Error('Service agent not found for this service package');
        }

        const serviceAgentId = servicePackageData.service_agent_id;

        // Make sure we have a valid booking_id
        if (!selectedBookingId) {
          throw new Error('No booking selected');
        }

        // Insert the message into the database
        const { data: messageData, error: messageError } = await supabase
          .from('messages')
          .insert({
            booking_id: selectedBookingId,
            sender_id: user.id,
            recipient_id: serviceAgentId,
            content: newMessage.trim(),
            is_read: false
          })
          .select()
          .single();

        if (messageError) {
          console.error('Error inserting message:', messageError);
          throw messageError;
        }

        console.log('Message inserted successfully:', messageData);

        // Create a formatted message object for the UI
        const newMessageObj = {
          id: messageData.id,
          booking_id: messageData.booking_id,
          sender_id: messageData.sender_id,
          recipient_id: messageData.recipient_id,
          content: messageData.content,
          is_read: messageData.is_read,
          created_at: messageData.created_at,
          updated_at: messageData.updated_at,
          sender: {
            full_name: 'You',
            avatar_url: null
          },
          is_from_me: true,
          sender_name: 'You',
          sender_avatar: null
        };

        // Add the message to both the current messages and the stored messages by booking ID
        const updatedMessages = [...messages, newMessageObj];
        setMessages(updatedMessages);

        // Update the stored messages for this booking
        setMessagesByBookingId(prev => ({
          ...prev,
          [selectedBookingId]: updatedMessages
        }));

        // Scroll to the bottom of the chat
        setTimeout(() => {
          if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
        setNewMessage('');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSendingMessage(false);
    }
  };

  const getSelectedBooking = () => {
    return bookings.find(b => b.id === selectedBookingId);
  };

  // Check if the selected booking is completed
  const isBookingCompleted = () => {
    const booking = getSelectedBooking();
    return booking?.status === 'completed';
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
        <Link to="/dashboard/client" className="inline-flex items-center text-blue-600 hover:text-blue-800">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-2">Messages</h1>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-4">
          {/* Bookings Sidebar */}
          <div className="border-r border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Conversations</h2>
            </div>
            <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
              {bookings.length === 0 ? (
                <div className="p-4 text-center text-gray-500">No bookings found</div>
              ) : (
                bookings.map((booking) => (
                  <button
                    key={booking.id}
                    className={"w-full text-left p-4 hover:bg-gray-50 focus:outline-none " + (
                      selectedBookingId === booking.id ? 'bg-blue-50' : ''
                    }}
                    onClick={() => setSelectedBookingId(booking.id)}
                  >
                    <div className="flex items-center">
                      {booking.service_package.service_agent?.avatar_url ? (
                        <img
                          src={booking.service_package.service_agent.avatar_url}
                          alt={booking.service_package.service_agent.full_name}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <User className="h-5 w-5 text-gray-400" />
                        </div>
                      )}
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">
                          {booking.service_package.service_agent?.full_name || 'Service Agent'}
                        </p>
                        <p className="text-xs text-gray-500 truncate max-w-[180px]">
                          {booking.service_package.title}
                        </p>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Messages Area */}
          <div className="md:col-span-3 flex flex-col h-[600px]">
            {selectedBookingId && getSelectedBooking() ? (
              <>
                {/* Conversation Header */}
                <div className="p-4 border-b border-gray-200 flex items-center">
                  {getSelectedBooking()?.service_package.service_agent?.avatar_url ? (
                    <img
                      src={getSelectedBooking()?.service_package.service_agent.avatar_url}
                      alt={getSelectedBooking()?.service_package.service_agent.full_name}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                  )}
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">
                      {getSelectedBooking()?.service_package.service_agent?.full_name || 'Service Agent'}
                    </p>
                    <p className="text-xs text-gray-500 flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {new Date(getSelectedBooking()?.scheduled_date || '').toLocaleDateString()}
                      {' - '}
                      {getSelectedBooking()?.service_package.title}
                    </p>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
                  {messages.length === 0 ? (
                    <div className="text-center text-gray-500 mt-8">
                      <p>No messages yet</p>
                      <p className="text-sm mt-1">Send a message to start the conversation</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.is_from_me ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[75%] rounded-lg px-4 py-2 ${
                              message.is_from_me
                                ? 'bg-blue-600 text-white'
                                : 'bg-white border border-gray-200 text-gray-800'
                            }`}
                          >
                            <div className="text-sm">{message.content}</div>
                            <div
                              className={`text-xs mt-1 ${
                                message.is_from_me ? 'text-blue-200' : 'text-gray-500'
                              }`}
                            >
                              {new Date(message.created_at).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </div>
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-gray-200">
                  {isBookingCompleted() ? (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 text-sm text-yellow-800">
                      This project has been completed. The conversation is now closed.
                    </div>
                  ) : (
                    <form onSubmit={handleSendMessage} className="flex">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 border border-gray-300 rounded-l-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <button
                        type="submit"
                        disabled={!newMessage.trim() || sendingMessage}
                        className="bg-blue-600 text-white px-4 py-2 rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                      >
                        {sendingMessage ? (
                          <div className="h-5 w-5 border-t-2 border-white rounded-full animate-spin" />
                        ) : (
                          <Send className="h-5 w-5" />
                        )}
                      </button>
                    </form>
                  )}
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <p>Select a conversation</p>
                  {bookings.length === 0 && (
                    <Link
                      to="/services"
                      className="mt-2 inline-block text-blue-600 hover:text-blue-800"
                    >
                      Book a service to start messaging
                    </Link>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientMessages;
