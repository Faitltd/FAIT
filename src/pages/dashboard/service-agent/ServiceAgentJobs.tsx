import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../contexts/AuthContext';
import { Calendar, Clock, MapPin, DollarSign, User, CheckCircle, XCircle, AlertCircle, ArrowLeft, Filter, MessageSquare, Shield } from 'lucide-react';

type Booking = {
  id: string;
  client_id: string;
  service_package_id: string;
  scheduled_date: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  created_at: string;
  client: {
    full_name: string;
    email: string;
    phone?: string;
  };
  service_package: {
    title: string;
    price: number;
    duration: number;
    duration_unit: string;
  };
};

const ServiceAgentJobs = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'completed' | 'cancelled'>('upcoming');

  useEffect(() => {
    if (user) {
      fetchBookings();
    }
  }, [user, activeTab]);

  const fetchBookings = async () => {
    try {
      setLoading(true);

      let statusFilter: string[];

      switch (activeTab) {
        case 'upcoming':
          statusFilter = ['pending', 'confirmed'];
          break;
        case 'completed':
          statusFilter = ['completed'];
          break;
        case 'cancelled':
          statusFilter = ['cancelled'];
          break;
        default:
          statusFilter = ['pending', 'confirmed'];
      }

      const { data, error } = await supabase
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
          client:profiles(id, full_name, email, phone),
          service_package:service_packages(id, title, price, duration, duration_unit, service_agent_id)
        `)
        .in('status', statusFilter)
        .eq('service_package.service_agent_id', user?.id)
        .order('scheduled_date', { ascending: activeTab === 'upcoming' });

      if (error) throw error;

      setBookings(data || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (bookingId: string, status: 'confirmed' | 'completed' | 'cancelled') => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status })
        .eq('id', bookingId);

      if (error) throw error;

      // Refresh bookings after update
      fetchBookings();
    } catch (error) {
      console.error('Error updating booking status:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link to="/dashboard/service-agent" className="inline-flex items-center text-blue-600 hover:text-blue-800">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-2">My Jobs</h1>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`${
              activeTab === 'upcoming'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
          >
            <Calendar className="mr-2 h-4 w-4" />
            Upcoming Jobs
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`${
              activeTab === 'completed'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            Completed Jobs
          </button>
          <button
            onClick={() => setActiveTab('cancelled')}
            className={`${
              activeTab === 'cancelled'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
          >
            <XCircle className="mr-2 h-4 w-4" />
            Cancelled Jobs
          </button>
        </nav>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : bookings.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <div className="flex justify-center mb-4">
            {activeTab === 'upcoming' ? (
              <Calendar className="h-12 w-12 text-gray-300" />
            ) : activeTab === 'completed' ? (
              <CheckCircle className="h-12 w-12 text-gray-300" />
            ) : (
              <XCircle className="h-12 w-12 text-gray-300" />
            )}
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No {activeTab} jobs found</h3>
          <p className="text-gray-500 max-w-md mx-auto">
            {activeTab === 'upcoming'
              ? 'You don\'t have any upcoming jobs scheduled. When clients book your services, they will appear here.'
              : activeTab === 'completed'
              ? 'You haven\'t completed any jobs yet. Once you mark jobs as completed, they will appear here.'
              : 'You don\'t have any cancelled jobs. If you or a client cancels a booking, it will appear here.'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {bookings.map((booking) => (
            <div key={booking.id} className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200 hover:shadow-md transition-shadow">
              <Link to={`/dashboard/service-agent/jobs/${booking.id}/enhanced`} className="block">
              <div className="p-6">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <h3 className="text-lg font-medium text-gray-900">{booking.service_package.title}</h3>
                      <div className={`ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        booking.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                        booking.status === 'completed' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </div>
                    </div>

                    <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="mr-1.5 h-5 w-5 text-gray-400" />
                        {formatDate(booking.scheduled_date)}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="mr-1.5 h-5 w-5 text-gray-400" />
                        {formatTime(booking.scheduled_date)}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <DollarSign className="mr-1.5 h-5 w-5 text-gray-400" />
                        ${booking.service_package.price.toFixed(2)}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="mr-1.5 h-5 w-5 text-gray-400" />
                        {booking.service_package.duration} {booking.service_package.duration_unit}
                      </div>
                    </div>

                    <div className="mt-4 border-t border-gray-200 pt-4">
                      <h4 className="text-sm font-medium text-gray-900">Client Information</h4>
                      <div className="mt-2 flex items-center text-sm text-gray-500">
                        <User className="mr-1.5 h-5 w-5 text-gray-400" />
                        {booking.client.full_name}
                      </div>
                      <div className="mt-1 text-sm text-gray-500">
                        {booking.client.email}
                      </div>
                      {booking.client.phone && (
                        <div className="mt-1 text-sm text-gray-500">
                          {booking.client.phone}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              </Link>

              <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                <div className="flex flex-wrap gap-2">
                  {activeTab === 'upcoming' && booking.status === 'pending' && (
                    <div className="flex flex-col sm:flex-row gap-2 w-full">
                        <div className="flex-1 border border-gray-200 rounded-md p-3 bg-gray-50">
                          <p className="text-sm font-medium text-gray-700 mb-2">Appointment Status:</p>
                          <div className="flex gap-2">
                            <button
                              onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                              className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                              <CheckCircle className="mr-1.5 h-4 w-4" />
                              Confirm
                            </button>
                            <button
                              onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                              className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                              <XCircle className="mr-1.5 h-4 w-4" />
                              Decline
                            </button>
                          </div>
                        </div>
                    </div>
                  )}

                  {activeTab === 'upcoming' && booking.status === 'confirmed' && (
                    <div className="flex-1 border border-gray-200 rounded-md p-3 bg-gray-50">
                      <p className="text-sm font-medium text-gray-700 mb-2">Appointment Status:</p>
                      <button
                        onClick={() => updateBookingStatus(booking.id, 'completed')}
                        className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                      >
                        <CheckCircle className="mr-1.5 h-4 w-4" />
                        Mark as Completed
                      </button>
                    </div>
                  )}

                  <div className="mt-2 sm:mt-0">
                    <Link
                      to={`/dashboard/service-agent/messages?booking=${booking.id}`}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <MessageSquare className="mr-1.5 h-4 w-4" />
                      Messages
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ServiceAgentJobs;
