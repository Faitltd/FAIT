import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { getServiceAgentDashboardStats } from '../../api/dashboardStatsApi';

const ServiceAgentDashboardFixed = () => {
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

      // Get user profile to check if service agent
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('user_type')
        .eq('id', userId)
        .single();

      if (profileError) throw profileError;

      if (profile && profile.user_type !== 'service_agent') {
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
                <div className="bg-white shadow rounded-lg p-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Dashboard Overview</h2>
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="bg-blue-50 overflow-hidden shadow rounded-lg">
                      <div className="px-4 py-5 sm:p-6">
                        <dt className="text-sm font-medium text-gray-500 truncate">Active Services</dt>
                        <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats?.service_stats?.active_services || 0}</dd>
                      </div>
                    </div>
                    <div className="bg-green-50 overflow-hidden shadow rounded-lg">
                      <div className="px-4 py-5 sm:p-6">
                        <dt className="text-sm font-medium text-gray-500 truncate">Total Bookings</dt>
                        <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats?.booking_stats?.total_bookings || 0}</dd>
                      </div>
                    </div>
                    <div className="bg-yellow-50 overflow-hidden shadow rounded-lg">
                      <div className="px-4 py-5 sm:p-6">
                        <dt className="text-sm font-medium text-gray-500 truncate">Pending Bookings</dt>
                        <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats?.booking_stats?.pending_bookings || 0}</dd>
                      </div>
                    </div>
                    <div className="bg-purple-50 overflow-hidden shadow rounded-lg">
                      <div className="px-4 py-5 sm:p-6">
                        <dt className="text-sm font-medium text-gray-500 truncate">Active Warranties</dt>
                        <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats?.warranty_stats?.active_warranties || 0}</dd>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white shadow rounded-lg p-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Service Agent Dashboard</h2>
                  <p className="text-gray-500">Welcome to the service agent dashboard. Here you can manage your services, bookings, and more.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ServiceAgentDashboardFixed;
