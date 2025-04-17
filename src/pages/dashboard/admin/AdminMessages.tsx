import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabase';
import type { Database } from '../../../lib/database.types';
import { ArrowLeft, Send, User, Calendar, Search } from 'lucide-react';

type Booking = Database['public']['Tables']['bookings']['Row'] & {
  client: Pick<Database['public']['Tables']['profiles']['Row'], 'full_name'>;
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

const AdminMessages = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [messagesByBookingId, setMessagesByBookingId] = useState<Record<string, Message[]>>({});
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);

  // Fetch all bookings for admin
  useEffect(() => {
    const fetchBookings = async () => {
      if (!user) return;

      try {
        // Admin can see all bookings
        const { data: bookingsData, error: bookingsError } = await supabase
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
            client:client_id(full_name),
            service_package:service_package_id(
              title,
              service_agent:service_agent_id(full_name, avatar_url)
            )
          \`)
          .order('created_at', { ascending: false });

        if (bookingsError) throw bookingsError;

        // Process bookings to handle any missing data
        const processedBookings = bookingsData.map(booking => ({
          ...booking,
          client: booking.client || { full_name: 'Unknown Client' },
          service_package: booking.service_package || {
            title: 'Unknown Service',
            service_agent: {
              full_name: 'Unknown Service Agent',
              avatar_url: null
            }
          }
        }));

        setBookings(processedBookings);
        setFilteredBookings(processedBookings);

        // If no booking is selected but we have bookings, select the first one
        if (!selectedBookingId && processedBookings.length > 0) {
          setSelectedBookingId(processedBookings[0].id);
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching bookings:', error);
        setLoading(false);
      }
    };

    fetchBookings();
  }, [user, selectedBookingId]);

  // Filter bookings when search term changes
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredBookings(bookings);
      return;
    }

    const lowerCaseSearch = searchTerm.toLowerCase();
    const filtered = bookings.filter(booking =>
      booking.client.full_name.toLowerCase().includes(lowerCaseSearch) ||
      booking.service_package.title.toLowerCase().includes(lowerCaseSearch) ||
      booking.service_package.service_agent.full_name.toLowerCase().includes(lowerCaseSearch)
    );

    setFilteredBookings(filtered);
  }, [searchTerm, bookings]);

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
        // Fetch messages from the database
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

    // Set up subscription for real-time updates
    const subscription = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: 'booking_id=eq.' + selectedBookingId
        },
        async (payload) => {
          // Get sender info
          const { data: senderData } = await supabase
            .from('profiles')
            .select('full_name, avatar_url')
            .eq('id', payload.new.sender_id)
            .single();

          const newMsg = {
            ...payload.new,
            sender_name: senderData?.full_name || 'Unknown User',
            sender_avatar: senderData?.avatar_url
          };

          // Update both the current messages and stored messages
          const updatedMessages = [...messages, newMsg];
          setMessages(updatedMessages);
          setMessagesByBookingId(prev => ({
            ...prev,
            [selectedBookingId]: updatedMessages
          }));

          // Scroll to the new message
          setTimeout(() => {
            if (messagesEndRef.current) {
              messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
            }
          }, 100);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [selectedBookingId, user, messages, messagesByBookingId]);

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
        <Link to="/dashboard/admin" className="inline-flex items-center text-blue-600 hover:text-blue-800">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-2">All Conversations</h1>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-4">
          {/* Bookings Sidebar */}
          <div className="border-r border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Conversations</h2>
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
            </div>
            <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
              {filteredBookings.length === 0 ? (
                <div className="p-4 text-center text-gray-500">No bookings found</div>
              ) : (
                filteredBookings.map((booking) => (
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
                          {booking.client.full_name} & {booking.service_package.service_agent?.full_name || 'Service Agent'}
                        </p>
                        <p className="text-xs text-gray-500">{booking.service_package.title}</p>
                        <div className="flex items-center mt-1">
                          <Calendar className="h-3 w-3 text-gray-400 mr-1" />
                          <p className="text-xs text-gray-500">
                            {new Date(booking.scheduled_date).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="mt-1">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                            booking.status === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : booking.status === 'cancelled'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Messages Area */}
          <div className="col-span-3 flex flex-col h-[700px]">
            {selectedBookingId ? (
              <>
                {/* Conversation Header */}
                <div className="p-4 border-b border-gray-200 flex items-center">
                  {getSelectedBooking()?.service_package.service_agent?.avatar_url ? (
                    <img
                      src={getSelectedBooking()?.service_package.service_agent?.avatar_url}
                      alt={getSelectedBooking()?.service_package.service_agent?.full_name}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                  )}
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">
                      {getSelectedBooking()?.client.full_name} & {getSelectedBooking()?.service_package.service_agent?.full_name || 'Service Agent'}
                    </p>
                    <p className="text-xs text-gray-500">{getSelectedBooking()?.service_package.title}</p>
                  </div>
                  <div className="ml-auto">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      getSelectedBooking()?.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : getSelectedBooking()?.status === 'cancelled'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {getSelectedBooking()?.status.charAt(0).toUpperCase() + getSelectedBooking()?.status.slice(1)}
                    </span>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 p-4 overflow-y-auto">
                  {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-gray-500">No messages yet</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className="flex"
                        >
                          <div className="max-w-[75%] rounded-lg px-4 py-2 bg-white border border-gray-200 text-gray-800">
                            <div className="text-xs font-medium text-gray-500 mb-1">
                              {message.sender_name}
                            </div>
                            <div className="text-sm">{message.content}</div>
                            <div className="text-xs mt-1 text-gray-500">
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

                {/* Message Input - Admin can only view, not send messages */}
                <div className="p-4 border-t border-gray-200">
                  <div className="bg-gray-50 border border-gray-200 rounded-md p-3 text-sm text-gray-700">
                    As an admin, you can only view conversations. You cannot send messages.
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <p>Select a conversation to view messages</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminMessages;
