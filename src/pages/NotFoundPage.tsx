import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../modules/core/components/ui/Button';
import { Navigation } from '../modules/core/components/layout/Navigation';

/**
 * NotFoundPage component for 404 errors
 */
const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="max-w-max mx-auto">
          <main className="sm:flex">
            <p className="text-4xl font-extrabold text-blue-600 sm:text-5xl">404</p>
            <div className="sm:ml-6">
              <div className="sm:border-l sm:border-gray-200 sm:pl-6">
                <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl">
                  Page not found
                </h1>
                <p className="mt-1 text-base text-gray-500">
                  Please check the URL in the address bar and try again.
                </p>
              </div>
              <div className="mt-10 flex space-x-3 sm:border-l sm:border-transparent sm:pl-6">
                <Link to="/">
                  <Button>Go back home</Button>
                </Link>
                <Link to="/contact">
                  <Button variant="outline">Contact support</Button>
                </Link>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
