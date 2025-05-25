import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

const UnauthorizedPage: React.FC = () => {
  const { user } = useAuth();

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) return;

      console.log('UnauthorizedPage - Checking admin status for user:', user.id);

      // Check admin status directly from the database
      const { data: adminCheck, error: adminError } = await supabase
        .rpc('is_admin', { user_id: user.id });

      console.log('Direct admin check result:', adminCheck, adminError);

      // Check super admin status directly from the database
      const { data: superAdminCheck, error: superAdminError } = await supabase
        .rpc('is_super_admin', { user_id: user.id });

      console.log('Direct super admin check result:', superAdminCheck, superAdminError);

      // Check admin_users table directly
      const { data: adminUsers, error: adminUsersError } = await supabase
        .from('admin_users')
        .select('*')
        .eq('user_id', user.id);

      console.log('admin_users table check:', adminUsers, adminUsersError);
    };

    checkAdminStatus();
  }, [user]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <h1 className="mt-6 text-3xl font-extrabold text-gray-900">Access Denied</h1>
          <p className="mt-2 text-sm text-gray-600">
            You do not have permission to access this area.
          </p>
          <p className="mt-2 text-xs text-gray-500">
            User ID: {user?.id || 'Not logged in'}
          </p>
        </div>
        <div className="mt-5">
          <Link
            to="/"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Return to Home Page
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;