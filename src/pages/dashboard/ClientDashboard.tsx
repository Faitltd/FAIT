import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import type { Database } from '../../lib/database.types';
import ReviewForm from '../../components/ReviewForm';
import ServiceSearch from '../../components/ServiceSearch';
import MigrateBookingsButton from '../../components/MigrateBookingsButton';
import { Calendar, MessageSquare, FileText, Star, Shield } from 'lucide-react';
import { getSimulatedBookings } from '../../utils/simulatedBookings';

type Profile = Database['public']['Tables']['profiles']['Row'];
type Booking = Database['public']['Tables']['bookings']['Row'] & {
  service_package: Pick<Database['public']['Tables']['service_packages']['Row'], 'title' | 'description' | 'price'> & {
    service_agent: Pick<Database['public']['Tables']['profiles']['Row'], 'full_name' | 'avatar_url'>;
  };
  review?: Database['public']['Tables']['reviews']['Row'];
};

const ClientDashboard = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [upcomingBookings, setUpcomingBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);

  const fetchBookings = async () => {
    try {
      // Get real bookings from the database - simplified approach
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select('*')
        .eq('client_id', user?.id)
        .order('scheduled_date', { ascending: false });

      if (bookingsError) throw bookingsError;

      // Process each booking to get its service package only (no service agent)
      const bookingsData2 = await Promise.all(bookingsData.map(async (booking) => {
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
      const simulatedBookings = user ? getSimulatedBookings(user.id) : [];

      // Combine real and simulated bookings
      const allBookings = [...(bookingsData2 || []), ...simulatedBookings] as Booking[];

      // Sort by scheduled date (newest first)
      allBookings.sort((a, b) => {
        return new Date(b.scheduled_date).getTime() - new Date(a.scheduled_date).getTime();
      });

      const now = new Date();
      const upcoming = allBookings.filter(booking => {
        const bookingDate = new Date(booking.scheduled_date);
        return bookingDate >= now && booking.status !== 'cancelled';
      });

      setBookings(allBookings);
      setUpcomingBookings(upcoming);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!user) return;

        // Fetch profile data
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError) throw profileError;
        setProfile(profileData);

        await fetchBookings();
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleReviewSubmitted = async () => {
    setShowReviewForm(false);
    setSelectedBooking(null);
    await fetchBookings();
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
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Welcome, {profile?.full_name}</h1>
        <p className="text-gray-600">Find and manage your home services</p>
      </div>

      {/* Migration button for simulated bookings */}
      <MigrateBookingsButton />

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
          <div className="flex flex-col space-y-3">
            <Link
              to="/services"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              Book a Service
            </Link>
            <Link
              to="/dashboard/client/messages"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              Messages
            </Link>
            <Link
              to="/dashboard/client/referrals"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
              </svg>
              Refer & Earn
            </Link>
            <Link
              to="/dashboard/client/points"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Points & Rewards
            </Link>
            <Link
              to="/dashboard/client/achievements"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
              Achievements
            </Link>
            <Link
              to="/forum"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
              </svg>
              Community Forum
            </Link>
            <Link
              to="/dashboard/client/warranty"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <Shield className="mr-2 h-4 w-4" />
              File Warranty Claim
            </Link>
          </div>
        </div>

        {/* Upcoming Booking Preview */}
        <div className="bg-white p-6 rounded-lg shadow-sm md:col-span-2">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Upcoming Booking</h3>
          {upcomingBookings.length > 0 ? (
            <div className="border border-gray-200 rounded-md p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium text-gray-900">{upcomingBookings[0].service_package.title}</h4>
                  <p className="text-sm text-gray-500 mt-1">
                    <Calendar className="inline-block h-4 w-4 mr-1" />
                    {new Date(upcomingBookings[0].scheduled_date).toLocaleDateString()} at {new Date(upcomingBookings[0].scheduled_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Service Agent: {upcomingBookings[0].service_package.service_agent?.full_name || 'Not assigned'}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    upcomingBookings[0].status === 'confirmed'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {upcomingBookings[0].status.charAt(0).toUpperCase() + upcomingBookings[0].status.slice(1)}
                </span>
              </div>
              <div className="mt-4 flex space-x-3">
                <Link
                  to={`/dashboard/client/bookings/${upcomingBookings[0].id}`}
                  className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm leading-5 font-medium rounded-md text-gray-700 bg-white hover:text-gray-500"
                >
                  View Details
                </Link>
                <Link
                  to={`/dashboard/client/messages?booking=${upcomingBookings[0].id}`}
                  className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm leading-5 font-medium rounded-md text-gray-700 bg-white hover:text-gray-500"
                >
                  <MessageSquare className="mr-1 h-4 w-4" />
                  Message
                </Link>
              </div>
            </div>
          ) : (
            <div className="text-center py-6 border border-gray-200 rounded-md">
              <p className="text-gray-500">No upcoming bookings</p>
              <Link
                to="/services"
                className="mt-2 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                Book a Service
              </Link>
            </div>
          )}
        </div>
      </div>

      {showReviewForm && selectedBooking ? (
        <ReviewForm
          booking={selectedBooking}
          onSuccess={handleReviewSubmitted}
          onCancel={() => {
            setShowReviewForm(false);
            setSelectedBooking(null);
          }}
        />
      ) : (
        <>
          {/* Service Search Section */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Find Services</h2>
            <ServiceSearch userZipCode={profile?.zip_code} />
          </div>

          {/* Recent Bookings Section */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Recent Bookings</h2>
              <Link
                to="/dashboard/client/bookings"
                className="text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                View All
              </Link>
            </div>
            <div className="divide-y divide-gray-200">
              {bookings.length === 0 ? (
                <p className="py-4 px-6 text-gray-500">No bookings found</p>
              ) : (
                bookings.slice(0, 3).map((booking) => (
                  <div key={booking.id} className="px-6 py-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-lg font-medium text-gray-900">
                          {booking.service_package.title}
                        </h4>
                        <p className="text-sm text-gray-500">
                          <Calendar className="inline-block h-4 w-4 mr-1" />
                          {new Date(booking.scheduled_date).toLocaleDateString()}
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
                    <div className="mt-4 flex space-x-3">
                      <Link
                        to={`/dashboard/client/bookings/${booking.id}`}
                        className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm leading-5 font-medium rounded-md text-gray-700 bg-white hover:text-gray-500"
                      >
                        View Details
                      </Link>
                      {booking.status === 'completed' && !booking.review && (
                        <button
                          onClick={() => {
                            setSelectedBooking(booking);
                            setShowReviewForm(true);
                          }}
                          className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm leading-5 font-medium rounded-md text-gray-700 bg-white hover:text-gray-500"
                        >
                          <Star className="mr-1 h-4 w-4" />
                          Leave Review
                        </button>
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
                ))
              }
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ClientDashboard;