import React from 'react';
import { useRouteError, Link, isRouteErrorResponse } from 'react-router-dom';

const ErrorBoundary = () => {
  const error = useRouteError();
  console.error('Route error:', error);

  // Extract error details
  let errorMessage = 'An unexpected error occurred';
  let statusCode = 500;

  if (isRouteErrorResponse(error)) {
    // This is a route error response from React Router
    statusCode = error.status;
    errorMessage = error.statusText || error.data?.message || 'Page not found';
  } else if (error instanceof Error) {
    // This is a JavaScript Error object
    errorMessage = error.message;
  } else if (typeof error === 'string') {
    // This is a string error
    errorMessage = error;
  }

  // Customize message based on status code
  let title = 'Oops! Something went wrong';
  if (statusCode === 404) {
    title = 'Page not found';
  } else if (statusCode === 403) {
    title = 'Access denied';
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {title}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {errorMessage}
          </p>
          {statusCode && (
            <p className="mt-1 text-center text-xs text-gray-500">
              Error code: {statusCode}
            </p>
          )}
        </div>
        <div className="mt-8 space-y-6">
          <div className="flex items-center justify-center space-x-4">
            <Link
              to="/"
              className="group relative flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Go back to home
            </Link>
            <button
              onClick={() => window.history.back()}
              className="group relative flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Go back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorBoundary;
