import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabase';
import type { Database } from '../../../lib/database.types';
import { Calendar, MessageSquare, Star, Shield, ArrowLeft, Filter } from 'lucide-react';
import { getSimulatedBookings } from '../../../utils/simulatedBookings';

type Booking = Database['public']['Tables']['bookings']['Row'] & {
  service_package: Database['public']['Tables']['service_packages']['Row'] & {
    service_agent: Pick<Database['public']['Tables']['profiles']['Row'], 'full_name' | 'avatar_url'>;
  };
  review?: Database['public']['Tables']['reviews']['Row'];
};

const ClientBookings = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed' | 'cancelled'>('all');

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        if (!user) return;

        // Get real bookings from the database - simplified approach
        const { data, error } = await supabase
          .from('bookings')
          .select('*')
          .eq('client_id', user.id)
          .order('scheduled_date', { ascending: false });

        if (error) throw error;

        // Process each booking to get its service package only (no service agent)
        const processedData = await Promise.all(data.map(async (booking) => {
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
      } catch (error) {
        console.error('Error fetching bookings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [user]);

  const filteredBookings = bookings.filter(booking => {
    if (filter === 'all') return true;
    if (filter === 'upcoming') {
      const bookingDate = new Date(booking.scheduled_date);
      const now = new Date();
      return bookingDate >= now && booking.status !== 'cancelled';
    }
    if (filter === 'completed') return booking.status === 'completed';
    if (filter === 'cancelled') return booking.status === 'cancelled';
    return true;
  });

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
        <h1 className="text-2xl font-bold text-gray-900 mt-2">My Bookings</h1>
      </div>

      {/* Filter Controls */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6 flex items-center">
        <Filter className="h-5 w-5 text-gray-500 mr-2" />
        <span className="text-gray-700 mr-4">Filter:</span>
        <div className="flex space-x-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-md text-sm font-medium ${
              filter === 'all'
                ? 'bg-blue-100 text-blue-800'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('upcoming')}
            className={`px-3 py-1 rounded-md text-sm font-medium ${
              filter === 'upcoming'
                ? 'bg-blue-100 text-blue-800'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-3 py-1 rounded-md text-sm font-medium ${
              filter === 'completed'
                ? 'bg-blue-100 text-blue-800'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Completed
          </button>
          <button
            onClick={() => setFilter('cancelled')}
            className={`px-3 py-1 rounded-md text-sm font-medium ${
              filter === 'cancelled'
                ? 'bg-blue-100 text-blue-800'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Cancelled
          </button>
        </div>
      </div>

      {/* Bookings List */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="divide-y divide-gray-200">
          {filteredBookings.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-gray-500">No bookings found</p>
              <Link
                to="/services"
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                Book a Service
              </Link>
            </div>
          ) : (
            filteredBookings.map((booking) => (
              <div key={booking.id} className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {booking.service_package.title}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      <Calendar className="inline-block h-4 w-4 mr-1" />
                      {new Date(booking.scheduled_date).toLocaleDateString()} at{' '}
                      {new Date(booking.scheduled_date).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Service Agent: {booking.service_package.service_agent?.full_name || 'Not assigned'}
                    </p>
                    <p className="text-sm font-medium text-gray-900 mt-2">
                      ${booking.total_amount}
                    </p>
                  </div>
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
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link
                    to={`/dashboard/client/bookings/${booking.id}`}
                    className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm leading-5 font-medium rounded-md text-gray-700 bg-white hover:text-gray-500"
                  >
                    View Details
                  </Link>
                  <Link
                    to={`/dashboard/client/messages?booking=${booking.id}`}
                    className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm leading-5 font-medium rounded-md text-gray-700 bg-white hover:text-gray-500"
                  >
                    <MessageSquare className="mr-1 h-4 w-4" />
                    Message
                  </Link>
                  {booking.status === 'completed' && !booking.review && (
                    <Link
                      to={`/dashboard/client/bookings/${booking.id}?review=true`}
                      className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm leading-5 font-medium rounded-md text-gray-700 bg-white hover:text-gray-500"
                    >
                      <Star className="mr-1 h-4 w-4" />
                      Leave Review
                    </Link>
                  )}
                  {booking.status === 'completed' && (
                    <Link
                      to={`/dashboard/client/warranty/new?booking=${booking.id}`}
                      className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm leading-5 font-medium rounded-md text-gray-700 bg-white hover:text-gray-500"
                    >
                      <Shield className="mr-1 h-4 w-4" />
                      Warranty
                    </Link>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientBookings;
