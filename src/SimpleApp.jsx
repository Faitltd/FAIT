import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import VerySimpleWarrantyClaimsPage from './pages/warranty/VerySimpleWarrantyClaimsPage';

// Simple Home component
const Home = () => (
  <div className="min-h-screen bg-gray-100 p-8">
    <h1 className="text-3xl font-bold text-gray-900 mb-4">FAIT Co-op Home</h1>
    <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-2">Welcome to FAIT Co-op</h2>
      <p className="text-gray-600 mb-4">
        This is a simplified version of the FAIT Co-op platform.
      </p>
      <Link 
        to="/warranty/claims" 
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
      >
        View Warranty Claims
      </Link>
    </div>
  </div>
);

// Simple NotFound component
const NotFound = () => (
  <div className="min-h-screen bg-gray-100 p-8">
    <h1 className="text-3xl font-bold text-gray-900 mb-4">404 - Page Not Found</h1>
    <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
      <p className="text-gray-600 mb-4">
        The page you are looking for does not exist.
      </p>
      <Link 
        to="/" 
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
      >
        Go Home
      </Link>
    </div>
  </div>
);

function SimpleApp() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <nav className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                <div className="flex-shrink-0 flex items-center">
                  <Link to="/">
                    <span className="text-xl font-bold text-blue-600">FAIT Co-op</span>
                  </Link>
                </div>
                <div className="ml-6 flex space-x-8">
                  <Link
                    to="/"
                    className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                  >
                    Home
                  </Link>
                  <Link
                    to="/warranty/claims"
                    className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                  >
                    Warranty Claims
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </nav>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/warranty/claims" element={<VerySimpleWarrantyClaimsPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </Router>
  );
}

export default SimpleApp;
