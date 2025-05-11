import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import {
  Shield,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  MessageSquare,
  Image,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import LoadingSpinner from '../LoadingSpinner';
import { formatDistanceToNow, format } from 'date-fns';

interface WarrantyClaimPhoto {
  id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  public_url: string;
}

interface WarrantyClaim {
  id: string;
  warranty_id: string;
  client_id: string;
  service_agent_id: string;
  description: string;
  status: 'pending' | 'in_progress' | 'approved' | 'rejected' | 'resolved';
  admin_notes?: string;
  resolution?: string;
  resolved_by?: string;
  resolved_at?: string;
  created_at: string;
  updated_at: string;
  warranty?: {
    id: string;
    start_date: string;
    end_date: string;
    warranty_type: {
      name: string;
      description: string;
    };
    service: {
      title: string;
      description: string;
    };
  };
  client?: {
    full_name: string;
    email: string;
    avatar_url?: string;
  };
  service_agent?: {
    full_name: string;
    email: string;
    avatar_url?: string;
  };
  resolver?: {
    full_name: string;
    email: string;
  };
  photos?: WarrantyClaimPhoto[];
}

interface EnhancedWarrantyClaimDetailProps {
  claimId: string;
  onBack: () => void;
  isAdmin?: boolean;
}

const EnhancedWarrantyClaimDetail: React.FC<EnhancedWarrantyClaimDetailProps> = ({
  claimId,
  onBack,
  isAdmin = false
}) => {
  const { user } = useAuth();
  const [claim, setClaim] = useState<WarrantyClaim | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resolution, setResolution] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [showPhotoModal, setShowPhotoModal] = useState(false);

  useEffect(() => {
    fetchWarrantyClaim();
  }, [claimId]);

  const fetchWarrantyClaim = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('warranty_claims')
        .select(`
          id,
          warranty_id,
          client_id,
          service_agent_id,
          description,
          status,
          admin_notes,
          resolution,
          resolved_by,
          resolved_at,
          created_at,
          updated_at,
          warranty:warranties(
            id,
            start_date,
            end_date,
            warranty_type:warranty_types(
              name,
              description
            ),
            service:services(
              title,
              description
            )
          ),
          client:profiles!warranty_claims_client_id_fkey(
            full_name,
            email,
            avatar_url
          ),
          service_agent:profiles!warranty_claims_service_agent_id_fkey(
            full_name,
            email,
            avatar_url
          ),
          resolver:profiles!warranty_claims_resolved_by_fkey(
            full_name,
            email
          )
        `)
        .eq('id', claimId)
        .single();

      if (fetchError) throw fetchError;

      // Fetch photos
      const { data: photos, error: photosError } = await supabase
        .from('warranty_claim_photos')
        .select('*')
        .eq('claim_id', claimId);

      if (photosError) throw photosError;

      setClaim({ ...data, photos: photos || [] });
      setAdminNotes(data.admin_notes || '');
      setResolution(data.resolution || '');
    } catch (err) {
      console.error('Error fetching warranty claim:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch warranty claim');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: WarrantyClaim['status']) => {
    if (!claim || !user) return;

    try {
      setSubmitting(true);

      const updates: any = {
        status: newStatus
      };

      // If resolving or rejecting, add resolution and resolver info
      if (newStatus === 'resolved' || newStatus === 'rejected') {
        if (!resolution.trim()) {
          setError('Please provide a resolution before resolving or rejecting the claim');
          setSubmitting(false);
          return;
        }

        updates.resolution = resolution;
        updates.resolved_by = user.id;
        updates.resolved_at = new Date().toISOString();
      }

      // If admin, update admin notes
      if (isAdmin && adminNotes.trim()) {
        updates.admin_notes = adminNotes;
      }

      const { error: updateError } = await supabase
        .from('warranty_claims')
        .update(updates)
        .eq('id', claim.id);

      if (updateError) throw updateError;

      // Create notification for the client
      await supabase
        .from('notifications')
        .insert({
          user_id: claim.client_id,
          title: `Warranty Claim ${getStatusDisplayName(newStatus)}`,
          message: `Your warranty claim has been ${getStatusDisplayName(newStatus).toLowerCase()}.`,
          type: 'warranty',
          is_read: false
        });

      // Refresh the claim data
      fetchWarrantyClaim();
    } catch (err) {
      console.error('Error updating warranty claim:', err);
      setError(err instanceof Error ? err.message : 'Failed to update warranty claim');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusDisplayName = (status: WarrantyClaim['status']) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'in_progress': return 'In Progress';
      case 'approved': return 'Approved';
      case 'rejected': return 'Rejected';
      case 'resolved': return 'Resolved';
      default: return status;
    }
  };

  const getStatusColor = (status: WarrantyClaim['status']) => {
    switch (status) {
      case 'pending': return 'bg-company-lightorange text-gray-800';
      case 'in_progress': return 'bg-company-lightblue text-gray-800';
      case 'approved': return 'bg-company-lighterpink text-gray-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'resolved': return 'bg-company-lightpink text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: WarrantyClaim['status']) => {
    switch (status) {
      case 'pending': return <AlertTriangle className="h-5 w-5 text-company-lightorange" />;
      case 'in_progress': return <Clock className="h-5 w-5 text-company-lightblue" />;
      case 'approved': return <CheckCircle className="h-5 w-5 text-company-lighterpink" />;
      case 'rejected': return <XCircle className="h-5 w-5 text-red-500" />;
      case 'resolved': return <CheckCircle className="h-5 w-5 text-company-lightpink" />;
      default: return <AlertTriangle className="h-5 w-5 text-gray-500" />;
    }
  };

  const nextPhoto = () => {
    if (!claim?.photos) return;
    setPhotoIndex((photoIndex + 1) % claim.photos.length);
  };

  const prevPhoto = () => {
    if (!claim?.photos) return;
    setPhotoIndex((photoIndex - 1 + claim.photos.length) % claim.photos.length);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertTriangle className="h-5 w-5 text-red-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error loading warranty claim</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error}</p>
            </div>
            <div className="mt-4">
              <button
                type="button"
                onClick={onBack}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!claim) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertTriangle className="h-5 w-5 text-yellow-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">Warranty claim not found</h3>
            <div className="mt-4">
              <button
                type="button"
                onClick={onBack}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-yellow-700 bg-yellow-100 hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isServiceAgent = user?.id === claim.service_agent_id;
  const isClient = user?.id === claim.client_id;
  const canUpdateStatus = isServiceAgent || isAdmin;
  const isPending = claim.status === 'pending';
  const isInProgress = claim.status === 'in_progress';
  const isResolved = claim.status === 'resolved' || claim.status === 'rejected';

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      {/* Photo Modal */}
      {showPhotoModal && claim.photos && claim.photos.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="relative max-w-4xl max-h-screen p-4">
            <button
              onClick={() => setShowPhotoModal(false)}
              className="absolute top-2 right-2 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-75"
            >
              <XCircle className="h-6 w-6" />
            </button>

            <img
              src={claim.photos[photoIndex].public_url}
              alt={`Warranty claim photo ${photoIndex + 1}`}
              className="max-h-[80vh] max-w-full object-contain"
            />

            {claim.photos.length > 1 && (
              <div className="absolute inset-x-0 bottom-4 flex justify-center space-x-4">
                <button
                  onClick={prevPhoto}
                  className="bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-75"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <div className="bg-black bg-opacity-50 text-white px-3 py-1 rounded-full">
                  {photoIndex + 1} / {claim.photos.length}
                </div>
                <button
                  onClick={nextPhoto}
                  className="bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-75"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center">
          <button
            onClick={onBack}
            className="mr-3 text-gray-500 hover:text-gray-700"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h2 className="text-lg font-semibold text-gray-900">Warranty Claim Details</h2>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(claim.status)}`}>
          <div className="flex items-center">
            {getStatusIcon(claim.status)}
            <span className="ml-1">{getStatusDisplayName(claim.status)}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left column - Claim details */}
          <div className="md:col-span-2 space-y-6">
            <div>
              <h3 className="text-base font-medium text-gray-900 mb-2">Issue Description</h3>
              <div className="bg-gray-50 rounded-md p-4 text-gray-700 whitespace-pre-wrap">
                {claim.description}
              </div>
            </div>

            {claim.photos && claim.photos.length > 0 && (
              <div>
                <h3 className="text-base font-medium text-gray-900 mb-2">Photos</h3>
                <div className="flex flex-wrap gap-2">
                  {claim.photos.map((photo, index) => (
                    <div
                      key={photo.id}
                      className="relative cursor-pointer"
                      onClick={() => {
                        setPhotoIndex(index);
                        setShowPhotoModal(true);
                      }}
                    >
                      <img
                        src={photo.public_url}
                        alt={`Claim photo ${index + 1}`}
                        className="h-24 w-24 object-cover rounded-md border border-gray-300 hover:border-blue-500"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 hover:bg-opacity-30 transition-opacity rounded-md">
                        <Image className="h-8 w-8 text-white opacity-0 hover:opacity-100" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {claim.resolution && (
              <div>
                <h3 className="text-base font-medium text-gray-900 mb-2">Resolution</h3>
                <div className="bg-gray-50 rounded-md p-4 text-gray-700 whitespace-pre-wrap">
                  {claim.resolution}
                </div>
                {claim.resolved_at && claim.resolver && (
                  <p className="text-sm text-gray-500 mt-2">
                    Resolved by {claim.resolver.full_name} on {format(new Date(claim.resolved_at), 'PPP')}
                  </p>
                )}
              </div>
            )}

            {isAdmin && claim.admin_notes && (
              <div>
                <h3 className="text-base font-medium text-gray-900 mb-2">Admin Notes</h3>
                <div className="bg-gray-50 rounded-md p-4 text-gray-700 whitespace-pre-wrap">
                  {claim.admin_notes}
                </div>
              </div>
            )}

            {canUpdateStatus && !isResolved && (
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-base font-medium text-gray-900 mb-4">Update Claim</h3>

                <div className="space-y-4">
                  <div>
                    <label htmlFor="resolution" className="block text-sm font-medium text-gray-700 mb-1">
                      {isPending ? 'Initial Response' : 'Resolution'}
                    </label>
                    <textarea
                      id="resolution"
                      value={resolution}
                      onChange={(e) => setResolution(e.target.value)}
                      rows={3}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      placeholder={isPending ? 'Provide an initial response to this claim...' : 'Describe how this issue was resolved...'}
                    />
                  </div>

                  {isAdmin && (
                    <div>
                      <label htmlFor="adminNotes" className="block text-sm font-medium text-gray-700 mb-1">
                        Admin Notes (Internal Only)
                      </label>
                      <textarea
                        id="adminNotes"
                        value={adminNotes}
                        onChange={(e) => setAdminNotes(e.target.value)}
                        rows={2}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        placeholder="Add internal notes about this claim..."
                      />
                    </div>
                  )}

                  <div className="flex flex-wrap gap-3">
                    {isPending && (
                      <button
                        type="button"
                        onClick={() => handleStatusChange('in_progress')}
                        disabled={submitting}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                      >
                        {submitting ? <LoadingSpinner size="small" /> : <Clock className="h-4 w-4 mr-2" />}
                        Mark In Progress
                      </button>
                    )}

                    {(isPending || isInProgress) && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleStatusChange('resolved')}
                          disabled={submitting || !resolution.trim()}
                          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                        >
                          {submitting ? <LoadingSpinner size="small" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                          Resolve Claim
                        </button>

                        <button
                          type="button"
                          onClick={() => handleStatusChange('rejected')}
                          disabled={submitting || !resolution.trim()}
                          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                        >
                          {submitting ? <LoadingSpinner size="small" /> : <XCircle className="h-4 w-4 mr-2" />}
                          Reject Claim
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right column - Sidebar info */}
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-md p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Claim Information</h3>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-500">Claim ID:</dt>
                  <dd className="text-gray-900 font-medium">{claim.id.slice(0, 8)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Submitted:</dt>
                  <dd className="text-gray-900">
                    {formatDistanceToNow(new Date(claim.created_at), { addSuffix: true })}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Last Updated:</dt>
                  <dd className="text-gray-900">
                    {formatDistanceToNow(new Date(claim.updated_at), { addSuffix: true })}
                  </dd>
                </div>
              </dl>
            </div>

            {claim.warranty && (
              <div className="bg-gray-50 rounded-md p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Warranty Information</h3>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Type:</dt>
                    <dd className="text-gray-900 font-medium">{claim.warranty.warranty_type.name}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Service:</dt>
                    <dd className="text-gray-900">{claim.warranty.service.title}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Start Date:</dt>
                    <dd className="text-gray-900">{format(new Date(claim.warranty.start_date), 'PP')}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">End Date:</dt>
                    <dd className="text-gray-900">{format(new Date(claim.warranty.end_date), 'PP')}</dd>
                  </div>
                </dl>
              </div>
            )}

            <div className="bg-gray-50 rounded-md p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Contact Information</h3>
              {claim.client && (
                <div className="mb-4">
                  <h4 className="text-xs font-medium text-gray-500 mb-2">Client</h4>
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <img
                        src={claim.client.avatar_url || '/default-avatar.png'}
                        alt={claim.client.full_name}
                        className="h-8 w-8 rounded-full"
                      />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">{claim.client.full_name}</p>
                      <p className="text-xs text-gray-500">{claim.client.email}</p>
                    </div>
                  </div>
                </div>
              )}

              {claim.service_agent && (
                <div>
                  <h4 className="text-xs font-medium text-gray-500 mb-2">Service Agent</h4>
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <img
                        src={claim.service_agent.avatar_url || '/default-avatar.png'}
                        alt={claim.service_agent.full_name}
                        className="h-8 w-8 rounded-full"
                      />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">{claim.service_agent.full_name}</p>
                      <p className="text-xs text-gray-500">{claim.service_agent.email}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedWarrantyClaimDetail;
