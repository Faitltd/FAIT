import React from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Wrench, Briefcase, Settings } from 'lucide-react';

const SimpleServiceAgentDashboard: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Service Agent Dashboard
        </h1>
        <p className="text-gray-600">Manage your services and service agent profile</p>
      </div>

      {/* Quick Actions */}
      <div className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-4">
        <Link to="/dashboard/service-agent/messages" className="block">
          <div className="bg-white rounded-lg shadow-sm p-6 h-full hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <MessageSquare className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Messages</h3>
                <p className="text-sm text-gray-500">View and respond to client messages</p>
              </div>
            </div>
          </div>
        </Link>
        
        <Link to="/dashboard/service-agent/jobs" className="block">
          <div className="bg-white rounded-lg shadow-sm p-6 h-full hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <Briefcase className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Jobs</h3>
                <p className="text-sm text-gray-500">Manage your upcoming and completed jobs</p>
              </div>
            </div>
          </div>
        </Link>
        
        <Link to="/dashboard/service-agent/listings" className="block">
          <div className="bg-white rounded-lg shadow-sm p-6 h-full hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <Wrench className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Services</h3>
                <p className="text-sm text-gray-500">Manage your service listings</p>
              </div>
            </div>
          </div>
        </Link>
        
        <Link to="/settings/profile" className="block">
          <div className="bg-white rounded-lg shadow-sm p-6 h-full hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <Settings className="h-8 w-8 text-gray-600" />
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Settings</h3>
                <p className="text-sm text-gray-500">Update your profile and preferences</p>
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* Subscription Dashboard Link */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Subscription Management</h2>
        <p className="mb-4">Manage your subscription plan and billing information.</p>
        <Link to="/subscription/dashboard" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
          View Subscription Dashboard
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-4">Need Help?</h2>
        <p className="mb-4">If you need assistance with your service agent account, please contact our support team.</p>
        <Link to="/debug" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700">
          View Debug Page
        </Link>
      </div>
    </div>
  );
};

export default SimpleServiceAgentDashboard;
