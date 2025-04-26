import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import Navbar from '../../components/Navbar';
import DashboardStats from '../../components/admin/DashboardStats';
import UserStatsCard from '../../components/admin/UserStatsCard';
import BookingStatsCard from '../../components/admin/BookingStatsCard';
import RevenueStatsCard from '../../components/admin/RevenueStatsCard';
import ServiceStatsCard from '../../components/admin/ServiceStatsCard';
import WarrantyStatsCard from '../../components/admin/WarrantyStatsCard';
import RecentActivityList from '../../components/admin/RecentActivityList';
import { getAdminDashboardStats, getRecentActivity } from '../../api/dashboardStatsApi';

// Main admin dashboard page

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        fetchDashboardData(user.id);
      }
    };

    fetchUser();
  }, []);

  const fetchDashboardData = async (userId) => {
    try {
      setLoading(true);

      // Get user profile to check if admin
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('user_type')
        .eq('id', userId)
        .single();

      if (profileError) throw profileError;

      if (profile.user_type !== 'admin') {
        setError('You do not have permission to access the admin dashboard');
        setLoading(false);
        return;
      }

      // Fetch dashboard stats and recent activity
      const [statsData, activityData] = await Promise.all([
        getAdminDashboardStats(),
        getRecentActivity(userId, 'admin')
      ]);

      setStats(statsData);
      setActivity(activityData);
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
      <Navbar />
      <div className="py-10">
        <header>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
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
                  <DashboardStats />

                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {stats && stats.user_stats && (
                      <UserStatsCard stats={stats.user_stats} />
                    )}

                    {stats && stats.booking_stats && (
                      <BookingStatsCard stats={stats.booking_stats} />
                    )}

                    {stats && stats.revenue_stats && (
                      <RevenueStatsCard stats={stats.revenue_stats} />
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    {stats && stats.service_stats && (
                      <ServiceStatsCard stats={stats.service_stats} />
                    )}

                    {stats && stats.warranty_stats && (
                      <WarrantyStatsCard stats={stats.warranty_stats} />
                    )}
                  </div>

                  <RecentActivityList activity={activity} />
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default AdminDashboardPage;