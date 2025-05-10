import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';
import { Calendar, Clock, MapPin, DollarSign, CheckCircle, AlertCircle, User, Phone, Mail, ArrowLeft } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';
import { formatCurrency } from '../../utils/formatters';

interface BookingDetails {
  id: string;
  client_id: string;
  service_agent_id: string;
  service_package_id: string;
  scheduled_date: string;
  scheduled_time: string;
  status: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  notes: string;
  price: number;
  payment_status: string;
  created_at: string;
  service_package: {
    id: string;
    title: string;
    description: string;
    duration: number;
    duration_unit: string;
  };
  service_agent: {
    id: string;
    full_name: string;
    email: string;
    phone: string;
    avatar_url?: string;
  };
  client: {
    id: string;
    full_name: string;
    email: string;
    phone: string;
    avatar_url?: string;
  };
}

const BookingConfirmationPage: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookingDetails = async () => {
      if (!bookingId || !user) return;

      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('bookings')
          .select(`
            *,
            service_package:service_packages(*),
            service_agent:profiles!bookings_service_agent_id_fkey(*),
            client:profiles!bookings_client_id_fkey(*)
          `)
          .eq('id', bookingId)
          .single();
        
        if (error) throw error;
        
        // Verify that the user is either the client or the service agent
        if (data.client_id !== user.id && data.service_agent_id !== user.id) {
          throw new Error('You do not have permission to view this booking');
        }
        
        setBooking(data as BookingDetails);
      } catch (err) {
        console.error('Error fetching booking details:', err);
        setError(err instanceof Error ? err.message : 'Failed to load booking details');
      } finally {
        setLoading(false);
      }
    };
    
    fetchBookingDetails();
  }, [bookingId, user]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-start">
            <AlertCircle className="h-6 w-6 text-red-500 mr-3 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-lg font-medium text-red-800">Error</h3>
              <p className="mt-2 text-sm text-red-700">{error}</p>
              <button
                onClick={() => navigate(-1)}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-start">
            <AlertCircle className="h-6 w-6 text-yellow-500 mr-3 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-lg font-medium text-yellow-800">Booking Not Found</h3>
              <p className="mt-2 text-sm text-yellow-700">
                The booking you are looking for could not be found.
              </p>
              <button
                onClick={() => navigate(-1)}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </button>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-semibold text-gray-900">Booking Confirmation</h1>
            <div className="flex space-x-2">
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadgeColor(booking.status)}`}>
                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPaymentStatusBadgeColor(booking.payment_status)}`}>
                {booking.payment_status.charAt(0).toUpperCase() + booking.payment_status.slice(1)}
              </span>
            </div>
          </div>
        </div>
        
        <div className="px-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Service Details */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Service Details</h2>
              <div className="space-y-3">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Service</h3>
                  <p className="text-base text-gray-900">{booking.service_package.title}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Description</h3>
                  <p className="text-sm text-gray-700">{booking.service_package.description}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Duration</h3>
                  <p className="text-base text-gray-900">
                    {booking.service_package.duration} {booking.service_package.duration_unit}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Price</h3>
                  <p className="text-base text-gray-900">{formatCurrency(booking.price)}</p>
                </div>
              </div>
            </div>
            
            {/* Appointment Details */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Appointment Details</h2>
              <div className="space-y-3">
                <div className="flex items-start">
                  <Calendar className="h-5 w-5 text-gray-500 mr-2 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Date</h3>
                    <p className="text-base text-gray-900">{formatDate(booking.scheduled_date)}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Clock className="h-5 w-5 text-gray-500 mr-2 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Time</h3>
                    <p className="text-base text-gray-900">{booking.scheduled_time}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 text-gray-500 mr-2 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Location</h3>
                    <p className="text-base text-gray-900">
                      {booking.address}, {booking.city}, {booking.state} {booking.zip_code}
                    </p>
                  </div>
                </div>
                {booking.notes && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Special Instructions</h3>
                    <p className="text-sm text-gray-700">{booking.notes}</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Service Agent Details */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Service Agent</h2>
              <div className="flex items-start">
                {booking.service_agent.avatar_url ? (
                  <img
                    src={booking.service_agent.avatar_url}
                    alt={booking.service_agent.full_name}
                    className="h-12 w-12 rounded-full mr-4"
                  />
                ) : (
                  <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center mr-4">
                    <User className="h-6 w-6 text-gray-500" />
                  </div>
                )}
                <div>
                  <p className="text-base font-medium text-gray-900">{booking.service_agent.full_name}</p>
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 text-gray-500 mr-1" />
                      <a href={`mailto:${booking.service_agent.email}`} className="text-sm text-blue-600 hover:text-blue-800">
                        {booking.service_agent.email}
                      </a>
                    </div>
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 text-gray-500 mr-1" />
                      <a href={`tel:${booking.service_agent.phone}`} className="text-sm text-blue-600 hover:text-blue-800">
                        {booking.service_agent.phone}
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Client Details */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Client</h2>
              <div className="flex items-start">
                {booking.client.avatar_url ? (
                  <img
                    src={booking.client.avatar_url}
                    alt={booking.client.full_name}
                    className="h-12 w-12 rounded-full mr-4"
                  />
                ) : (
                  <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center mr-4">
                    <User className="h-6 w-6 text-gray-500" />
                  </div>
                )}
                <div>
                  <p className="text-base font-medium text-gray-900">{booking.client.full_name}</p>
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 text-gray-500 mr-1" />
                      <a href={`mailto:${booking.client.email}`} className="text-sm text-blue-600 hover:text-blue-800">
                        {booking.client.email}
                      </a>
                    </div>
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 text-gray-500 mr-1" />
                      <a href={`tel:${booking.client.phone}`} className="text-sm text-blue-600 hover:text-blue-800">
                        {booking.client.phone}
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Booking Status */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start">
              <CheckCircle className="h-6 w-6 text-blue-500 mr-3 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-lg font-medium text-blue-800">Booking {booking.status}</h3>
                <p className="mt-1 text-sm text-blue-700">
                  {booking.status === 'confirmed' && 'Your booking has been confirmed. You will receive a reminder before your appointment.'}
                  {booking.status === 'pending' && 'Your booking is pending confirmation from the service agent.'}
                  {booking.status === 'cancelled' && 'This booking has been cancelled.'}
                  {booking.status === 'completed' && 'This service has been completed.'}
                </p>
                
                {booking.status === 'confirmed' && (
                  <div className="mt-4">
                    <button
                      onClick={() => navigate(`/dashboard/client/bookings/${booking.id}`)}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      View Booking Details
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmationPage;
