import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ServiceSearch from '../../components/ServiceSearch';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

const EnhancedClientDashboard: React.FC = () => {
  const { user } = useAuth();
  const [userZipCode, setUserZipCode] = useState<string>('');
  const [upcomingBookings, setUpcomingBookings] = useState<number>(0);
  const [unreadMessages, setUnreadMessages] = useState<number>(0);
  const [activeWarranties, setActiveWarranties] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Fetch user profile to get zip code
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('zip_code')
          .eq('id', user.id)
          .single();

        if (profileError) throw profileError;
        if (profileData?.zip_code) {
          setUserZipCode(profileData.zip_code);
        }

        // Fetch upcoming bookings count
        const { count: bookingsCount, error: bookingsError } = await supabase
          .from('bookings')
          .select('id', { count: 'exact' })
          .eq('client_id', user.id)
          .in('status', ['pending', 'confirmed']);

        if (bookingsError) throw bookingsError;
        setUpcomingBookings(bookingsCount || 0);

        // Fetch unread messages count
        const { count: messagesCount, error: messagesError } = await supabase
          .from('messages')
          .select('id', { count: 'exact' })
          .eq('recipient_id', user.id)
          .eq('is_read', false);

        if (messagesError) throw messagesError;
        setUnreadMessages(messagesCount || 0);

        // Fetch active warranties count
        const { count: warrantiesCount, error: warrantiesError } = await supabase
          .from('warranties')
          .select('id', { count: 'exact' })
          .eq('client_id', user.id)
          .eq('is_active', true);

        if (warrantiesError) throw warrantiesError;
        setActiveWarranties(warrantiesCount || 0);

      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  return (
    <>
      <div className="bg-gray-50">

      {/* Main Content */}
      <div className="py-10">
        <header>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-gray-900">Client Dashboard</h1>
          </div>
        </header>
        <main>
          <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
            {/* Stats Section */}
            <div className="px-4 py-6 sm:px-0">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {/* Stat Card - Upcoming Bookings */}
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                        <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            Upcoming Bookings
                          </dt>
                          <dd>
                            <div className="text-lg font-medium text-gray-900">
                              {loading ? '...' : upcomingBookings}
                            </div>
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-4 py-4 sm:px-6">
                    <div className="text-sm">
                      <Link to="/dashboard/client/bookings" className="font-medium text-blue-600 hover:text-blue-500">
                        View all bookings
                        <span aria-hidden="true"> &rarr;</span>
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Stat Card - Messages */}
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-purple-500 rounded-md p-3">
                        <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                        </svg>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            Unread Messages
                          </dt>
                          <dd>
                            <div className="text-lg font-medium text-gray-900">
                              {loading ? '...' : unreadMessages}
                            </div>
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-4 py-4 sm:px-6">
                    <div className="text-sm">
                      <Link to="/dashboard/client/messages" className="font-medium text-blue-600 hover:text-blue-500">
                        View messages
                        <span aria-hidden="true"> &rarr;</span>
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Stat Card - Warranties */}
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                        <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            Active Warranties
                          </dt>
                          <dd>
                            <div className="text-lg font-medium text-gray-900">
                              {loading ? '...' : activeWarranties}
                            </div>
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-4 py-4 sm:px-6">
                    <div className="text-sm">
                      <Link to="/dashboard/client/warranty" className="font-medium text-blue-600 hover:text-blue-500">
                        View warranties
                        <span aria-hidden="true"> &rarr;</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Service Search Section */}
            <div className="px-4 py-6 sm:px-0">
              <ServiceSearch userZipCode={userZipCode} />
            </div>

            {/* Quick Actions Section */}
            <div className="px-4 py-6 sm:px-0">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Link to="/services" className="block">
                  <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
                    <div className="px-4 py-5 sm:p-6">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                          <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                        </div>
                        <div className="ml-4">
                          <h3 className="text-lg font-medium text-gray-900">Browse Services</h3>
                          <p className="text-sm text-gray-500">View all service categories</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>

                <Link to="/dashboard/client/bookings" className="block">
                  <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
                    <div className="px-4 py-5 sm:p-6">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                          <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div className="ml-4">
                          <h3 className="text-lg font-medium text-gray-900">My Bookings</h3>
                          <p className="text-sm text-gray-500">View your appointments</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>

                <Link to="/dashboard/client/messages" className="block">
                  <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
                    <div className="px-4 py-5 sm:p-6">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 bg-purple-100 rounded-md p-3">
                          <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                          </svg>
                        </div>
                        <div className="ml-4">
                          <h3 className="text-lg font-medium text-gray-900">Messages</h3>
                          <p className="text-sm text-gray-500">Contact service providers</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>

                <Link to="/dashboard/client/warranty" className="block">
                  <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
                    <div className="px-4 py-5 sm:p-6">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 bg-yellow-100 rounded-md p-3">
                          <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                        </div>
                        <div className="ml-4">
                          <h3 className="text-lg font-medium text-gray-900">Warranties</h3>
                          <p className="text-sm text-gray-500">Manage your warranties</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            </div>

            {/* Additional Links */}
            <div className="px-4 py-6 sm:px-0 flex justify-center space-x-4">
              <Link
                to="/subscription/dashboard"
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Subscription Plans
              </Link>
              <Link
                to="/points"
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Points & Rewards
              </Link>
              <Link
                to="/governance"
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Co-op Governance
              </Link>
              <Link
                to="/settings/profile"
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Profile Settings
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
    </>
  );
};

export default EnhancedClientDashboard;
