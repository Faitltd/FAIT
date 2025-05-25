import React, { useState, useEffect } from 'react';
import ClientDashboardStats from '../../components/client/ClientDashboardStats';
import BookingHistoryCard from '../../components/client/BookingHistoryCard';
import UpcomingBookingsCard from '../../components/client/UpcomingBookingsCard';
import ActiveWarrantiesCard from '../../components/client/ActiveWarrantiesCard';
import ServiceSearchCard from '../../components/client/ServiceSearchCard';
import RecentMessagesCard from '../../components/client/RecentMessagesCard';
import { getClientDashboardStats } from '../../api/dashboardStatsApi';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

// Main client dashboard page
const ClientDashboardFixed = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        if (user) {
          await fetchDashboardData(user.id);
        } else {
          console.log('No user found in AuthContext');
          setError('You must be logged in to access this page');
          setLoading(false);
        }
      } catch (err) {
        console.error('Error loading dashboard:', err);
        setError('An error occurred while loading your dashboard');
        setLoading(false);
      }
    };

    loadDashboard();
  }, [user]);

  const fetchDashboardData = async (userId) => {
    try {
      setLoading(true);

      // Get user profile to check if client
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('user_type')
        .eq('id', userId)
        .single();

      if (profileError) throw profileError;

      if (profile && profile.user_type !== 'client') {
        setError('You do not have permission to access the client dashboard');
        setLoading(false);
        return;
      }

      // Fetch dashboard stats
      const statsData = await getClientDashboardStats(userId);
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
            <h1 className="text-3xl font-bold text-gray-900">Client Dashboard</h1>
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
                  <ClientDashboardStats stats={stats} />

                  <ServiceSearchCard />

                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <UpcomingBookingsCard bookings={stats?.booking_stats?.upcoming_bookings} />
                    <RecentMessagesCard />
                  </div>

                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <BookingHistoryCard bookings={stats?.booking_stats?.recent_bookings} />
                    <ActiveWarrantiesCard warranties={stats?.warranty_stats?.active_warranties_list} />
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

export default ClientDashboardFixed;
