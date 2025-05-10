import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import ResponsiveLayout from '../../components/layout/ResponsiveLayout';
import LoadingSpinner from '../../components/LoadingSpinner';
import PaymentForm from '../../components/payments/PaymentForm';
import PaymentHistory from '../../components/payments/PaymentHistory';
import { paymentService } from '../../services/PaymentService';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import {
  Calendar,
  Clock,
  MapPin,
  DollarSign,
  CheckCircle,
  XCircle,
  AlertTriangle,
  MessageSquare,
  FileText,
  CreditCard,
  RefreshCw
} from 'lucide-react';

const EnhancedBookingDetailsPage: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userType, setUserType] = useState<string | null>(null);

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [showPaymentHistory, setShowPaymentHistory] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null);
  const [refundLoading, setRefundLoading] = useState(false);
  const [refundError, setRefundError] = useState<string | null>(null);

  const [notes, setNotes] = useState('');
  const [editingNotes, setEditingNotes] = useState(false);
  const [notesLoading, setNotesLoading] = useState(false);
  const [notesError, setNotesError] = useState<string | null>(null);

  // Fetch booking data
  useEffect(() => {
    if (!bookingId || !user) return;

    const fetchBooking = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get user type
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('user_type')
          .eq('id', user.id)
          .single();

        if (profileError) throw profileError;

        setUserType(profileData?.user_type);

        // Get booking details
        const { data: bookingData, error: bookingError } = await supabase
          .from('bookings')
          .select(`
            *,
            client:profiles!bookings_client_id_fkey(id, full_name, email, avatar_url),
            service_agent:profiles!bookings_service_agent_id_fkey(id, full_name, email, avatar_url),
            service:service_packages(id, title, description, price)
          `)
          .eq('id', bookingId)
          .single();

        if (bookingError) throw bookingError;

        // Check if user has permission to view this booking
        if (profileData?.user_type === 'client' && bookingData.client_id !== user.id) {
          throw new Error('You do not have permission to view this booking');
        } else if (profileData?.user_type === 'service_agent' && bookingData.service_agent_id !== user.id) {
          throw new Error('You do not have permission to view this booking');
        }

        setBooking(bookingData);
        setNotes(bookingData.notes || '');
      } catch (err) {
        console.error('Error fetching booking:', err);
        setError(err instanceof Error ? err.message : 'Failed to load booking details');
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId, user]);

  // Helper functions and handlers

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </span>
        );
      case 'confirmed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Confirmed
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Completed
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="h-3 w-3 mr-1" />
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Paid
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </span>
        );
      case 'refunded':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <RefreshCw className="h-3 w-3 mr-1" />
            Refunded
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="h-3 w-3 mr-1" />
            Failed
          </span>
        );
      case 'unpaid':
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Unpaid
          </span>
        );
    }
  };

  const canCancelBooking = () => {
    if (!booking || !userType) return false;

    // Only pending or confirmed bookings can be cancelled
    if (booking.status !== 'pending' && booking.status !== 'confirmed') {
      return false;
    }

    // Clients can cancel their own bookings
    if (userType === 'client' && booking.client_id === user?.id) {
      return true;
    }

    // Service agents can cancel bookings assigned to them
    if (userType === 'service_agent' && booking.service_agent_id === user?.id) {
      return true;
    }

    // Admins can cancel any booking
    if (userType === 'admin') {
      return true;
    }

    return false;
  };

  const handleCancelBooking = async () => {
    if (!booking || !cancelReason.trim()) {
      setCancelError('Please provide a reason for cancellation');
      return;
    }

    setCancelLoading(true);
    setCancelError(null);

    try {
      const { error } = await supabase
        .from('bookings')
        .update({
          status: 'cancelled',
          notes: `${booking.notes ? booking.notes + '\n\n' : ''}Cancellation reason: ${cancelReason}`,
          updated_at: new Date().toISOString()
        })
        .eq('id', booking.id);

      if (error) throw error;

      // Refresh booking data
      const { data: updatedBooking, error: fetchError } = await supabase
        .from('bookings')
        .select(`
          *,
          client:profiles!bookings_client_id_fkey(id, full_name, email, avatar_url),
          service_agent:profiles!bookings_service_agent_id_fkey(id, full_name, email, avatar_url),
          service:service_packages(id, title, description, price)
        `)
        .eq('id', booking.id)
        .single();

      if (fetchError) throw fetchError;

      setBooking(updatedBooking);
      setShowCancelModal(false);
      setCancelReason('');
    } catch (err) {
      console.error('Error cancelling booking:', err);
      setCancelError(err instanceof Error ? err.message : 'Failed to cancel booking');
    } finally {
      setCancelLoading(false);
    }
  };

  const handleSaveNotes = async () => {
    if (!booking) return;

    setNotesLoading(true);
    setNotesError(null);

    try {
      const { error } = await supabase
        .from('bookings')
        .update({
          notes,
          updated_at: new Date().toISOString()
        })
        .eq('id', booking.id);

      if (error) throw error;

      // Update local booking data
      setBooking({
        ...booking,
        notes
      });

      setEditingNotes(false);
    } catch (err) {
      console.error('Error saving notes:', err);
      setNotesError(err instanceof Error ? err.message : 'Failed to save notes');
    } finally {
      setNotesLoading(false);
    }
  };

  const handlePaymentSuccess = async () => {
    try {
      // Refresh booking data to get updated payment status
      const { data: updatedBooking, error: fetchError } = await supabase
        .from('bookings')
        .select(`
          *,
          client:profiles!bookings_client_id_fkey(id, full_name, email, avatar_url),
          service_agent:profiles!bookings_service_agent_id_fkey(id, full_name, email, avatar_url),
          service:service_packages(id, title, description, price)
        `)
        .eq('id', booking.id)
        .single();

      if (fetchError) throw fetchError;

      setBooking(updatedBooking);
      setShowPaymentForm(false);
    } catch (err) {
      console.error('Error refreshing booking data:', err);
    }
  };

  const handleRefundRequest = (paymentId: string) => {
    setSelectedPaymentId(paymentId);
    setShowRefundModal(true);
  };

  const handleRefund = async () => {
    if (!selectedPaymentId) return;

    setRefundLoading(true);
    setRefundError(null);

    try {
      // In development mode, simulate refund
      if (process.env.NODE_ENV === 'development') {
        await paymentService.simulateRefund(selectedPaymentId);
      } else {
        await paymentService.requestRefund(selectedPaymentId);
      }

      // Refresh booking data
      const { data: updatedBooking, error: fetchError } = await supabase
        .from('bookings')
        .select(`
          *,
          client:profiles!bookings_client_id_fkey(id, full_name, email, avatar_url),
          service_agent:profiles!bookings_service_agent_id_fkey(id, full_name, email, avatar_url),
          service:service_packages(id, title, description, price)
        `)
        .eq('id', booking.id)
        .single();

      if (fetchError) throw fetchError;

      setBooking(updatedBooking);
      setShowRefundModal(false);
      setSelectedPaymentId(null);
    } catch (err) {
      console.error('Error processing refund:', err);
      setRefundError(err instanceof Error ? err.message : 'Failed to process refund');
    } finally {
      setRefundLoading(false);
    }
  };

  return (
    <ResponsiveLayout title="Booking Details">
      {loading ? (
        <div className="py-8 flex justify-center">
          <LoadingSpinner />
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error loading booking</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => navigate('/bookings')}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Go to Bookings
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : booking ? (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {/* Booking Header */}
          <div className="border-b border-gray-200 px-6 py-4">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{booking.service.title}</h2>
                <p className="text-sm text-gray-500">Booking #{booking.id.substring(0, 8)}</p>
              </div>
              <div className="mt-2 md:mt-0">
                {getStatusBadge(booking.status)}
              </div>
            </div>
          </div>

          {/* Booking Content */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Left column - Booking details */}
              <div className="md:col-span-2 space-y-6">
                <div>
                  <h3 className="text-base font-medium text-gray-900 mb-2">Service Details</h3>
                  <div className="bg-gray-50 rounded-md p-4 text-gray-700">
                    <p>{booking.service.description}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-md p-4">
                    <div className="flex items-center mb-2">
                      <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                      <h4 className="text-sm font-medium text-gray-900">Date & Time</h4>
                    </div>
                    <p className="text-sm text-gray-700">
                      {booking.scheduled_date ? formatDateTime(booking.scheduled_date) : 'Not scheduled yet'}
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-md p-4">
                    <div className="flex items-center mb-2">
                      <MapPin className="h-5 w-5 text-gray-400 mr-2" />
                      <h4 className="text-sm font-medium text-gray-900">Location</h4>
                    </div>
                    <p className="text-sm text-gray-700">
                      {booking.address || 'No address provided'}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-medium text-gray-900 mb-2">Notes</h3>
                  {editingNotes ? (
                    <div>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        rows={4}
                      />
                      {notesError && (
                        <p className="mt-2 text-sm text-red-600">{notesError}</p>
                      )}
                      <div className="mt-2 flex justify-end space-x-2">
                        <button
                          type="button"
                          onClick={() => {
                            setNotes(booking.notes || '');
                            setEditingNotes(false);
                          }}
                          className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleSaveNotes}
                          disabled={notesLoading}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                        >
                          {notesLoading ? (
                            <>
                              <LoadingSpinner size="small" />
                              <span className="ml-1">Saving...</span>
                            </>
                          ) : (
                            'Save Notes'
                          )}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-md p-4 text-gray-700">
                      {notes ? (
                        <p className="whitespace-pre-line">{notes}</p>
                      ) : (
                        <p className="text-gray-500 italic">No notes added yet.</p>
                      )}
                      <div className="mt-2 flex justify-end">
                        <button
                          type="button"
                          onClick={() => setEditingNotes(true)}
                          className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          {notes ? 'Edit Notes' : 'Add Notes'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Payment Section */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-base font-medium text-gray-900">Payment</h3>
                    <div>
                      {!showPaymentHistory && (
                        <button
                          type="button"
                          onClick={() => setShowPaymentHistory(true)}
                          className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          View Payment History
                        </button>
                      )}
                      {showPaymentHistory && (
                        <button
                          type="button"
                          onClick={() => setShowPaymentHistory(false)}
                          className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          Hide Payment History
                        </button>
                      )}
                    </div>
                  </div>

                  {showPaymentForm ? (
                    <PaymentForm
                      bookingId={booking.id}
                      amount={booking.price}
                      onSuccess={handlePaymentSuccess}
                      onCancel={() => setShowPaymentForm(false)}
                    />
                  ) : showPaymentHistory ? (
                    <PaymentHistory
                      bookingId={booking.id}
                      onRefund={handleRefundRequest}
                    />
                  ) : (
                    <div className="bg-gray-50 rounded-md p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm text-gray-500">Amount</p>
                          <p className="text-xl font-semibold text-gray-900">{formatCurrency(booking.price)}</p>
                        </div>
                        <div>
                          {getPaymentStatusBadge(booking.payment_status)}
                        </div>
                      </div>

                      {booking.payment_status === 'unpaid' && userType === 'client' && (
                        <div className="mt-4">
                          <button
                            type="button"
                            onClick={() => setShowPaymentForm(true)}
                            className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            <CreditCard className="h-4 w-4 mr-2" />
                            Pay Now
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Right column - Sidebar info */}
              <div className="space-y-6">
                {/* Client Info */}
                <div className="bg-gray-50 rounded-md p-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Client</h3>
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <img
                        src={booking.client.avatar_url || '/default-avatar.png'}
                        alt={booking.client.full_name}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">{booking.client.full_name}</p>
                      <p className="text-xs text-gray-500">{booking.client.email}</p>
                    </div>
                  </div>
                </div>

                {/* Service Agent Info */}
                <div className="bg-gray-50 rounded-md p-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Service Agent</h3>
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <img
                        src={booking.service_agent.avatar_url || '/default-avatar.png'}
                        alt={booking.service_agent.full_name}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">{booking.service_agent.full_name}</p>
                      <p className="text-xs text-gray-500">{booking.service_agent.email}</p>
                    </div>
                  </div>
                </div>

                {/* Booking Info */}
                <div className="bg-gray-50 rounded-md p-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Booking Information</h3>
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Status:</dt>
                      <dd className="text-gray-900 font-medium">
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Created:</dt>
                      <dd className="text-gray-900">
                        {formatDateTime(booking.created_at)}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Price:</dt>
                      <dd className="text-gray-900 font-medium">
                        {formatCurrency(booking.price)}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Payment:</dt>
                      <dd className="text-gray-900">
                        {booking.payment_status.charAt(0).toUpperCase() + booking.payment_status.slice(1)}
                      </dd>
                    </div>
                  </dl>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  {/* Message Button */}
                  <Link
                    to={`/messages?booking=${booking.id}`}
                    className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Message
                  </Link>

                  {/* Create Estimate Button (for service agents) */}
                  {userType === 'service_agent' && booking.status === 'confirmed' && (
                    <Link
                      to={`/estimates/create/${booking.id}`}
                      className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Create Estimate
                    </Link>
                  )}

                  {/* Cancel Button */}
                  {canCancelBooking() && (
                    <button
                      type="button"
                      onClick={() => setShowCancelModal(true)}
                      className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Cancel Booking
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">Booking not found</h3>
              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => navigate('/bookings')}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-yellow-700 bg-yellow-100 hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                >
                  Go to Bookings
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Booking Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div>
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                  <XCircle className="h-6 w-6 text-red-600" />
                </div>
                <div className="mt-3 text-center sm:mt-5">
                  <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
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
                        value={cancelReason}
                        onChange={(e) => setCancelReason(e.target.value)}
                        rows={3}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
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
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:col-start-2 sm:text-sm disabled:opacity-50"
                >
                  {cancelLoading ? (
                    <>
                      <LoadingSpinner size="small" />
                      <span className="ml-2">Processing...</span>
                    </>
                  ) : (
                    'Confirm Cancellation'
                  )}
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

      {/* Refund Modal */}
      {showRefundModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div>
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
                  <RefreshCw className="h-6 w-6 text-blue-600" />
                </div>
                <div className="mt-3 text-center sm:mt-5">
                  <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                    Process Refund
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Are you sure you want to refund this payment? This action cannot be undone.
                    </p>

                    {refundError && (
                      <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-3">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <AlertTriangle className="h-5 w-5 text-red-400" />
                          </div>
                          <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800">Error</h3>
                            <div className="mt-2 text-sm text-red-700">
                              <p>{refundError}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                <button
                  type="button"
                  onClick={handleRefund}
                  disabled={refundLoading}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:col-start-2 sm:text-sm disabled:opacity-50"
                >
                  {refundLoading ? (
                    <>
                      <LoadingSpinner size="small" />
                      <span className="ml-2">Processing...</span>
                    </>
                  ) : (
                    'Confirm Refund'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowRefundModal(false);
                    setSelectedPaymentId(null);
                    setRefundError(null);
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
    </ResponsiveLayout>
  );
};

export default EnhancedBookingDetailsPage;
