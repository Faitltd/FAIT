import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import MainLayout from '../../components/MainLayout';
import { getWarrantyClaim, updateWarrantyClaim } from '../../api/warrantyApi';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const WarrantyClaimPage = () => {
  const { claimId } = useParams();
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState(null);
  const [claim, setClaim] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updateStatus, setUpdateStatus] = useState('');
  const [resolution, setResolution] = useState('');
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState(null);
  const [updateSuccess, setUpdateSuccess] = useState(false);

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
          
          // Fetch claim details
          fetchClaimDetails(user.id, profile?.user_type, claimId);
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
  }, [claimId]);

  const fetchClaimDetails = async (userId, type, claimId) => {
    try {
      setLoading(true);
      
      const claimData = await getWarrantyClaim(claimId);
      
      // Check if user has permission to view this claim
      if (type === 'client' && claimData.client_id !== userId) {
        setError('You do not have permission to view this claim');
      } else if (type === 'service_agent' && claimData.service_agent_id !== userId) {
        setError('You do not have permission to view this claim');
      } else {
        setClaim(claimData);
      }
    } catch (err) {
      console.error('Error fetching claim details:', err);
      setError('Failed to load claim information');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateClaim = async () => {
    try {
      setUpdating(true);
      setUpdateError(null);
      setUpdateSuccess(false);
      
      if (!updateStatus) {
        setUpdateError('Please select a status');
        setUpdating(false);
        return;
      }
      
      const updateData = {
        status: updateStatus,
        resolution_notes: resolution
      };
      
      await updateWarrantyClaim(claim.id, updateData);
      
      // Refresh claim data
      fetchClaimDetails(user.id, userType, claimId);
      
      // Reset form
      setUpdateStatus('');
      setResolution('');
      setUpdateSuccess(true);
    } catch (err) {
      console.error('Error updating claim:', err);
      setUpdateError('Failed to update claim');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <MainLayout currentPage="warranty">
      <div className="py-10">
        <header>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-gray-900">Warranty Claim Details</h1>
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
              ) : claim ? (
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                  <div className="px-4 py-5 sm:px-6 flex justify-between">
                    <div>
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        Claim #{claim.id.substring(0, 8)}
                      </h3>
                      <p className="mt-1 max-w-2xl text-sm text-gray-500">
                        Filed on {new Date(claim.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(claim.status)}`}>
                        {claim.status.charAt(0).toUpperCase() + claim.status.slice(1)}
                      </span>
                    </div>
                  </div>
                  <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
                    <dl className="sm:divide-y sm:divide-gray-200">
                      <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">Service</dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                          {claim.service_name}
                        </dd>
                      </div>
                      <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">
                          {userType === 'client' ? 'Service Agent' : 'Client'}
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                          {userType === 'client' ? claim.service_agent_name : claim.client_name}
                        </dd>
                      </div>
                      <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">Warranty Type</dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                          {claim.warranty_type_name}
                        </dd>
                      </div>
                      <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">Warranty Period</dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                          {new Date(claim.warranty_start_date).toLocaleDateString()} to {new Date(claim.warranty_end_date).toLocaleDateString()}
                        </dd>
                      </div>
                      <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">Issue Description</dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                          {claim.description}
                        </dd>
                      </div>
                      {claim.resolution_notes && (
                        <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                          <dt className="text-sm font-medium text-gray-500">Resolution Notes</dt>
                          <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                            {claim.resolution_notes}
                          </dd>
                        </div>
                      )}
                      {claim.photos && claim.photos.length > 0 && (
                        <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                          <dt className="text-sm font-medium text-gray-500">Photos</dt>
                          <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                              {claim.photos.map((photo, index) => (
                                <a 
                                  key={index} 
                                  href={photo.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="block"
                                >
                                  <img 
                                    src={photo.url} 
                                    alt={`Claim photo ${index + 1}`} 
                                    className="object-cover h-32 w-full rounded-md"
                                  />
                                </a>
                              ))}
                            </div>
                          </dd>
                        </div>
                      )}
                    </dl>
                  </div>
                  
                  {/* Update Claim Form (for service agents only) */}
                  {userType === 'service_agent' && claim.status === 'pending' && (
                    <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                      <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                        Update Claim Status
                      </h3>
                      
                      {updateSuccess && (
                        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
                          Claim updated successfully
                        </div>
                      )}
                      
                      {updateError && (
                        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                          {updateError}
                        </div>
                      )}
                      
                      <div className="space-y-6">
                        <div>
                          <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                            Status
                          </label>
                          <select
                            id="status"
                            name="status"
                            value={updateStatus}
                            onChange={(e) => setUpdateStatus(e.target.value)}
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                          >
                            <option value="">Select a status</option>
                            <option value="resolved">Resolved</option>
                            <option value="rejected">Rejected</option>
                          </select>
                        </div>
                        
                        <div>
                          <label htmlFor="resolution" className="block text-sm font-medium text-gray-700">
                            Resolution Notes
                          </label>
                          <textarea
                            id="resolution"
                            name="resolution"
                            rows={4}
                            value={resolution}
                            onChange={(e) => setResolution(e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            placeholder="Provide details about how the claim was resolved or why it was rejected"
                          />
                        </div>
                        
                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={handleUpdateClaim}
                            disabled={updating}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            {updating ? 'Updating...' : 'Update Claim'}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                  <div className="px-4 py-5 sm:px-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Claim Not Found
                    </h3>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500">
                      The warranty claim you are looking for does not exist or you do not have permission to view it.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </MainLayout>
  );
};

export default WarrantyClaimPage;
