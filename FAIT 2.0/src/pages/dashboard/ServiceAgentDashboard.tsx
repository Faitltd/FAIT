import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Calendar, MessageSquare, FileText, Star, Shield, Package, DollarSign } from 'lucide-react';

const ServiceAgentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState<any>({
    bookings: { total: 0, upcoming: 0, pending: 0 },
    messages: { unread: 0 },
    services: { active: 0 },
    earnings: { total: 0, thisMonth: 0 },
    reviews: { average: 0, count: 0 },
  });
  const [upcomingBookings, setUpcomingBookings] = useState<any[]>([]);
  const [recentMessages, setRecentMessages] = useState<any[]>([]);
  const [pendingBookings, setPendingBookings] = useState<any[]>([]);
  
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Fetch profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (profileError) {
          console.error('Error fetching profile:', profileError);
        } else {
          setProfile(profileData);
        }
        
        // Fetch booking stats
        const { data: bookingsData, error: bookingsError } = await supabase
          .from('bookings')
          .select('id, status, booking_date, start_time, client_id, clients:client_id(full_name), service_package_id, service_packages:service_package_id(title), total_amount')
          .eq('service_agent_id', user.id)
          .order('booking_date', { ascending: true });
          
        if (bookingsError) {
          console.error('Error fetching bookings:', bookingsError);
        } else {
          const upcoming = bookingsData.filter(
            (booking) => 
              booking.status === 'confirmed' && 
              new Date(booking.booking_date) >= new Date()
          );
          
          const pending = bookingsData.filter(
            (booking) => booking.status === 'pending'
          );
          
          // Calculate earnings
          const totalEarnings = bookingsData
            .filter((booking) => booking.status === 'completed')
            .reduce((sum, booking) => sum + (booking.total_amount || 0), 0);
            
          const thisMonthEarnings = bookingsData
            .filter((booking) => {
              const bookingDate = new Date(booking.booking_date);
              const now = new Date();
              return (
                booking.status === 'completed' &&
                bookingDate.getMonth() === now.getMonth() &&
                bookingDate.getFullYear() === now.getFullYear()
              );
            })
            .reduce((sum, booking) => sum + (booking.total_amount || 0), 0);
          
          setStats((prev: any) => ({
            ...prev,
            bookings: {
              total: bookingsData.length,
              upcoming: upcoming.length,
              pending: pending.length,
            },
            earnings: {
              total: totalEarnings,
              thisMonth: thisMonthEarnings,
            },
          }));
          
          setUpcomingBookings(upcoming.slice(0, 3));
          setPendingBookings(pending.slice(0, 3));
        }
        
        // Fetch unread messages
        const { data: messagesData, error: messagesError } = await supabase
          .from('messages')
          .select('id, sender_id, message_text, created_at, senders:sender_id(full_name)')
          .eq('recipient_id', user.id)
          .eq('is_read', false)
          .order('created_at', { ascending: false });
          
        if (messagesError) {
          console.error('Error fetching messages:', messagesError);
        } else {
          setStats((prev: any) => ({
            ...prev,
            messages: {
              unread: messagesData.length,
            },
          }));
          
          setRecentMessages(messagesData.slice(0, 3));
        }
        
        // Fetch active services
        const { data: servicesData, error: servicesError } = await supabase
          .from('service_packages')
          .select('id')
          .eq('service_agent_id', user.id)
          .eq('is_active', true);
          
        if (servicesError) {
          console.error('Error fetching services:', servicesError);
        } else {
          setStats((prev: any) => ({
            ...prev,
            services: {
              active: servicesData.length,
            },
          }));
        }
        
        // Fetch reviews
        const { data: reviewsData, error: reviewsError } = await supabase
          .from('reviews')
          .select('rating')
          .eq('service_agent_id', user.id);
          
        if (reviewsError) {
          console.error('Error fetching reviews:', reviewsError);
        } else {
          const reviewCount = reviewsData.length;
          const reviewSum = reviewsData.reduce((sum, review) => sum + review.rating, 0);
          const reviewAverage = reviewCount > 0 ? reviewSum / reviewCount : 0;
          
          setStats((prev: any) => ({
            ...prev,
            reviews: {
              average: reviewAverage.toFixed(1),
              count: reviewCount,
            },
          }));
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [user]);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Welcome section */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-gray-800">
          Welcome, {profile?.full_name || 'there'}
        </h1>
        <p className="text-gray-600 mt-2">
          Here's what's happening with your services and bookings.
        </p>
      </div>
      
      {/* Stats section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <Calendar className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Upcoming Bookings</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.bookings.upcoming}</p>
            </div>
          </div>
          <div className="mt-4">
            <Link
              to="/dashboard/service-agent/bookings"
              className="text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              View all bookings
            </Link>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
              <MessageSquare className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Pending Requests</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.bookings.pending}</p>
            </div>
          </div>
          <div className="mt-4">
            <Link
              to="/dashboard/service-agent/bookings?status=pending"
              className="text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              View pending requests
            </Link>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <DollarSign className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">This Month</p>
              <p className="text-2xl font-semibold text-gray-900">${stats.earnings.thisMonth.toFixed(2)}</p>
            </div>
          </div>
          <div className="mt-4">
            <Link
              to="/dashboard/service-agent/earnings"
              className="text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              View earnings
            </Link>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600">
              <Star className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Rating</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.reviews.average} <span className="text-sm text-gray-500">({stats.reviews.count})</span></p>
            </div>
          </div>
          <div className="mt-4">
            <Link
              to="/dashboard/service-agent/reviews"
              className="text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              View reviews
            </Link>
          </div>
        </div>
      </div>
      
      {/* Pending booking requests section */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Pending Booking Requests</h2>
          <Link
            to="/dashboard/service-agent/bookings?status=pending"
            className="text-sm font-medium text-blue-600 hover:text-blue-500"
          >
            View all
          </Link>
        </div>
        
        {pendingBookings.length === 0 ? (
          <p className="text-gray-500">You have no pending booking requests.</p>
        ) : (
          <div className="space-y-4">
            {pendingBookings.map((booking) => (
              <div key={booking.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {booking.service_packages?.title || 'Service Booking'}
                    </h3>
                    <p className="text-gray-500 text-sm">
                      from {booking.clients?.full_name || 'Client'}
                    </p>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    {booking.status}
                  </span>
                </div>
                <div className="mt-2 flex items-center text-sm text-gray-500">
                  <Calendar className="h-4 w-4 mr-1" />
                  {new Date(booking.booking_date).toLocaleDateString()} at {booking.start_time}
                </div>
                <div className="mt-2 flex items-center text-sm text-gray-500">
                  <DollarSign className="h-4 w-4 mr-1" />
                  ${booking.total_amount.toFixed(2)}
                </div>
                <div className="mt-3 flex space-x-3">
                  <button
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    onClick={() => {
                      // Handle accept booking
                    }}
                  >
                    Accept
                  </button>
                  <button
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    onClick={() => {
                      // Handle decline booking
                    }}
                  >
                    Decline
                  </button>
                  <Link
                    to={`/dashboard/service-agent/bookings/${booking.id}`}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    View details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Upcoming bookings section */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Upcoming Bookings</h2>
          <Link
            to="/dashboard/service-agent/bookings"
            className="text-sm font-medium text-blue-600 hover:text-blue-500"
          >
            View all
          </Link>
        </div>
        
        {upcomingBookings.length === 0 ? (
          <p className="text-gray-500">You have no upcoming bookings.</p>
        ) : (
          <div className="space-y-4">
            {upcomingBookings.map((booking) => (
              <div key={booking.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {booking.service_packages?.title || 'Service Booking'}
                    </h3>
                    <p className="text-gray-500 text-sm">
                      for {booking.clients?.full_name || 'Client'}
                    </p>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {booking.status}
                  </span>
                </div>
                <div className="mt-2 flex items-center text-sm text-gray-500">
                  <Calendar className="h-4 w-4 mr-1" />
                  {new Date(booking.booking_date).toLocaleDateString()} at {booking.start_time}
                </div>
                <div className="mt-2 flex items-center text-sm text-gray-500">
                  <DollarSign className="h-4 w-4 mr-1" />
                  ${booking.total_amount.toFixed(2)}
                </div>
                <div className="mt-3">
                  <Link
                    to={`/dashboard/service-agent/bookings/${booking.id}`}
                    className="text-sm font-medium text-blue-600 hover:text-blue-500"
                  >
                    View details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Recent messages section */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Recent Messages</h2>
          <Link
            to="/dashboard/service-agent/messages"
            className="text-sm font-medium text-blue-600 hover:text-blue-500"
          >
            View all
          </Link>
        </div>
        
        {recentMessages.length === 0 ? (
          <p className="text-gray-500">You have no unread messages.</p>
        ) : (
          <div className="space-y-4">
            {recentMessages.map((message) => (
              <div key={message.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {message.senders?.full_name || 'Client'}
                    </h3>
                    <p className="text-gray-500 text-sm">
                      {new Date(message.created_at).toLocaleString()}
                    </p>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    Unread
                  </span>
                </div>
                <p className="mt-2 text-gray-600 line-clamp-2">{message.message_text}</p>
                <div className="mt-3">
                  <Link
                    to={`/dashboard/service-agent/messages?sender=${message.sender_id}`}
                    className="text-sm font-medium text-blue-600 hover:text-blue-500"
                  >
                    View conversation
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Services section */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Your Services</h2>
          <Link
            to="/dashboard/service-agent/services"
            className="text-sm font-medium text-blue-600 hover:text-blue-500"
          >
            View all
          </Link>
        </div>
        
        <div className="mt-6">
          <Link
            to="/dashboard/service-agent/services/new"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Package className="h-4 w-4 mr-2" />
            Create new service
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ServiceAgentDashboard;
