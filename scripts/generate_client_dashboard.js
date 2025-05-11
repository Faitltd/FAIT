import fs from 'fs';
import path from 'path';

// Configuration for the client dashboard components
const config = {
  componentsDir: 'src/components/client',
  pagesDir: 'src/pages/dashboard',
  components: [
    {
      name: 'ClientDashboardStats',
      description: 'Displays key statistics for the client dashboard'
    },
    {
      name: 'BookingHistoryCard',
      description: 'Card component showing booking history'
    },
    {
      name: 'UpcomingBookingsCard',
      description: 'Card component showing upcoming bookings'
    },
    {
      name: 'ActiveWarrantiesCard',
      description: 'Card component showing active warranties'
    },
    {
      name: 'ServiceSearchCard',
      description: 'Card component for searching services'
    },
    {
      name: 'RecentMessagesCard',
      description: 'Card component showing recent messages'
    }
  ],
  pages: [
    {
      name: 'ClientDashboard',
      description: 'Main client dashboard page'
    }
  ]
};

// Template for React component
const componentTemplate = (name, description) => `import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// ${description}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const ${name} = (props) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    // Component logic will go here
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-24">
        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
        {error}
      </div>
    );
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          ${name}
        </h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          ${description}
        </p>
      </div>
      <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
        {/* Component content will go here */}
        <p>Content for ${name}</p>
      </div>
    </div>
  );
};

export default ${name};`;

// Template for page component
const pageTemplate = (name, description) => `import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import MainLayout from '../../components/MainLayout';
import ClientDashboardStats from '../../components/client/ClientDashboardStats';
import BookingHistoryCard from '../../components/client/BookingHistoryCard';
import UpcomingBookingsCard from '../../components/client/UpcomingBookingsCard';
import ActiveWarrantiesCard from '../../components/client/ActiveWarrantiesCard';
import ServiceSearchCard from '../../components/client/ServiceSearchCard';
import RecentMessagesCard from '../../components/client/RecentMessagesCard';
import { getClientDashboardStats } from '../../api/dashboardStatsApi';

// ${description}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const ${name} = () => {
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
      
      // Get user profile to check if client
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('user_type')
        .eq('id', userId)
        .single();
      
      if (profileError) throw profileError;
      
      if (profile.user_type !== 'client') {
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
    <MainLayout currentPage="dashboard">
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
    </MainLayout>
  );
};

export default ${name};`;

// Create directories if they don't exist
const createDirIfNotExists = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
};

// Generate component files
const generateComponents = () => {
  createDirIfNotExists(config.componentsDir);
  
  config.components.forEach(component => {
    const filePath = path.join(config.componentsDir, `${component.name}.jsx`);
    fs.writeFileSync(filePath, componentTemplate(component.name, component.description));
    console.log(`Generated component: ${filePath}`);
  });
};

// Generate page files
const generatePages = () => {
  createDirIfNotExists(config.pagesDir);
  
  config.pages.forEach(page => {
    const filePath = path.join(config.pagesDir, `${page.name}.jsx`);
    fs.writeFileSync(filePath, pageTemplate(page.name, page.description));
    console.log(`Generated page: ${filePath}`);
  });
};

// Main function to generate all files
const generateClientDashboard = () => {
  console.log('Generating Client Dashboard files...');
  generateComponents();
  generatePages();
  console.log('Client Dashboard generation complete!');
};

// Execute the generator
generateClientDashboard();
