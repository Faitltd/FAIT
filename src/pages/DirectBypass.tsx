import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const DirectBypass = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Directly set the auth data in localStorage
    localStorage.setItem('direct_bypass_auth', JSON.stringify({
      email: 'service@itsfait.com',
      userType: 'service_agent',
      isDirectBypass: true
    }));

    // Add a small delay before redirecting
    setTimeout(() => {
      navigate('/dashboard/service-agent');
    }, 1000);
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-red-50">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-lg text-center">
        <h1 className="text-2xl font-bold text-red-800 mb-4">Direct Bypass Mode</h1>
        <div className="bg-red-100 border border-red-300 text-red-700 p-4 rounded-md mb-4">
          <p className="font-bold">BYPASSING ALL AUTHENTICATION</p>
          <p>Logging you in as Service Agent directly...</p>
        </div>
        <div className="animate-pulse text-gray-600">
          Redirecting to dashboard...
        </div>
      </div>
    </div>
  );
};

export default DirectBypass;
