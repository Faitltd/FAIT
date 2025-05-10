import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading, signOut } = useAuth();
  const [showFeatures, setShowFeatures] = useState(true);

  // No need for useEffect since we're starting with showFeatures = true

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
              Welcome to FAIT Co-Op
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-500">
              Connecting homeowners with trusted service agents for all your home improvement needs.
            </p>

            <div className="mt-8">
              <Link
                to="/register"
                className="inline-flex items-center px-8 py-4 border border-transparent text-lg font-bold rounded-md shadow-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                data-testid="get-started-button"
                id="get-started-button"
              >
                Get Started
              </Link>
            </div>
            <div className="mt-10 flex justify-center space-x-4">
              {loading ? (
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              ) : user ? (
                <>
                  <Link
                    to="/dashboard"
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Go to Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>

            <div className="mt-6">
              <Link
                to="/calculator/estimate"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
                data-testid="free-instant-estimate-link"
              >
                Free Instant Estimate
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      {showFeatures && (
        <div className="py-12 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                Our Services
              </h2>
              <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
                Everything you need to maintain and improve your home.
              </p>
            </div>

            <div className="mt-10">
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
                {/* Feature 1 */}
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg font-medium text-gray-900">Find Service Agents</h3>
                    <p className="mt-2 text-base text-gray-500">
                      Search for qualified service agents in your area for any home improvement project.
                    </p>
                    <div className="mt-4">
                      <Link
                        to={user ? "/services/search" : "/login"}
                        className="text-blue-600 hover:text-blue-500"
                      >
                        Learn more &rarr;
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Feature 2 */}
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg font-medium text-gray-900">Warranty Protection</h3>
                    <p className="mt-2 text-base text-gray-500">
                      All services come with warranty protection for your peace of mind.
                    </p>
                    <div className="mt-4">
                      <Link
                        to={user ? "/warranty" : "/login"}
                        className="text-blue-600 hover:text-blue-500"
                      >
                        Learn more &rarr;
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Feature 3 */}
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg font-medium text-gray-900">Subscription Plans</h3>
                    <p className="mt-2 text-base text-gray-500">
                      Choose the right subscription plan for your needs and save on services.
                    </p>
                    <div className="mt-4">
                      <Link
                        to={user ? "/subscription/plans" : "/login"}
                        className="text-blue-600 hover:text-blue-500"
                      >
                        Learn more &rarr;
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Feature 4 - Calculators */}
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg font-medium text-gray-900">Free Estimators</h3>
                    <p className="mt-2 text-base text-gray-500">
                      Get instant estimates for remodeling projects and handyman tasks.
                    </p>
                    <div className="mt-4 space-y-2">
                      <div>
                        <Link
                          to="/calculator/remodeling"
                          className="text-blue-600 hover:text-blue-500"
                          data-testid="remodeling-calculator-link"
                        >
                          Remodeling Calculator &rarr;
                        </Link>
                      </div>
                      <div>
                        <Link
                          to="/calculator/handyman"
                          className="text-blue-600 hover:text-blue-500"
                          data-testid="handyman-calculator-link"
                        >
                          Handyman Task Estimator &rarr;
                        </Link>
                      </div>
                      <div className="mt-4">
                        <Link
                          to="/calculator/estimate"
                          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          data-testid="view-all-calculators-link"
                        >
                          View All Calculators
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
