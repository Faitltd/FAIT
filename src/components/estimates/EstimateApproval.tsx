import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import { CheckCircle, XCircle, AlertCircle, Calendar, Clock, FileText, Image } from 'lucide-react';
import LoadingSpinner from '../LoadingSpinner';
import { EstimateItem, EstimatePhoto } from './EstimateBuilder';

interface EstimateApprovalProps {
  estimateId: string;
  onApproved: () => void;
  onRejected: () => void;
  onClose: () => void;
}

const EstimateApproval: React.FC<EstimateApprovalProps> = ({
  estimateId,
  onApproved,
  onRejected,
  onClose
}) => {
  const { user } = useAuth();
  const [estimate, setEstimate] = useState<any>(null);
  const [items, setItems] = useState<EstimateItem[]>([]);
  const [photos, setPhotos] = useState<EstimatePhoto[]>([]);
  const [serviceAgent, setServiceAgent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectionForm, setShowRejectionForm] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);

  useEffect(() => {
    fetchEstimate();
  }, [estimateId]);

  const fetchEstimate = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('estimates')
        .select(`
          *,
          items:estimate_items(*),
          photos:estimate_photos(*)
        `)
        .eq('id', estimateId)
        .single();
      
      if (error) throw error;
      
      // Verify that the current user is the client for this estimate
      if (data.client_id !== user?.id) {
        throw new Error('You are not authorized to view this estimate');
      }
      
      setEstimate(data);
      setItems(data.items || []);
      setPhotos(data.photos || []);
      
      // Fetch service agent details
      if (data.service_agent_id) {
        const { data: agentData, error: agentError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.service_agent_id)
          .single();
        
        if (!agentError) {
          setServiceAgent(agentData);
        }
      }
    } catch (err) {
      console.error('Error fetching estimate:', err);
      setError(err instanceof Error ? err.message : 'Failed to load estimate');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    try {
      setProcessing(true);
      setError(null);
      
      const { error: updateError } = await supabase
        .from('estimates')
        .update({
          status: 'approved',
          updated_at: new Date().toISOString()
        })
        .eq('id', estimateId);
      
      if (updateError) throw updateError;
      
      // Create notification for service agent
      await supabase
        .from('notifications')
        .insert({
          user_id: estimate.service_agent_id,
          title: 'Estimate Approved',
          message: `Your estimate for "${estimate.title}" has been approved by the client.`,
          type: 'estimate',
          is_read: false
        });
      
      onApproved();
    } catch (err) {
      console.error('Error approving estimate:', err);
      setError(err instanceof Error ? err.message : 'Failed to approve estimate');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      setError('Please provide a reason for rejecting the estimate');
      return;
    }
    
    try {
      setProcessing(true);
      setError(null);
      
      const { error: updateError } = await supabase
        .from('estimates')
        .update({
          status: 'rejected',
          notes: `Client rejection reason: ${rejectionReason}`,
          updated_at: new Date().toISOString()
        })
        .eq('id', estimateId);
      
      if (updateError) throw updateError;
      
      // Create notification for service agent
      await supabase
        .from('notifications')
        .insert({
          user_id: estimate.service_agent_id,
          title: 'Estimate Rejected',
          message: `Your estimate for "${estimate.title}" has been rejected by the client.`,
          type: 'estimate',
          is_read: false
        });
      
      onRejected();
    } catch (err) {
      console.error('Error rejecting estimate:', err);
      setError(err instanceof Error ? err.message : 'Failed to reject estimate');
    } finally {
      setProcessing(false);
    }
  };

  const openPhotoModal = (index: number) => {
    setSelectedPhotoIndex(index);
    setShowPhotoModal(true);
  };

  const closePhotoModal = () => {
    setShowPhotoModal(false);
  };

  const nextPhoto = () => {
    setSelectedPhotoIndex((selectedPhotoIndex + 1) % photos.length);
  };

  const prevPhoto = () => {
    setSelectedPhotoIndex((selectedPhotoIndex - 1 + photos.length) % photos.length);
  };

  if (loading) {
    return (
      <div className="py-8 flex justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertCircle className="h-5 w-5 text-red-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error loading estimate</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error}</p>
            </div>
            <div className="mt-4">
              <button
                type="button"
                onClick={onClose}
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

  if (!estimate) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertCircle className="h-5 w-5 text-yellow-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">Estimate not found</h3>
            <div className="mt-4">
              <button
                type="button"
                onClick={onClose}
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

  // Check if estimate is already approved or rejected
  if (estimate.status === 'approved') {
    return (
      <div className="bg-green-50 border border-green-200 rounded-md p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <CheckCircle className="h-5 w-5 text-green-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-green-800">Estimate Already Approved</h3>
            <div className="mt-2 text-sm text-green-700">
              <p>You have already approved this estimate on {formatDateTime(estimate.updated_at)}.</p>
            </div>
            <div className="mt-4">
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (estimate.status === 'rejected') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <XCircle className="h-5 w-5 text-red-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Estimate Already Rejected</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>You have already rejected this estimate on {formatDateTime(estimate.updated_at)}.</p>
              {estimate.notes && (
                <p className="mt-2">Reason: {estimate.notes.replace('Client rejection reason: ', '')}</p>
              )}
            </div>
            <div className="mt-4">
              <button
                type="button"
                onClick={onClose}
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

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      {/* Photo Modal */}
      {showPhotoModal && photos.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
          <div className="relative max-w-4xl max-h-screen p-4">
            <button
              onClick={closePhotoModal}
              className="absolute top-2 right-2 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-75"
            >
              <XCircle className="h-6 w-6" />
            </button>
            
            <img
              src={photos[selectedPhotoIndex].public_url}
              alt={photos[selectedPhotoIndex].file_name}
              className="max-h-[80vh] max-w-full object-contain"
            />
            
            {photos.length > 1 && (
              <div className="absolute inset-x-0 bottom-4 flex justify-center space-x-4">
                <button
                  onClick={prevPhoto}
                  className="bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-75"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <div className="bg-black bg-opacity-50 text-white px-3 py-1 rounded-full">
                  {selectedPhotoIndex + 1} / {photos.length}
                </div>
                <button
                  onClick={nextPhoto}
                  className="bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-75"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{estimate.title}</h2>
            <p className="text-sm text-gray-500">Estimate #{estimate.id.substring(0, 8)}</p>
          </div>
          <div className="mt-2 md:mt-0 flex items-center">
            <div className="text-sm text-gray-500 mr-2">Created:</div>
            <div className="text-sm font-medium text-gray-900">
              {formatDateTime(estimate.created_at)}
            </div>
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left column - Estimate details */}
          <div className="md:col-span-2 space-y-6">
            <div>
              <h3 className="text-base font-medium text-gray-900 mb-2">Description</h3>
              <div className="bg-gray-50 rounded-md p-4 text-gray-700 whitespace-pre-wrap">
                {estimate.description}
              </div>
            </div>
            
            <div>
              <h3 className="text-base font-medium text-gray-900 mb-2">Line Items</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quantity
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Unit Price
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {items.map((item, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.description}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                          {item.quantity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                          {formatCurrency(item.unit_price)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                          {formatCurrency(item.total_price)}
                        </td>
                      </tr>
                    ))}
                    
                    {/* Total row */}
                    <tr className="bg-gray-50">
                      <td colSpan={3} className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                        Total
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-base font-semibold text-gray-900 text-right">
                        {formatCurrency(estimate.total_amount)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            
            {photos.length > 0 && (
              <div>
                <h3 className="text-base font-medium text-gray-900 mb-2">Photos</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {photos.map((photo, index) => (
                    <div
                      key={index}
                      className="relative group cursor-pointer"
                      onClick={() => openPhotoModal(index)}
                    >
                      <div className="aspect-w-1 aspect-h-1 bg-gray-100 rounded-md overflow-hidden">
                        <img
                          src={photo.public_url}
                          alt={photo.file_name}
                          className="object-cover w-full h-full"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity flex items-center justify-center">
                          <Image className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {estimate.notes && (
              <div>
                <h3 className="text-base font-medium text-gray-900 mb-2">Notes</h3>
                <div className="bg-gray-50 rounded-md p-4 text-gray-700 whitespace-pre-wrap">
                  {estimate.notes}
                </div>
              </div>
            )}
          </div>
          
          {/* Right column - Sidebar info */}
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-md p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Estimate Information</h3>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-500">Status:</dt>
                  <dd className="text-gray-900 font-medium">Pending Approval</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Created:</dt>
                  <dd className="text-gray-900">
                    {formatDateTime(estimate.created_at)}
                  </dd>
                </div>
                {estimate.expiration_date && (
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Expires:</dt>
                    <dd className="text-gray-900">
                      {formatDateTime(estimate.expiration_date)}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
            
            {serviceAgent && (
              <div className="bg-gray-50 rounded-md p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Service Agent</h3>
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <img
                      src={serviceAgent.avatar_url || '/default-avatar.png'}
                      alt={serviceAgent.full_name}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">{serviceAgent.full_name}</p>
                    <p className="text-xs text-gray-500">{serviceAgent.email}</p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="bg-blue-50 rounded-md p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <FileText className="h-5 w-5 text-blue-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">Approval Required</h3>
                  <p className="mt-1 text-sm text-blue-700">
                    Please review this estimate carefully. Once approved, work can begin according to the terms outlined.
                  </p>
                </div>
              </div>
            </div>
            
            {/* Approval/Rejection buttons */}
            <div className="space-y-3">
              <button
                type="button"
                onClick={handleApprove}
                disabled={processing}
                className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
              >
                {processing ? (
                  <>
                    <LoadingSpinner size="small" />
                    <span className="ml-2">Processing...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve Estimate
                  </>
                )}
              </button>
              
              {showRejectionForm ? (
                <div className="bg-gray-50 p-3 rounded-md">
                  <label htmlFor="rejection_reason" className="block text-sm font-medium text-gray-700 mb-1">
                    Reason for Rejection
                  </label>
                  <textarea
                    id="rejection_reason"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    rows={3}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
                    placeholder="Please explain why you're rejecting this estimate..."
                    required
                  />
                  <div className="mt-3 flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => setShowRejectionForm(false)}
                      disabled={processing}
                      className="px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleReject}
                      disabled={processing || !rejectionReason.trim()}
                      className="px-3 py-1.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                    >
                      {processing ? (
                        <>
                          <LoadingSpinner size="small" />
                          <span className="ml-2">Processing...</span>
                        </>
                      ) : (
                        'Confirm Rejection'
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowRejectionForm(true)}
                  disabled={processing}
                  className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                >
                  <XCircle className="h-4 w-4 mr-2 text-red-500" />
                  Reject Estimate
                </button>
              )}
              
              <button
                type="button"
                onClick={onClose}
                className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Back to Estimates
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EstimateApproval;
