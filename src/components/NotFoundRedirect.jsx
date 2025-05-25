import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// This component redirects from old/incorrect routes to the correct ones
const NotFoundRedirect = () => {
  const navigate = useNavigate();
  const path = window.location.pathname;

  useEffect(() => {
    // Map of old routes to new routes
    const routeMap = {
      '/bookings': '/dashboard/client/bookings',
      '/warranty': '/dashboard/client/warranty',
      '/warranty/claims': '/dashboard/client/warranty/new',
      '/messages': '/dashboard/client/messages',
      '/contractor': '/dashboard/service-agent',
      '/contractor/jobs': '/dashboard/service-agent/jobs',
      '/contractor/listings': '/dashboard/service-agent/listings',
      '/contractor/messages': '/dashboard/service-agent/messages',
    };

    // Check if the current path is in our map
    const newRoute = routeMap[path];
    if (newRoute) {
      console.log(`Redirecting from ${path} to ${newRoute}`);
      navigate(newRoute, { replace: true });
    } else {
      // If not in our map, redirect to home
      console.log(`Route ${path} not found, redirecting to home`);
      navigate('/', { replace: true });
    }
  }, [path, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Redirecting...</h1>
        <p className="text-gray-600">Please wait while we redirect you to the correct page.</p>
      </div>
    </div>
  );
};

export default NotFoundRedirect;
