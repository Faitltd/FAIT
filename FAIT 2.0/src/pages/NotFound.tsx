import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui';
import SEO from '../components/SEO';

const NotFound: React.FC = () => {
  return (
    <>
      <SEO
        title="Page Not Found - FAIT Co-op"
        description="The page you're looking for doesn't exist or has been moved."
      />

      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full text-center">
          <div className="mb-6">
            <svg className="mx-auto h-24 w-24 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>

          <h1 className="text-4xl font-bold text-neutral-900 mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-neutral-700 mb-6">Page Not Found</h2>

          <p className="text-neutral-600 mb-8">
            Please check the URL in the address bar and try again.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              as={Link}
              to="/"
              variant="primary"
            >
              Go back home
            </Button>

            <Button
              as={Link}
              to="/contact"
              variant="outline"
            >
              Contact support
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default NotFound;
