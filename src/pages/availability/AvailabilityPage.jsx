import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import MainLayout from '../../components/MainLayout';
import AvailabilityCalendar from '../../components/availability/AvailabilityCalendar';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const AvailabilityPage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
        
        if (!user) {
          setError('You must be logged in to access this page');
        } else {
          // Check if user is a service agent
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('user_type')
            .eq('id', user.id)
            .single();
          
          if (profileError) throw profileError;
          
          if (profile.user_type !== 'service_agent') {
            setError('Only service agents can access this page');
          }
        }
      } catch (err) {
        console.error('Error fetching user:', err);
        setError('An error occurred while loading your profile');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUser();
  }, []);

  return (
    <MainLayout currentPage="availability">
      <div className="py-10">
        <header>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-gray-900">Manage Your Availability</h1>
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
                  <p className="text-gray-500">
                    Set your regular working hours and mark specific dates as unavailable. This helps clients know when they can book your services.
                  </p>
                  
                  <AvailabilityCalendar />
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </MainLayout>
  );
};

export default AvailabilityPage;
