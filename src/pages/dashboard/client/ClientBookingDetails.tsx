import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabase';
import type { Database } from '../../../lib/database.types';
import { Calendar, MessageSquare, Star, Shield, ArrowLeft, MapPin, Clock, DollarSign, FileText, User } from 'lucide-react';
import ReviewForm from '../../../components/ReviewForm';
import { getSimulatedBookings } from '../../../utils/simulatedBookings';

type Booking = Database['public']['Tables']['bookings']['Row'] & {
  service_package: Database['public']['Tables']['service_packages']['Row'] & {
    service_agent: Database['public']['Tables']['profiles']['Row'];
  };
  review?: Database['public']['Tables']['reviews']['Row'];
};

const ClientBookingDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const showReview = searchParams.get('review') === 'true';
  const { user } = useAuth();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showReviewForm, setShowReviewForm] = useState(showReview);

  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        if (!user || !id) return;

        // Check if this is a simulated booking (ID starts with 'simulated-')
        if (id.startsWith('simulated-')) {
          // Get simulated bookings from localStorage
          const simulatedBookings = getSimulatedBookings(user.id);

          // Find the specific booking
          const simulatedBooking = simulatedBookings.find(booking => booking.id === id);

          if (simulatedBooking) {
            setBooking(simulatedBooking as Booking);
          } else {
            throw new Error('Simulated booking not found');
          }
        } else {
          // This is a real booking, fetch from the database using separate queries
          // Step 1: Get basic booking data
          const { data: bookingData, error: bookingError } = await supabase
            .from('bookings')
            .select('*')
            .eq('id', id)
            .eq('client_id', user.id)
            .single();

          if (bookingError) throw bookingError;

          // Step 2: Get service package data
          const { data: servicePackageData, error: servicePackageError } = await supabase
            .from('service_packages')
            .select('*')
            .eq('id', bookingData.service_package_id)
            .single();

          if (servicePackageError) throw servicePackageError;

          // Create a placeholder service agent instead of fetching
          const serviceAgentData = {
            id: servicePackageData.service_agent_id,
            full_name: 'Service Agent',
            email: 'service.agent@example.com',
            avatar_url: null,
            phone: '555-555-5555',
            zip_code: '12345'
          };

          // Step 4: Get review data
          const { data: reviewData } = await supabase
            .from('reviews')
            .select('*')
            .eq('booking_id', id)
            .single();

          // Step 5: Combine all data
          const combinedData = {
            ...bookingData,
            service_package: {
              ...servicePackageData,
              service_agent: serviceAgentData || null
            },
            review: reviewData || undefined
          };

          setBooking(combinedData as Booking);
        }
      } catch (error) {
        console.error('Error fetching booking details:', error);
        setError('Could not load booking details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchBookingDetails();
  }, [user, id]);

  const handleReviewSubmitted = async () => {
    setShowReviewForm(false);
    // Refresh booking data to show the new review
    if (user && id) {
      // Step 1: Get basic booking data
      const { data: bookingData, error: bookingError } = await supabase
        .from('bookings')
        .select('*')
        .eq('id', id)
        .eq('client_id', user.id)
        .single();

      if (bookingError) {
        console.error('Error fetching booking:', bookingError);
        return;
      }

      // Step 2: Get service package data
      const { data: servicePackageData, error: servicePackageError } = await supabase
        .from('service_packages')
        .select('*')
        .eq('id', bookingData.service_package_id)
        .single();

      if (servicePackageError) {
        console.error('Error fetching service package:', servicePackageError);
        return;
      }

      // Create a placeholder service agent instead of fetching
      const serviceAgentData = {
        id: servicePackageData.service_agent_id,
        full_name: 'Service Agent',
        email: 'service.agent@example.com',
        avatar_url: null,
        phone: '555-555-5555',
        zip_code: '12345'
      };

      // Step 4: Get review data
      const { data: reviewData } = await supabase
        .from('reviews')
        .select('*')
        .eq('booking_id', id)
        .single();

      // Step 5: Combine all data
      const combinedData = {
        ...bookingData,
        service_package: {
          ...servicePackageData,
          service_agent: serviceAgentData || null
        },
        review: reviewData || undefined
      };

      setBooking(combinedData as Booking);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          <p>{error || 'Booking not found'}</p>
          <Link to="/dashboard/client/bookings" className="mt-2 inline-block text-red-700 underline">
            Return to bookings
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link to="/dashboard/client/bookings" className="inline-flex items-center text-blue-600 hover:text-blue-800">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Bookings
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-2">Booking Details</h1>
      </div>

      {showReviewForm ? (
        <ReviewForm
          booking={booking}
          onSuccess={handleReviewSubmitted}
          onCancel={() => setShowReviewForm(false)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Booking Info */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex justify-between items-start">
                <h2 className="text-xl font-semibold text-gray-900">{booking.service_package.title}</h2>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    booking.status === 'completed'
                      ? 'bg-green-100 text-green-800'
                      : booking.status === 'confirmed'
                      ? 'bg-blue-100 text-blue-800'
                      : booking.status === 'cancelled'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                </span>
              </div>

              <div className="mt-4 space-y-3">
                <div className="flex items-start">
                  <Calendar className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Scheduled Date</p>
                    <p className="text-sm text-gray-600">
                      {new Date(booking.scheduled_date).toLocaleDateString()} at{' '}
                      {new Date(booking.scheduled_date).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <DollarSign className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Total Amount</p>
                    <p className="text-sm text-gray-600">${booking.total_amount}</p>
                  </div>
                </div>

                {booking.notes && (
                  <div className="flex items-start">
                    <FileText className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Notes</p>
                      <p className="text-sm text-gray-600">{booking.notes}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Service Details</h3>
                <p className="text-gray-600 mb-4">{booking.service_package.description}</p>

                {booking.service_package.scope && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Included in Service:</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      {booking.service_package.scope.map((item, index) => (
                        <li key={index} className="text-sm text-gray-600">{item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {booking.service_package.exclusions && booking.service_package.exclusions.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Not Included:</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      {booking.service_package.exclusions.map((item, index) => (
                        <li key={index} className="text-sm text-gray-600">{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  to={`/dashboard/client/messages?booking=${booking.id}`}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Message Service Agent
                </Link>

                {booking.status === 'completed' && !booking.review && (
                  <button
                    onClick={() => setShowReviewForm(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <Star className="mr-2 h-4 w-4" />
                    Leave a Review
                  </button>
                )}

                {booking.status === 'completed' && (
                  <Link
                    to={`/dashboard/client/warranty/new?booking=${booking.id}`}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <Shield className="mr-2 h-4 w-4" />
                    File Warranty Claim
                  </Link>
                )}
              </div>
            </div>

            {booking.review && (
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Your Review</h3>
                <div className="flex items-center mb-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${
                          i < booking.review!.rating ? 'text-yellow-400' : 'text-gray-300'
                        }`}
                        fill={i < booking.review!.rating ? 'currentColor' : 'none'}
                      />
                    ))}
                  </div>
                  <span className="ml-2 text-sm text-gray-600">
                    {new Date(booking.review.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-gray-600">{booking.review.comment}</p>
              </div>
            )}
          </div>

          {/* Service Agent Info */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Service Agent</h3>
              <div className="flex items-center">
                {booking.service_package.service_agent.avatar_url ? (
                  <img
                    src={booking.service_package.service_agent.avatar_url}
                    alt={booking.service_package.service_agent.full_name}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="h-6 w-6 text-gray-400" />
                  </div>
                )}
                <div className="ml-4">
                  <h4 className="text-sm font-medium text-gray-900">
                    {booking.service_package.service_agent.full_name}
                  </h4>
                  <p className="text-sm text-gray-500">
                    {booking.service_package.service_agent.email}
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <Link
                  to={`/dashboard/client/messages?booking=${booking.id}`}
                  className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Contact
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientBookingDetails;
