import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import {
  getWarrantyClaim,
  updateWarrantyClaim,
  addWarrantyClaimResolution,
  getWarrantyAttachmentUrl
} from '../../api/warrantyApi';
// import { format, formatDistance } from 'date-fns';

// Helper function to format relative time without date-fns
const formatTimeAgo = (date) => {
  const now = new Date();
  const diffInSeconds = Math.floor((now - new Date(date)) / 1000);

  if (diffInSeconds < 60) {
    return 'just now';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} month${diffInMonths > 1 ? 's' : ''} ago`;
  }

  const diffInYears = Math.floor(diffInMonths / 12);
  return `${diffInYears} year${diffInYears > 1 ? 's' : ''} ago`;
};

// Supabase client is now imported from lib/supabaseClient.js

const WarrantyClaimDetail = ({ claimId, onUpdate }) => {
  const [claim, setClaim] = useState(null);
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [photoUrls, setPhotoUrls] = useState([]);

  const [showResolutionForm, setShowResolutionForm] = useState(false);
  const [resolution, setResolution] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Fetch claim data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Get authenticated user
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);

        if (!user) {
          setError('You must be logged in to view warranty claims');
          return;
        }

        // Get user profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('user_type')
          .eq('id', user.id)
          .single();

        setUserType(profile?.user_type);

        // Get warranty claim
        const claimData = await getWarrantyClaim(claimId);

        // Check if user has permission to view this claim
        if (profile?.user_type === 'client' && claimData.client_id !== user.id) {
          setError('You do not have permission to view this warranty claim');
          return;
        } else if (profile?.user_type === 'service_agent' && claimData.service_agent_id !== user.id) {
          setError('You do not have permission to view this warranty claim');
          return;
        }

        setClaim(claimData);

        // Get photo URLs if any
        if (claimData.photo_urls && claimData.photo_urls.length > 0) {
          const urls = await Promise.all(
            claimData.photo_urls.map(async (path) => {
              try {
                const url = await getWarrantyAttachmentUrl(path);
                return { path, url };
              } catch (err) {
                console.error('Error getting photo URL:', err);
                return { path, url: null };
              }
            })
          );

          setPhotoUrls(urls.filter(item => item.url !== null));
        }
      } catch (err) {
        console.error('Error fetching warranty claim:', err);
        setError('Failed to load warranty claim. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [claimId]);

  // Handle status update
  const handleStatusUpdate = async () => {
    if (!newStatus) {
      return;
    }

    try {
      setSubmitting(true);

      await updateWarrantyClaim(claimId, { status: newStatus }, user.id);

      // Refresh claim data
      const updatedClaim = await getWarrantyClaim(claimId);
      setClaim(updatedClaim);

      // Reset form
      setNewStatus('');

      // Notify parent component
      if (onUpdate) {
        onUpdate(updatedClaim);
      }
    } catch (err) {
      console.error('Error updating warranty claim status:', err);
      setError('Failed to update status. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle resolution submission
  const handleResolutionSubmit = async (e) => {
    e.preventDefault();

    if (!resolution.trim()) {
      setError('Please provide a resolution description');
      return;
    }

    try {
      setSubmitting(true);

      await addWarrantyClaimResolution(claimId, resolution);

      // Refresh claim data
      const updatedClaim = await getWarrantyClaim(claimId);
      setClaim(updatedClaim);

      // Reset form
      setResolution('');
      setShowResolutionForm(false);

      // Notify parent component
      if (onUpdate) {
        onUpdate(updatedClaim);
      }
    } catch (err) {
      console.error('Error adding warranty claim resolution:', err);
      setError('Failed to add resolution. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Get status badge class
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-company-lightorange text-gray-800';
      case 'in_progress':
        return 'bg-company-lightblue text-gray-800';
      case 'approved':
        return 'bg-company-lighterpink text-gray-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'resolved':
        return 'bg-company-lightpink text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !claim) {
    return (
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error || 'Warranty claim not found'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      {/* Header */}
      <div className="px-4 py-5 sm:px-6 bg-gray-50">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Warranty Claim Details
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Submitted on {formatDate(claim.created_at)}
            </p>
          </div>
          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(claim.status)}`}>
            {claim.status.charAt(0).toUpperCase() + claim.status.slice(1).replace('_', ' ')}
          </span>
        </div>
      </div>

      {/* Claim Details */}
      <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
        <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
          {/* Service */}
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-gray-500">Service</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {claim.warranties?.services?.name || 'Unknown Service'}
            </dd>
          </div>

          {/* Service Date */}
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-gray-500">Service Date</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {claim.warranties?.bookings?.service_date
                ? formatDate(claim.warranties.bookings.service_date)
                : 'Unknown'}
            </dd>
          </div>

          {/* Client */}
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-gray-500">Client</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {claim.client?.first_name} {claim.client?.last_name}
            </dd>
          </div>

          {/* Service Agent */}
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-gray-500">Service Agent</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {claim.service_agent?.first_name} {claim.service_agent?.last_name}
            </dd>
          </div>

          {/* Description */}
          <div className="sm:col-span-2">
            <dt className="text-sm font-medium text-gray-500">Description</dt>
            <dd className="mt-1 text-sm text-gray-900 whitespace-pre-line">
              {claim.description}
            </dd>
          </div>

          {/* Photos */}
          {photoUrls.length > 0 && (
            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-gray-500">Photos</dt>
              <dd className="mt-1 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                {photoUrls.map((photo, index) => (
                  <a
                    key={index}
                    href={photo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group block w-full aspect-w-10 aspect-h-7 rounded-lg bg-gray-100 overflow-hidden"
                  >
                    <img
                      src={photo.url}
                      alt={`Warranty claim photo ${index + 1}`}
                      className="object-cover group-hover:opacity-75"
                    />
                  </a>
                ))}
              </dd>
            </div>
          )}

          {/* Resolution */}
          {claim.resolution && (
            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-gray-500">Resolution</dt>
              <dd className="mt-1 text-sm text-gray-900 whitespace-pre-line">
                {claim.resolution}
              </dd>
            </div>
          )}

          {/* Resolved At */}
          {claim.resolved_at && (
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Resolved On</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {formatDate(claim.resolved_at)}
              </dd>
            </div>
          )}

          {/* Resolved By */}
          {claim.resolved_by && (
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Resolved By</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {claim.resolved_by_name || 'Unknown'}
              </dd>
            </div>
          )}
        </dl>
      </div>

      {/* Actions */}
      {userType === 'service_agent' && claim.status !== 'resolved' && (
        <div className="border-t border-gray-200 px-4 py-5 sm:px-6 bg-gray-50">
          <h4 className="text-sm font-medium text-gray-500">Actions</h4>

          {/* Status Update */}
          <div className="mt-3 flex flex-col sm:flex-row sm:items-center">
            <div className="flex-grow sm:mr-4 mb-3 sm:mb-0">
              <select
                id="status"
                name="status"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                disabled={submitting}
              >
                <option value="">Update Status</option>
                {claim.status === 'pending' && (
                  <>
                    <option value="in_progress">Mark as In Progress</option>
                    <option value="approved">Approve Claim</option>
                    <option value="rejected">Reject Claim</option>
                  </>
                )}
                {claim.status === 'in_progress' && (
                  <>
                    <option value="approved">Approve Claim</option>
                    <option value="rejected">Reject Claim</option>
                  </>
                )}
                {claim.status === 'approved' && (
                  <option value="resolved">Mark as Resolved</option>
                )}
              </select>
            </div>
            <button
              type="button"
              onClick={handleStatusUpdate}
              disabled={!newStatus || submitting}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                  Updating...
                </>
              ) : (
                'Update Status'
              )}
            </button>
          </div>

          {/* Resolution Form */}
          {(claim.status === 'approved' || claim.status === 'in_progress') && (
            <div className="mt-4">
              {!showResolutionForm ? (
                <button
                  type="button"
                  onClick={() => setShowResolutionForm(true)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  disabled={submitting}
                >
                  Add Resolution
                </button>
              ) : (
                <form onSubmit={handleResolutionSubmit} className="mt-3">
                  <div className="mb-3">
                    <label htmlFor="resolution" className="block text-sm font-medium text-gray-700">
                      Resolution Details
                    </label>
                    <textarea
                      id="resolution"
                      name="resolution"
                      rows={4}
                      value={resolution}
                      onChange={(e) => setResolution(e.target.value)}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      placeholder="Describe how the issue was resolved..."
                      required
                      disabled={submitting}
                    />
                  </div>
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowResolutionForm(false)}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      disabled={submitting}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      disabled={submitting}
                    >
                      {submitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                          Submitting...
                        </>
                      ) : (
                        'Submit Resolution'
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WarrantyClaimDetail;
