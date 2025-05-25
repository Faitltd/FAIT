import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import supabase from '../../utils/supabaseClient';;
import MainLayout from '../../components/MainLayout';
import { getBookingById, cancelBooking, updateBookingNotes } from '../../api/bookingApi';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
// Using singleton Supabase client;

const BookingDetailsPage = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelError, setCancelError] = useState(null);
  const [notes, setNotes] = useState('');
  const [editingNotes, setEditingNotes] = useState(false);
  const [notesLoading, setNotesLoading] = useState(false);
  const [notesError, setNotesError] = useState(null);

  // Fetch booking data
  useEffect(() => {
    const fetchBooking = async () => {
      try {
        setLoading(true);

        // Get authenticated user
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);

        if (!user) {
          navigate('/login');
          return;
        }

        // Get user type
        const { data: profile } = await supabase
          .from('profiles')
          .select('user_type')
          .eq('id', user.id)
          .single();

        setUserType(profile?.user_type);

        // Get booking details
        const bookingData = await getBookingById(bookingId);

        // Check if user has permission to view this booking
        if (profile?.user_type === 'client' && bookingData.client_id !== user.id) {
          setError('You do not have permission to view this booking');
          setLoading(false);
          return;
        } else if (profile?.user_type === 'service_agent' && bookingData.service_agent_id !== user.id) {
          setError('You do not have permission to view this booking');
          setLoading(false);
          return;
        }

        setBooking(bookingData);
        setNotes(bookingData.notes || '');
        setError(null);
      } catch (err) {
        console.error('Error fetching booking:', err);
        setError('Failed to load booking details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId, navigate]);

  // Handle booking cancellation
  const handleCancelBooking = async () => {
    try {
      setCancelLoading(true);
      setCancelError(null);

      await cancelBooking(bookingId, cancelReason);

      // Update booking status locally
      setBooking({
        ...booking,
        status: 'cancelled',
        cancellation_reason: cancelReason
      });

      // Close modal
      setShowCancelModal(false);
      setCancelReason('');
    } catch (err) {
      console.error('Error cancelling booking:', err);
      setCancelError('Failed to cancel booking. Please try again.');
    } finally {
      setCancelLoading(false);
    }
  };

  // Handle notes update
  const handleUpdateNotes = async () => {
    try {
      setNotesLoading(true);
      setNotesError(null);

      await updateBookingNotes(bookingId, notes);

      // Update booking notes locally
      setBooking({
        ...booking,
        notes
      });

      // Exit editing mode
      setEditingNotes(false);
    } catch (err) {
      console.error('Error updating notes:', err);
      setNotesError('Failed to update notes. Please try again.');
    } finally {
      setNotesLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Format time for display
  const formatTime = (timeString) => {
    if (!timeString) return '';

    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  // Get status badge class
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Check if booking can be cancelled
  const canCancelBooking = () => {
    if (!booking) return false;

    // Only pending or confirmed bookings can be cancelled
    if (booking.status !== 'pending' && booking.status !== 'confirmed') {
      return false;
    }

    // Check if service date is in the future
    const serviceDate = new Date(booking.service_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return serviceDate >= today;
  };

  if (loading) {
    return (
      <MainLayout currentPage="booking">
        <div className="py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error || !booking) {
    return (
      <MainLayout currentPage="booking">
        <div className="py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              {error || 'Booking not found'}
            </div>
            <div className="mt-4">
              <Link
                to="/bookings"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                View All Bookings
              </Link>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout currentPage="booking">
      <div className="py-10">
        <header>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold text-gray-900">Booking Details</h1>
              <Link
                to="/bookings"
                className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Back to Bookings
              </Link>
            </div>
          </div>
        </header>
        <main>
          <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div className="px-4 py-6 sm:px-0">
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                {/* Booking Header */}
                <div className="px-4 py-5 sm:px-6 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">
                        Booking #{booking.id.substring(0, 8)}
                      </h2>
                      <p className="mt-1 text-sm text-gray-500">
                        Created on {new Date(booking.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(booking.status)}`}>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Booking Details */}
                <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
                  <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                    {/* Service */}
                    <div className="sm:col-span-3">
                      <dt className="text-sm font-medium text-gray-500">Service</dt>
                      <dd className="mt-1 text-sm text-gray-900">{booking.service_name}</dd>
                    </div>

                    {/* Service Provider */}
                    <div className="sm:col-span-3">
                      <dt className="text-sm font-medium text-gray-500">
                        {userType === 'client' ? 'Service Provider' : 'Client'}
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {userType === 'client' ? booking.service_agent_name : booking.client_name}
                      </dd>
                    </div>

                    {/* Date */}
                    <div className="sm:col-span-3">
                      <dt className="text-sm font-medium text-gray-500">Date</dt>
                      <dd className="mt-1 text-sm text-gray-900">{formatDate(booking.service_date)}</dd>
                    </div>

                    {/* Time */}
                    <div className="sm:col-span-3">
                      <dt className="text-sm font-medium text-gray-500">Time</dt>
                      <dd className="mt-1 text-sm text-gray-900">{formatTime(booking.start_time)}</dd>
                    </div>

                    {/* Address */}
                    <div className="sm:col-span-6">
                      <dt className="text-sm font-medium text-gray-500">Service Address</dt>
                      <dd className="mt-1 text-sm text-gray-900">{booking.address}</dd>
                    </div>

                    {/* Notes */}
                    <div className="sm:col-span-6">
                      <dt className="text-sm font-medium text-gray-500">
                        <div className="flex justify-between items-center">
                          <span>Notes</span>
                          {userType === 'client' && (
                            <button
                              type="button"
                              onClick={() => setEditingNotes(!editingNotes)}
                              className="text-xs text-blue-600 hover:text-blue-500"
                            >
                              {editingNotes ? 'Cancel' : 'Edit'}
                            </button>
                          )}
                        </div>
                      </dt>
                      <dd className="mt-1">
                        {editingNotes ? (
                          <div>
                            <textarea
                              rows={3}
                              value={notes}
                              onChange={(e) => setNotes(e.target.value)}
                              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                              placeholder="Add any special instructions or details"
                            />
                            {notesError && (
                              <p className="mt-2 text-sm text-red-600">{notesError}</p>
                            )}
                            <div className="mt-2 flex justify-end space-x-3">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingNotes(false);
                                  setNotes(booking.notes || '');
                                }}
                                className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                onClick={handleUpdateNotes}
                                disabled={notesLoading}
                                className="inline-flex items-center px-3 py-1.5 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                              >
                                {notesLoading ? 'Saving...' : 'Save'}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-gray-900">
                            {booking.notes || 'No notes provided'}
                          </p>
                        )}
                      </dd>
                    </div>

                    {/* Price */}
                    <div className="sm:col-span-3">
                      <dt className="text-sm font-medium text-gray-500">Price</dt>
                      <dd className="mt-1 text-sm text-gray-900">${booking.price.toFixed(2)}</dd>
                    </div>

                    {/* Payment Status */}
                    <div className="sm:col-span-3">
                      <dt className="text-sm font-medium text-gray-500">Payment Status</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {booking.payment_status ? (
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            booking.payment_status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {booking.payment_status.charAt(0).toUpperCase() + booking.payment_status.slice(1)}
                          </span>
                        ) : (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                            Not Paid
                          </span>
                        )}
                      </dd>
                    </div>

                    {/* Cancellation Reason */}
                    {booking.status === 'cancelled' && booking.cancellation_reason && (
                      <div className="sm:col-span-6">
                        <dt className="text-sm font-medium text-gray-500">Cancellation Reason</dt>
                        <dd className="mt-1 text-sm text-gray-900">{booking.cancellation_reason}</dd>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                  <div className="flex justify-between">
                    <div className="flex space-x-3">
                      {/* Message Button */}
                      <Link
                        to={`/messages?booking=${booking.id}`}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <svg className="-ml-1 mr-2 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                        </svg>
                        Message
                      </Link>
                    </div>

                    <div className="flex space-x-3">
                      {/* Create Estimate Button (for service agents) */}
                      {userType === 'service_agent' && booking.status === 'confirmed' && (
                        <Link
                          to={`/estimates/create/${booking.id}`}
                          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Create Estimate for Additional Work
                        </Link>
                      )}

                      {/* Cancel Button */}
                      {canCancelBooking() && (
                        <button
                          type="button"
                          onClick={() => setShowCancelModal(true)}
                          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          Cancel Booking
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Cancel Booking Modal */}
      {showCancelModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div>
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                  <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="mt-3 text-center sm:mt-5">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Cancel Booking
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Are you sure you want to cancel this booking? This action cannot be undone.
                    </p>

                    <div className="mt-4">
                      <label htmlFor="cancel-reason" className="block text-sm font-medium text-gray-700 text-left">
                        Reason for cancellation
                      </label>
                      <textarea
                        id="cancel-reason"
                        name="cancel-reason"
                        rows={3}
                        value={cancelReason}
                        onChange={(e) => setCancelReason(e.target.value)}
                        className="mt-1 shadow-sm focus:ring-red-500 focus:border-red-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        placeholder="Please provide a reason for cancellation"
                      />
                    </div>

                    {cancelError && (
                      <div className="mt-2 text-sm text-red-600">
                        {cancelError}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                <button
                  type="button"
                  onClick={handleCancelBooking}
                  disabled={cancelLoading}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:col-start-2 sm:text-sm"
                >
                  {cancelLoading ? 'Cancelling...' : 'Confirm Cancellation'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCancelModal(false);
                    setCancelReason('');
                    setCancelError(null);
                  }}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default BookingDetailsPage;
