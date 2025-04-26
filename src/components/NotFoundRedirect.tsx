import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';

const NotFoundRedirect: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    // Get the current path
    const currentPath = location.pathname;

    // If the user is not logged in, redirect to login
    if (!user) {
      navigate('/login', { replace: true });
      return;
    }

    // Map of old paths to new paths based on user type
    const getPathMap = () => {
      const baseMap: Record<string, string> = {
        '/bookings': '/dashboard/client/bookings',
        '/warranty': '/dashboard/client/warranty',
        '/warranty/claims': '/dashboard/client/warranty',
        '/messages': '/dashboard/client/messages',
      };

      // Add service agent specific paths
      if (user.user_metadata?.user_type === 'service_agent') {
        return {
          ...baseMap,
          '/bookings': '/dashboard/service-agent/bookings',
          '/messages': '/dashboard/service-agent/messages',
          '/contractor': '/dashboard/service-agent',
          '/contractor/jobs': '/dashboard/service-agent/jobs',
          '/contractor/listings': '/dashboard/service-agent/listings',
          '/contractor/messages': '/dashboard/service-agent/messages',
        };
      }

      // Add admin specific paths
      if (user.user_metadata?.user_type === 'admin') {
        return {
          ...baseMap,
          '/bookings': '/dashboard/admin/bookings',
          '/messages': '/dashboard/admin/messages',
          '/warranty': '/dashboard/admin/warranty',
          '/admin': '/dashboard/admin',
        };
      }

      return baseMap;
    };

    const pathMap = getPathMap();

    // Check if we have a mapping for this path
    if (pathMap[currentPath]) {
      toast.success('Redirecting to the correct page...');
      navigate(pathMap[currentPath], { replace: true });
    } else {
      // If no mapping exists, redirect to appropriate dashboard
      const dashboardPath = user.user_metadata?.user_type === 'service_agent'
        ? '/dashboard/service-agent'
        : user.user_metadata?.user_type === 'admin'
        ? '/dashboard/admin'
        : '/dashboard/client';

      toast.error('Page not found. Redirecting to dashboard...');
      navigate(dashboardPath, { replace: true });
    }
  }, [location.pathname, navigate, user]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Redirecting...</h1>
        <p className="text-gray-600">Please wait while we redirect you to the correct page.</p>
      </div>
    </div>
  );
};

export default NotFoundRedirect;
