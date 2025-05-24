import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface DashboardStatsData {
  activeProjects: number;
  completedProjects: number;
  pendingQuotes: number;
  upcomingBookings: number;
}

const DashboardStats: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStatsData>({
    activeProjects: 0,
    completedProjects: 0,
    pendingQuotes: 0,
    upcomingBookings: 0
  });
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;
      
      try {
        // Fetch active projects count
        const { count: activeCount, error: activeError } = await supabase
          .from('projects')
          .select('*', { count: 'exact', head: true })
          .eq('client_id', user.id)
          .eq('status', 'in_progress');
          
        if (activeError) throw activeError;
        
        // Fetch completed projects count
        const { count: completedCount, error: completedError } = await supabase
          .from('projects')
          .select('*', { count: 'exact', head: true })
          .eq('client_id', user.id)
          .eq('status', 'completed');
          
        if (completedError) throw completedError;
        
        // Fetch pending quotes count
        const { count: quotesCount, error: quotesError } = await supabase
          .from('quotes')
          .select('*', { count: 'exact', head: true })
          .eq('client_id', user.id)
          .eq('status', 'pending');
          
        if (quotesError) throw quotesError;
        
        // Fetch upcoming bookings count
        const today = new Date().toISOString();
        const { count: bookingsCount, error: bookingsError } = await supabase
          .from('bookings')
          .select('*', { count: 'exact', head: true })
          .eq('client_id', user.id)
          .gte('booking_date', today)
          .eq('status', 'confirmed');
          
        if (bookingsError) throw bookingsError;
        
        setStats({
          activeProjects: activeCount || 0,
          completedProjects: completedCount || 0,
          pendingQuotes: quotesCount || 0,
          upcomingBookings: bookingsCount || 0
        });
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, [user]);
  
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-lg shadow-md animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          </div>
        ))}
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
        <p className="text-sm font-medium text-gray-500 mb-1">Active Projects</p>
        <p className="text-2xl font-bold text-gray-800">{stats.activeProjects}</p>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
        <p className="text-sm font-medium text-gray-500 mb-1">Completed Projects</p>
        <p className="text-2xl font-bold text-gray-800">{stats.completedProjects}</p>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-yellow-500">
        <p className="text-sm font-medium text-gray-500 mb-1">Pending Quotes</p>
        <p className="text-2xl font-bold text-gray-800">{stats.pendingQuotes}</p>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500">
        <p className="text-sm font-medium text-gray-500 mb-1">Upcoming Bookings</p>
        <p className="text-2xl font-bold text-gray-800">{stats.upcomingBookings}</p>
      </div>
    </div>
  );
};

export default DashboardStats;
