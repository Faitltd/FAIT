import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import ClientDashboard from '../../components/dashboard/ClientDashboard';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [userType, setUserType] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchUserType = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('user_type')
          .eq('user_id', user.id)
          .single();
          
        if (error) throw error;
        
        setUserType(data?.user_type || null);
      } catch (err) {
        console.error('Error fetching user type:', err);
        setError('Failed to load user information');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserType();
  }, [user]);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4">
        <p className="text-red-700">{error}</p>
      </div>
    );
  }
  
  // Render dashboard based on user type
  if (userType === 'client') {
    return <ClientDashboard />;
  } else if (userType === 'service_agent') {
    // For now, we'll just show a placeholder for service agents
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-gray-800">Service Provider Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Welcome to your service provider dashboard. This area is under development.
        </p>
      </div>
    );
  }
  
  // Fallback if user type is not recognized
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-gray-800">Welcome to FAIT Co-op</h1>
      <p className="text-gray-600 mt-2">
        Your account type is not recognized. Please contact support for assistance.
      </p>
    </div>
  );
};

export default DashboardPage;
