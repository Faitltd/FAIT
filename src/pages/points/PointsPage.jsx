import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/UnifiedAuthContext';
import { supabase } from '../../lib/supabase';

const PointsPage = () => {
  const { user, userType } = useAuth();
  const [loading, setLoading] = useState(true);
  const [points, setPoints] = useState(0);
  const [pointsHistory, setPointsHistory] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      fetchPointsData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchPointsData = async () => {
    try {
      setLoading(true);
      
      // In a real implementation, this would fetch from the database
      // For now, we'll use mock data
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data
      const mockPoints = Math.floor(Math.random() * 1000) + 500;
      const mockHistory = [
        { id: 1, date: new Date(Date.now() - 86400000 * 2).toISOString(), amount: 50, type: 'earned', description: 'Completed project feedback' },
        { id: 2, date: new Date(Date.now() - 86400000 * 5).toISOString(), amount: 100, type: 'earned', description: 'Referral bonus' },
        { id: 3, date: new Date(Date.now() - 86400000 * 10).toISOString(), amount: 25, type: 'earned', description: 'Booking confirmation' },
        { id: 4, date: new Date(Date.now() - 86400000 * 15).toISOString(), amount: -75, type: 'redeemed', description: 'Discount coupon' },
        { id: 5, date: new Date(Date.now() - 86400000 * 20).toISOString(), amount: 200, type: 'earned', description: 'New member bonus' },
      ];
      
      setPoints(mockPoints);
      setPointsHistory(mockHistory);
      setError(null);
    } catch (err) {
      console.error('Error fetching points data:', err);
      setError('Failed to load points information');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">Please sign in to access your points</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            My Points
          </h2>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Redeem Points
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="mt-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      ) : (
        <div className="mt-8">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Points Balance
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Earn points by completing projects, referring friends, and more.
              </p>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
              <dl className="sm:divide-y sm:divide-gray-200">
                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">
                    Available Points
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    <span className="text-2xl font-bold text-blue-600">{points}</span>
                  </dd>
                </div>
                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">
                    Member Level
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {points >= 1000 ? (
                      <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                        Platinum
                      </span>
                    ) : points >= 500 ? (
                      <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-gold-100 text-gold-800">
                        Gold
                      </span>
                    ) : points >= 200 ? (
                      <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-silver-100 text-silver-800">
                        Silver
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                        Bronze
                      </span>
                    )}
                  </dd>
                </div>
                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">
                    Points to Next Level
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {points >= 1000 ? (
                      <span>You've reached the highest level!</span>
                    ) : points >= 500 ? (
                      <span>{1000 - points} points to Platinum</span>
                    ) : points >= 200 ? (
                      <span>{500 - points} points to Gold</span>
                    ) : (
                      <span>{200 - points} points to Silver</span>
                    )}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Points History
            </h3>
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {pointsHistory.length === 0 ? (
                  <li className="px-4 py-4 sm:px-6">
                    <p className="text-sm text-gray-500">No points history found</p>
                  </li>
                ) : (
                  pointsHistory.map((item) => (
                    <li key={item.id} className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${
                            item.type === 'earned' ? 'bg-green-100' : 'bg-red-100'
                          }`}>
                            {item.type === 'earned' ? (
                              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                              </svg>
                            ) : (
                              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                              </svg>
                            )}
                          </div>
                          <div className="ml-4">
                            <p className="text-sm font-medium text-gray-900">
                              {item.description}
                            </p>
                            <p className="text-sm text-gray-500">
                              {new Date(item.date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className={`text-sm font-medium ${
                          item.type === 'earned' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {item.type === 'earned' ? '+' : ''}{item.amount} points
                        </div>
                      </div>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PointsPage;
