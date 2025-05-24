import React from 'react';
import { Link } from 'react-router-dom';

const EnhancedHome: React.FC = () => {
  return (
    <>
    <div className="bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <div className="pt-20 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
            <span className="block">Welcome to</span>
            <span className="block text-blue-600">FAIT Co-Op Platform</span>
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-500">
            Connecting homeowners with trusted service agents for all your home improvement needs.
          </p>
          <div className="mt-10 flex flex-col items-center">
            {/* Free Instant Estimate Button - Prominent */}
            <a
              href="/calculator/estimate"
              className="w-full sm:w-auto px-10 py-4 border border-transparent text-lg font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center mb-6"
            >
              <svg className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              Free Instant Estimate
            </a>

            {/* Other buttons */}
            <div className="flex justify-center gap-4">
              <Link
                to="/register"
                className="px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10 transition-colors"
                id="get-started-button-enhanced"
                data-testid="get-started-button"
              >
                Get Started
              </Link>
              <Link
                to="/services/search"
                className="px-8 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10 transition-colors"
                id="find-services-button"
                data-testid="find-services-button"
              >
                Find Services
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">
              How It Works
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
              Our platform makes it easy to find, book, and manage home services.
            </p>
          </div>

          <div className="mt-16">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              <div className="bg-blue-50 rounded-lg p-8 text-center">
                <div className="flex justify-center">
                  <div className="h-12 w-12 bg-blue-600 rounded-md flex items-center justify-center">
                    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
                <h3 className="mt-6 text-xl font-medium text-gray-900">Find Services</h3>
                <p className="mt-2 text-base text-gray-500">
                  Browse through our extensive list of verified service agents and find the perfect match for your project.
                </p>
              </div>

              <div className="bg-blue-50 rounded-lg p-8 text-center">
                <div className="flex justify-center">
                  <div className="h-12 w-12 bg-blue-600 rounded-md flex items-center justify-center">
                    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
                <h3 className="mt-6 text-xl font-medium text-gray-900">Book Appointments</h3>
                <p className="mt-2 text-base text-gray-500">
                  Schedule services at your convenience with our easy-to-use booking system.
                </p>
              </div>

              <div className="bg-blue-50 rounded-lg p-8 text-center">
                <div className="flex justify-center">
                  <div className="h-12 w-12 bg-blue-600 rounded-md flex items-center justify-center">
                    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                </div>
                <h3 className="mt-6 text-xl font-medium text-gray-900">Warranty Protection</h3>
                <p className="mt-2 text-base text-gray-500">
                  Enjoy peace of mind with our comprehensive warranty coverage on all services.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Demo Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">
              Try Our Demo
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
              Explore our platform with these demo options:
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
            <a href="/test-login" className="block">
              <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <h3 className="text-xl font-medium text-gray-900 mb-2">Test Login</h3>
                <p className="text-gray-500 mb-4">
                  Try our login system and explore different user roles.
                </p>
                <div className="flex justify-end">
                  <span className="inline-flex items-center text-blue-600 hover:text-blue-700">
                    Try it now
                    <svg className="ml-1 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>
              </div>
            </a>

            <a href="/dashboard/client" className="block">
              <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <h3 className="text-xl font-medium text-gray-900 mb-2">Client Dashboard</h3>
                <p className="text-gray-500 mb-4">
                  See how clients manage their bookings and services.
                </p>
                <div className="flex justify-end">
                  <span className="inline-flex items-center text-blue-600 hover:text-blue-700">
                    Try it now
                    <svg className="ml-1 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>
              </div>
            </a>

            <a href="/dashboard/service-agent" className="block">
              <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <h3 className="text-xl font-medium text-gray-900 mb-2">Service Agent Dashboard</h3>
                <p className="text-gray-500 mb-4">
                  Explore how service agents manage their services and bookings.
                </p>
                <div className="flex justify-end">
                  <span className="inline-flex items-center text-blue-600 hover:text-blue-700">
                    Try it now
                    <svg className="ml-1 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>
              </div>
            </a>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="border-t border-gray-200 pt-8 md:flex md:items-center md:justify-between">
            <div className="flex space-x-6 md:order-2">
              <a href="/debug" className="text-gray-400 hover:text-gray-500">
                Debug Page
              </a>
              <a href="/subscription/dashboard" className="text-gray-400 hover:text-gray-500">
                Subscription Dashboard
              </a>
            </div>
            <p className="mt-8 text-base text-gray-400 md:mt-0 md:order-1">
              &copy; 2024 FAIT Co-Op. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
    </>
  );
};

export default EnhancedHome;
