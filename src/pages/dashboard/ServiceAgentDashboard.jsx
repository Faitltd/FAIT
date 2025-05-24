import React, { useState, useEffect } from 'react';
import supabase from '../../utils/supabaseClient';;
import ServiceAgentDashboardStats from '../../components/service-agent/ServiceAgentDashboardStats';
import ServiceListCard from '../../components/service-agent/ServiceListCard';
import UpcomingAppointmentsCard from '../../components/service-agent/UpcomingAppointmentsCard';
import BookingRequestsCard from '../../components/service-agent/BookingRequestsCard';
import RecentClientsCard from '../../components/service-agent/RecentClientsCard';
import WarrantyStatusCard from '../../components/service-agent/WarrantyStatusCard';
import { getServiceAgentDashboardStats } from '../../api/dashboardStatsApi';

// Main service agent dashboard page

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
// Using singleton Supabase client;

const ServiceAgentDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);

        if (user) {
          fetchDashboardData(user.id);
        } else {
          setError('You must be logged in to access this page');
          setLoading(false);
        }
      } catch (err) {
        console.error('Error fetching user:', err);
        setError('An error occurred while loading your profile');
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const fetchDashboardData = async (userId) => {
    try {
      setLoading(true);

      // Get user profile to check if service agent
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('user_type')
        .eq('id', userId)
        .single();

      if (profileError) throw profileError;

      if (profile.user_type !== 'service_agent') {
        setError('You do not have permission to access the service agent dashboard');
        setLoading(false);
        return;
      }

      // Fetch dashboard stats
      const statsData = await getServiceAgentDashboardStats(userId);
      setStats(statsData);

      setError(null);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="py-10">
        <header>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-gray-900">Service Agent Dashboard</h1>
          </div>
        </header>
        <main>
          <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div className="px-4 py-6 sm:px-0">
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : error ? (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                  {error}
                </div>
              ) : (
                <div className="space-y-6">
                  <ServiceAgentDashboardStats stats={stats} />

                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <BookingRequestsCard bookings={stats?.booking_stats?.pending_bookings_list} />
                    <UpcomingAppointmentsCard bookings={stats?.booking_stats?.upcoming_bookings} />
                  </div>

                  <ServiceListCard services={stats?.service_stats?.services} />

                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <RecentClientsCard bookings={stats?.booking_stats?.recent_bookings} />
                    <WarrantyStatusCard warranties={stats?.warranty_stats} />
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default ServiceAgentDashboard;