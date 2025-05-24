import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const SimpleServiceSearchPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [zipCode, setZipCode] = useState('');

  // Sample service categories
  const categories = [
    { id: 1, name: 'Plumbing', icon: '🔧' },
    { id: 2, name: 'Electrical', icon: '⚡' },
    { id: 3, name: 'Carpentry', icon: '🔨' },
    { id: 4, name: 'Painting', icon: '🖌️' },
    { id: 5, name: 'Landscaping', icon: '🌱' },
    { id: 6, name: 'Cleaning', icon: '🧹' },
    { id: 7, name: 'HVAC', icon: '❄️' },
    { id: 8, name: 'Roofing', icon: '🏠' }
  ];

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Find Service Providers
          </h1>
          <p className="mt-4 text-xl text-gray-500 max-w-3xl mx-auto">
            Connect with trusted professionals for all your home improvement and maintenance needs.
          </p>
        </div>

        {/* Search Form */}
        <div className="max-w-3xl mx-auto mb-16">
          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="p-6">
              <form className="space-y-6">
                <div>
                  <label htmlFor="search" className="block text-sm font-medium text-gray-700">
                    What service do you need?
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="search"
                      id="search"
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      placeholder="e.g., plumbing, electrical, carpentry"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="zipcode" className="block text-sm font-medium text-gray-700">
                    Your ZIP Code
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="zipcode"
                      id="zipcode"
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      placeholder="Enter your ZIP code"
                      value={zipCode}
                      onChange={(e) => setZipCode(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Search Services
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Browse by Category</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {categories.map((category) => (
              <div
                key={category.id}
                className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow duration-200"
              >
                <div className="text-4xl mb-3">{category.icon}</div>
                <h3 className="text-lg font-medium text-gray-900">{category.name}</h3>
                <p className="mt-2">
                  <Link
                    to={`/register`}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Find providers
                  </Link>
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-blue-50 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Ready to get started?</h2>
          <p className="text-lg text-gray-600 mb-6">
            Create an account to book services, save favorites, and more.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/register"
              className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Sign Up Now
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center justify-center px-5 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Log In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleServiceSearchPage;
