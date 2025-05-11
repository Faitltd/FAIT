import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import AccountDeactivation from '../../components/profile/AccountDeactivation';

/**
 * Page for account deactivation
 */
const AccountDeactivationPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">Account Deactivation</h1>
          <p className="mt-4 text-lg text-gray-600">
            We're sorry to see you go. Please review the information below before deactivating your account.
          </p>
        </div>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
          <div className="flex">
            <AlertTriangle className="h-6 w-6 text-yellow-500 mr-4 flex-shrink-0" />
            <div>
              <h2 className="text-lg font-medium text-yellow-800">Before You Deactivate</h2>
              <div className="mt-2 text-yellow-700">
                <p className="mb-4">
                  Deactivating your account is a significant action. Please consider the following alternatives:
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>
                    <strong>Update your notification settings</strong> - You can 
                    <Link to="/settings/profile" className="text-blue-600 hover:text-blue-800 mx-1">
                      adjust your notification preferences
                    </Link>
                    to receive fewer emails or notifications.
                  </li>
                  <li>
                    <strong>Temporarily pause your services</strong> - If you're a service agent, you can 
                    <Link to="/dashboard/service-agent/availability" className="text-blue-600 hover:text-blue-800 mx-1">
                      update your availability
                    </Link>
                    to show that you're not currently accepting new bookings.
                  </li>
                  <li>
                    <strong>Contact support</strong> - If you're experiencing issues with the platform, our 
                    <a href="mailto:support@fait.co-op" className="text-blue-600 hover:text-blue-800 mx-1">
                      support team
                    </a>
                    is here to help.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        
        <AccountDeactivation
          onCancel={() => window.history.back()}
        />
        
        <div className="mt-8 text-center">
          <Link
            to="/settings/profile"
            className="text-blue-600 hover:text-blue-800"
          >
            Return to Profile Settings
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AccountDeactivationPage;
