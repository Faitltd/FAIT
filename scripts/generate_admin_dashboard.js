import fs from 'fs';
import path from 'path';

// Configuration for the admin dashboard components
const config = {
  componentsDir: 'src/components/admin',
  pagesDir: 'src/pages/admin',
  components: [
    {
      name: 'DashboardStats',
      description: 'Displays key statistics for the admin dashboard'
    },
    {
      name: 'UserStatsCard',
      description: 'Card component showing user statistics'
    },
    {
      name: 'BookingStatsCard',
      description: 'Card component showing booking statistics'
    },
    {
      name: 'RevenueStatsCard',
      description: 'Card component showing revenue statistics'
    },
    {
      name: 'ServiceStatsCard',
      description: 'Card component showing service statistics'
    },
    {
      name: 'WarrantyStatsCard',
      description: 'Card component showing warranty statistics'
    },
    {
      name: 'RecentActivityList',
      description: 'List component showing recent activity'
    }
  ],
  pages: [
    {
      name: 'AdminDashboardPage',
      description: 'Main admin dashboard page'
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
import DashboardStats from '../../components/admin/DashboardStats';
import UserStatsCard from '../../components/admin/UserStatsCard';
import BookingStatsCard from '../../components/admin/BookingStatsCard';
import RevenueStatsCard from '../../components/admin/RevenueStatsCard';
import ServiceStatsCard from '../../components/admin/ServiceStatsCard';
import WarrantyStatsCard from '../../components/admin/WarrantyStatsCard';
import RecentActivityList from '../../components/admin/RecentActivityList';

// ${description}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const ${name} = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    // Page logic will go here
    setLoading(false);
  }, []);

  return (
    <MainLayout currentPage="dashboard">
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
                    <UserStatsCard />
                    <BookingStatsCard />
                    <RevenueStatsCard />
                  </div>
                  
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    <ServiceStatsCard />
                    <WarrantyStatsCard />
                  </div>
                  
                  <RecentActivityList />
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
const generateAdminDashboard = () => {
  console.log('Generating Admin Dashboard files...');
  generateComponents();
  generatePages();
  console.log('Admin Dashboard generation complete!');
};

// Execute the generator
generateAdminDashboard();
