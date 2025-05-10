import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import supabase from '../../utils/supabaseClient';;
import Loading from '../../components/Loading';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
// Using singleton Supabase client;

const DashboardRouter = () => {
  const [loading, setLoading] = useState(true);
  const [userType, setUserType] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserType = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          // User is not logged in, redirect to home
          setLoading(false);
          return;
        }

        // Get user type from profiles table
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('user_type')
          .eq('id', user.id)
          .single();

        if (profileError) throw profileError;

        setUserType(profile?.user_type);
      } catch (err) {
        console.error('Error fetching user type:', err);
        setError('Failed to determine user type');
      } finally {
        setLoading(false);
      }
    };

    fetchUserType();
  }, []);

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <h2 className="text-xl font-semibold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700 mb-4">{error}</p>
          <button
            onClick={() => window.location.href = '/'}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  // Redirect based on user type
  if (!userType) {
    // User is not logged in or has no profile
    return <Navigate to="/" replace />;
  }

  switch (userType) {
    case 'client':
      return <Navigate to="/dashboard/client" replace />;
    case 'service_agent':
      return <Navigate to="/dashboard/service-agent" replace />;
    case 'admin':
      return <Navigate to="/dashboard/admin" replace />;
    default:
      return <Navigate to="/" replace />;
  }
};

export default DashboardRouter;
