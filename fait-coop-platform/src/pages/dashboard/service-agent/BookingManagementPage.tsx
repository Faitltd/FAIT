import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../lib/supabaseClient';
import { useAuth } from '../../../contexts/AuthContext';
import { Calendar, Clock, MapPin, User, CheckCircle, XCircle, AlertCircle, Filter, ChevronDown, Search } from 'lucide-react';
import LoadingSpinner from '../../../components/LoadingSpinner';
import { formatCurrency } from '../../../utils/formatters';
import { format, parseISO, isAfter, isBefore, startOfDay } from 'date-fns';

interface Booking {
  id: string;
  client_id: string;
  service_package_id: string;
  scheduled_date: string;
  scheduled_time: string;
  status: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  price: number;
  payment_status: string;
  created_at: string;
  is_recurring: boolean;
  recurrence_group: string | null;
  service_package: {
    title: string;
  };
  client: {
    full_name: string;
    avatar_url?: string;
  };
}

const BookingManagementPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<'upcoming' | 'past' | 'all'>('upcoming');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (!user) return;
    
    fetchBookings();
  }, [user, statusFilter, dateFilter]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('bookings')
        .select(`
          id,
          client_id,
          service_package_id,
          scheduled_date,
          scheduled_time,
          status,
          address,
          city,
          state,
          zip_code,
          price,
          payment_status,
          created_at,
          is_recurring,
          recurrence_group,
          service_package:service_packages(title),
          client:profiles!bookings_client_id_fkey(full_name, avatar_url)
        `)
        .eq('service_agent_id', user.id)
        .order('scheduled_date', { ascending: true })
        .order('scheduled_time', { ascending: true });
      
      // Apply status filter
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }
      
      // Apply date filter
      if (dateFilter === 'upcoming') {
        const today = new Date().toISOString().split('T')[0];
        query = query.gte('scheduled_date', today);
      } else if (dateFilter === 'past') {
        const today = new Date().toISOString().split('T')[0];
        query = query.lt('scheduled_date', today);
      }
      
      const { data, error: fetchError } = await query;
      
      if (fetchError) throw fetchError;
      
      setBookings(data as Booking[]);
      setError(null);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError('Failed to load bookings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmBooking = async (bookingId: string) => {
    try {
      const { error: updateError } = await supabase
        .from('bookings')
        .update({ status: 'confirmed' })
        .eq('id', bookingId);
      
      if (updateError) throw updateError;
      
      // Update local state
      setBookings(prev => 
        prev.map(booking => 
          booking.id === bookingId 
            ? { ...booking, status: 'confirmed' } 
            : booking
        )
      );
    } catch (err) {
      console.error('Error confirming booking:', err);
      setError('Failed to confirm booking. Please try again.');
    }
  };

  const handleDeclineBooking = async (bookingId: string) => {
    try {
      const { error: updateError } = await supabase
        .from('bookings')
        .update({ 
          status: 'cancelled',
          cancellation_reason: 'Declined by service agent'
        })
        .eq('id', bookingId);
      
      if (updateError) throw updateError;
      
      // Update local state
      setBookings(prev => 
        prev.map(booking => 
          booking.id === bookingId 
            ? { ...booking, status: 'cancelled' } 
            : booking
        )
      );
    } catch (err) {
      console.error('Error declining booking:', err);
      setError('Failed to decline booking. Please try again.');
    }
  };

  const handleViewBooking = (bookingId: string) => {
    navigate(`/dashboard/service-agent/bookings/${bookingId}`);
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPaymentStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'refunded':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return format(parseISO(dateString), 'MMM d, yyyy');
  };

  const formatTime = (timeString: string) => {
    try {
      return format(parseISO(`2000-01-01T${timeString}`), 'h:mm a');
    } catch (e) {
      return timeString;
    }
  };

  const isBookingToday = (dateString: string) => {
    const today = startOfDay(new Date());
    const bookingDate = startOfDay(parseISO(dateString));
    return today.getTime() === bookingDate.getTime();
  };

  const isBookingUpcoming = (dateString: string) => {
    const today = startOfDay(new Date());
    const bookingDate = startOfDay(parseISO(dateString));
    return isAfter(bookingDate, today);
  };

  const isBookingPast = (dateString: string) => {
    const today = startOfDay(new Date());
    const bookingDate = startOfDay(parseISO(dateString));
    return isBefore(bookingDate, today);
  };

  const filteredBookings = bookings.filter(booking => {
    if (searchQuery.trim() === '') return true;
    
    const query = searchQuery.toLowerCase();
    return (
      booking.client.full_name.toLowerCase().includes(query) ||
      booking.service_package.title.toLowerCase().includes(query) ||
      booking.address.toLowerCase().includes(query) ||
      booking.city.toLowerCase().includes(query) ||
      booking.state.toLowerCase().includes(query) ||
      booking.zip_code.toLowerCase().includes(query)
    );
  });

  const renderBookingCard = (booking: Booking) => {
    const isToday = isBookingToday(booking.scheduled_date);
    const isPast = isBookingPast(booking.scheduled_date);
    
    return (
      <div 
        key={booking.id} 
        className={`bg-white rounded-lg shadow-sm overflow-hidden border-l-4 ${
          isToday ? 'border-blue-500' : isPast ? 'border-gray-300' : 'border-green-500'
        }`}
      >
        <div className="px-6 py-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-medium text-gray-900">{booking.service_package.title}</h3>
              <div className="flex items-center mt-1">
                <User className="h-4 w-4 text-gray-500 mr-1" />
                <span className="text-sm text-gray-600">{booking.client.full_name}</span>
              </div>
            </div>
            <div className="flex space-x-2">
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadgeColor(booking.status)}`}>
                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
              </span>
              {booking.is_recurring && (
                <span className="px-3 py-1 rounded-full text-xs font-medium border bg-purple-100 text-purple-800 border-purple-200">
                  Recurring
                </span>
              )}
            </div>
          </div>
          
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="flex items-start">
              <Calendar className="h-5 w-5 text-gray-500 mr-2 flex-shrink-0" />
              <div>
                <div className="text-sm font-medium text-gray-700">Date</div>
                <div className="text-sm text-gray-900">{formatDate(booking.scheduled_date)}</div>
              </div>
            </div>
            
            <div className="flex items-start">
              <Clock className="h-5 w-5 text-gray-500 mr-2 flex-shrink-0" />
              <div>
                <div className="text-sm font-medium text-gray-700">Time</div>
                <div className="text-sm text-gray-900">{formatTime(booking.scheduled_time)}</div>
              </div>
            </div>
          </div>
          
          <div className="mt-4 flex items-start">
            <MapPin className="h-5 w-5 text-gray-500 mr-2 flex-shrink-0" />
            <div>
              <div className="text-sm font-medium text-gray-700">Location</div>
              <div className="text-sm text-gray-900">
                {booking.address}, {booking.city}, {booking.state} {booking.zip_code}
              </div>
            </div>
          </div>
          
          <div className="mt-4 flex justify-between items-center">
            <div>
              <span className="text-sm font-medium text-gray-700">Price:</span>
              <span className="ml-1 text-sm font-semibold text-gray-900">{formatCurrency(booking.price)}</span>
              <span className={`ml-2 px-2 py-0.5 rounded text-xs font-medium ${getPaymentStatusBadgeColor(booking.payment_status)}`}>
                {booking.payment_status}
              </span>
            </div>
            
            <div className="flex space-x-2">
              {booking.status === 'pending' && (
                <>
                  <button
                    onClick={() => handleConfirmBooking(booking.id)}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    <CheckCircle className="h-3.5 w-3.5 mr-1" />
                    Confirm
                  </button>
                  
                  <button
                    onClick={() => handleDeclineBooking(booking.id)}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    <XCircle className="h-3.5 w-3.5 mr-1" />
                    Decline
                  </button>
                </>
              )}
              
              <button
                onClick={() => handleViewBooking(booking.id)}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                View Details
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Manage Bookings</h1>
          <p className="mt-1 text-sm text-gray-600">
            View and manage your service bookings
          </p>
        </div>
        
        <div className="mt-4 sm:mt-0">
          <button
            onClick={() => navigate('/dashboard/service-agent/availability')}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Calendar className="h-4 w-4 mr-2" />
            Manage Availability
          </button>
        </div>
      </div>
      
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md flex items-start">
          <AlertCircle className="h-5 w-5 text-red-500 mr-3 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
      
      <div className="mb-6 bg-white rounded-lg shadow-sm p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-grow max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search bookings..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          
          <div className="mt-4 sm:mt-0 flex items-center">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
              <ChevronDown className={`ml-1 h-4 w-4 transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
            
            <button
              onClick={fetchBookings}
              className="ml-3 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Refresh
            </button>
          </div>
        </div>
        
        {showFilters && (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                id="status-filter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="date-filter" className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <select
                id="date-filter"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value as any)}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option value="all">All Dates</option>
                <option value="upcoming">Upcoming</option>
                <option value="past">Past</option>
              </select>
            </div>
          </div>
        )}
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner />
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
          <p className="text-gray-500">
            {searchQuery
              ? 'No bookings match your search criteria.'
              : statusFilter !== 'all' || dateFilter !== 'all'
              ? 'No bookings match your filter criteria.'
              : 'You have no bookings yet.'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Today's Bookings */}
          {filteredBookings.some(booking => isBookingToday(booking.scheduled_date)) && (
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">Today's Bookings</h2>
              <div className="space-y-4">
                {filteredBookings
                  .filter(booking => isBookingToday(booking.scheduled_date))
                  .map(renderBookingCard)}
              </div>
            </div>
          )}
          
          {/* Upcoming Bookings */}
          {filteredBookings.some(booking => 
            isBookingUpcoming(booking.scheduled_date) && !isBookingToday(booking.scheduled_date)
          ) && (
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">Upcoming Bookings</h2>
              <div className="space-y-4">
                {filteredBookings
                  .filter(booking => 
                    isBookingUpcoming(booking.scheduled_date) && !isBookingToday(booking.scheduled_date)
                  )
                  .map(renderBookingCard)}
              </div>
            </div>
          )}
          
          {/* Past Bookings */}
          {filteredBookings.some(booking => isBookingPast(booking.scheduled_date)) && (
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">Past Bookings</h2>
              <div className="space-y-4">
                {filteredBookings
                  .filter(booking => isBookingPast(booking.scheduled_date))
                  .map(renderBookingCard)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BookingManagementPage;
