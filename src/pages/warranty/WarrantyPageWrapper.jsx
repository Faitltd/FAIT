import React, { useState, useEffect } from 'react';
import supabase from '../../utils/supabaseClient';
import { getUserWarranties, getServiceAgentWarranties, getUserWarrantyClaims, getServiceAgentWarrantyClaims } from '../../api/warrantyApi';

// This wrapper component extracts the content from the WarrantyPage component
// without using the MainLayout component to avoid the double header issue
const WarrantyPageWrapper = () => {
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState(null);
  const [warranties, setWarranties] = useState([]);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('warranties');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);

        if (user) {
          // Get user type
          const { data: profile } = await supabase
            .from('profiles')
            .select('user_type')
            .eq('id', user.id)
            .single();

          setUserType(profile?.user_type);

          // Fetch warranties and claims
          fetchWarrantyData(user.id, profile?.user_type);
        } else {
          setError('You must be logged in to access this page');
          setLoading(false);
        }
      } catch (err) {
        console.error('Error fetching user:', err);
        setError('An error occurred while loading your profile');
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const fetchWarrantyData = async (userId, type) => {
    try {
      setLoading(true);

      // Fetch warranties based on user type
      let warrantiesData;
      let claimsData;

      if (type === 'client') {
        warrantiesData = await getUserWarranties(userId);
        claimsData = await getUserWarrantyClaims(userId);
      } else if (type === 'service_agent') {
        warrantiesData = await getServiceAgentWarranties(userId);
        claimsData = await getServiceAgentWarrantyClaims(userId);
      } else {
        // Admin or other user types
        warrantiesData = [];
        claimsData = [];
      }

      setWarranties(warrantiesData);
      setClaims(claimsData);

      setError(null);
    } catch (err) {
      console.error('Error fetching warranty data:', err);
      setError('Failed to load warranty information');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'resolved':
        return 'bg-blue-100 text-blue-800';
      case 'rejected':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="py-10">
      <header>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Warranty Management</h1>
        </div>
      </header>
      <main>
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                {error}
              </div>
            ) : (
              <div>
                {/* Tabs */}
                <div className="border-b border-gray-200">
                  <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <button
                      onClick={() => setActiveTab('warranties')}
                      className={`${
                        activeTab === 'warranties'
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                    >
                      Warranties
                    </button>
                    <button
                      onClick={() => setActiveTab('claims')}
                      className={`${
                        activeTab === 'claims'
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                    >
                      Claims
                    </button>
                  </nav>
                </div>

                {/* Warranties Tab */}
                {activeTab === 'warranties' && (
                  <div className="mt-6">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-lg font-medium text-gray-900">Your Warranties</h2>
                      {userType === 'client' && (
                        <button
                          type="button"
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          File a Claim
                        </button>
                      )}
                    </div>

                    {warranties.length === 0 ? (
                      <div className="text-center py-12 px-4 bg-white shadow rounded-lg">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No warranties found</h3>
                        <p className="mt-1 text-sm text-gray-500">
                          {userType === 'client'
                            ? "You don't have any warranties yet. Warranties are created when you purchase services with warranty coverage."
                            : "You don't have any warranties associated with your services."}
                        </p>
                      </div>
                    ) : (
                      <div className="bg-white shadow overflow-hidden sm:rounded-md">
                        <ul className="divide-y divide-gray-200">
                          {warranties.map((warranty) => (
                            <li key={warranty.id}>
                              <div className="px-4 py-4 sm:px-6">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center">
                                    <p className="text-sm font-medium text-blue-600 truncate">
                                      {warranty.service_name}
                                    </p>
                                    <div className="ml-2 flex-shrink-0 flex">
                                      <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(warranty.status)}`}>
                                        {warranty.status.charAt(0).toUpperCase() + warranty.status.slice(1)}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="ml-2 flex-shrink-0 flex">
                                    <p className="text-sm text-gray-500">
                                      {warranty.warranty_type_name}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* Claims Tab */}
                {activeTab === 'claims' && (
                  <div className="mt-6">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-lg font-medium text-gray-900">Warranty Claims</h2>
                    </div>

                    {claims.length === 0 ? (
                      <div className="text-center py-12 px-4 bg-white shadow rounded-lg">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No claims found</h3>
                        <p className="mt-1 text-sm text-gray-500">
                          {userType === 'client'
                            ? "You haven't filed any warranty claims yet."
                            : "You don't have any warranty claims to review."}
                        </p>
                      </div>
                    ) : (
                      <div className="bg-white shadow overflow-hidden sm:rounded-md">
                        <ul className="divide-y divide-gray-200">
                          {claims.map((claim) => (
                            <li key={claim.id}>
                              <a href={`/warranty/claims/${claim.id}`} className="block hover:bg-gray-50">
                                <div className="px-4 py-4 sm:px-6">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                      <p className="text-sm font-medium text-blue-600 truncate">
                                        Claim #{claim.id.substring(0, 8)}
                                      </p>
                                      <div className="ml-2 flex-shrink-0 flex">
                                        <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(claim.status)}`}>
                                          {claim.status.charAt(0).toUpperCase() + claim.status.slice(1)}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="ml-2 flex-shrink-0 flex">
                                      <p className="text-sm text-gray-500">
                                        {new Date(claim.created_at).toLocaleDateString()}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default WarrantyPageWrapper;
