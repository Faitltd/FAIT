import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Home, LogIn } from 'lucide-react';

/**
 * Confirmation page shown after account deactivation
 */
const AccountDeactivatedPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Account Deactivated
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Your account has been successfully deactivated.
            </p>
          </div>
          
          <div className="mt-8">
            <div className="rounded-md bg-blue-50 p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">
                    What happens next?
                  </h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Your profile is no longer visible to other users</li>
                      <li>Your services have been removed from search results</li>
                      <li>Any active subscriptions have been cancelled</li>
                      <li>
                        {window.location.search.includes('keep_data=true')
                          ? 'Your data will be kept for 30 days in case you want to reactivate your account'
                          : 'Your personal information has been anonymized'}
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {window.location.search.includes('keep_data=true') && (
            <div className="mt-6">
              <p className="text-sm text-gray-600">
                If you change your mind, you can reactivate your account by logging in within the next 30 days.
              </p>
              <div className="mt-4">
                <Link
                  to="/login"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <LogIn className="h-5 w-5 mr-2" />
                  Log In to Reactivate
                </Link>
              </div>
            </div>
          )}
          
          <div className="mt-6">
            <Link
              to="/"
              className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Home className="h-5 w-5 mr-2" />
              Return to Home Page
            </Link>
          </div>
          
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              We value your feedback. If you'd like to share why you left or how we could improve,
              please <a href="mailto:feedback@fait.co-op" className="text-blue-600 hover:text-blue-800">contact us</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountDeactivatedPage;
