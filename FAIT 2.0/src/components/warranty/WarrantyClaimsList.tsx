import React, { useState, useEffect } from 'react';
import { 
  AlertCircle, 
  CheckCircle, 
  XCircle, 
  Clock, 
  PauseCircle,
  Image,
  MessageSquare,
  User
} from 'lucide-react';
import { WarrantyClaim, WarrantyClaimStatus } from '../../types/warranty';
import { warrantyService } from '../../services/WarrantyService';

interface WarrantyClaimsListProps {
  warrantyId: string;
  isContractor?: boolean;
}

const WarrantyClaimsList: React.FC<WarrantyClaimsListProps> = ({ 
  warrantyId, 
  isContractor = false 
}) => {
  const [claims, setClaims] = useState<WarrantyClaim[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedClaimId, setExpandedClaimId] = useState<string | null>(null);
  const [updatingClaimId, setUpdatingClaimId] = useState<string | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [newStatus, setNewStatus] = useState<WarrantyClaimStatus>('pending');

  useEffect(() => {
    fetchClaims();
  }, [warrantyId]);

  const fetchClaims = async () => {
    try {
      setLoading(true);
      const data = await warrantyService.getWarrantyClaims(warrantyId);
      setClaims(data);
      setError(null);
    } catch (err) {
      setError('Failed to load warranty claims');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateClaim = async (claimId: string) => {
    try {
      const updatedClaim = await warrantyService.updateWarrantyClaim(
        claimId,
        {
          status: newStatus,
          resolution_notes: resolutionNotes || null
        }
      );

      if (updatedClaim) {
        setClaims(claims.map(claim => 
          claim.id === claimId ? updatedClaim : claim
        ));
        setUpdatingClaimId(null);
        setResolutionNotes('');
      }
    } catch (err) {
      console.error('Failed to update claim:', err);
    }
  };

  const getStatusIcon = (status: WarrantyClaimStatus) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'in_progress':
        return <Clock className="h-5 w-5 text-blue-500" />;
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'cancelled':
        return <PauseCircle className="h-5 w-5 text-yellow-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: WarrantyClaimStatus) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  if (loading) {
    return (
      <div className="p-4 bg-white rounded-lg shadow">
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-white rounded-lg shadow">
        <div className="text-red-500 flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Warranty Claims</h3>
        <p className="mt-1 text-sm text-gray-500">
          {claims.length === 0 
            ? 'No claims have been submitted for this warranty.'
            : `${claims.length} claim${claims.length === 1 ? '' : 's'} submitted for this warranty.`}
        </p>
      </div>

      {claims.length === 0 ? (
        <div className="p-8 text-center">
          <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Claims</h3>
          <p className="text-gray-500">
            No warranty claims have been submitted yet.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-gray-200">
          {claims.map((claim) => (
            <div key={claim.id} className="p-4 hover:bg-gray-50">
              <div className="flex items-start">
                <div className="mr-3">
                  {getStatusIcon(claim.status)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(claim.status)}`}>
                      {claim.status.replace('_', ' ').charAt(0).toUpperCase() + claim.status.replace('_', ' ').slice(1)}
                    </span>
                    <button
                      onClick={() => setExpandedClaimId(expandedClaimId === claim.id ? null : claim.id)}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      {expandedClaimId === claim.id ? 'Collapse' : 'Expand'}
                    </button>
                  </div>
                  
                  <div className="mt-2 flex items-center text-xs text-gray-500">
                    <User className="h-3 w-3 mr-1" />
                    <span>
                      Submitted by {claim.client?.full_name || 'Client'} on {formatDate(claim.created_at)}
                    </span>
                  </div>
                  
                  {(expandedClaimId === claim.id || updatingClaimId === claim.id) && (
                    <div className="mt-3 space-y-3">
                      <p className="text-sm text-gray-700">
                        {claim.description}
                      </p>
                      
                      {claim.photo_urls && claim.photo_urls.length > 0 && (
                        <div>
                          <h4 className="text-xs font-medium text-gray-700 mb-2 flex items-center">
                            <Image className="h-3 w-3 mr-1" />
                            Photos
                          </h4>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {claim.photo_urls.map((url, index) => (
                              <a 
                                key={index} 
                                href={url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="block"
                              >
                                <img 
                                  src={url} 
                                  alt={`Claim photo ${index + 1}`} 
                                  className="h-20 w-20 object-cover rounded-md hover:opacity-75"
                                />
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {claim.resolution_notes && (
                        <div className="bg-gray-50 p-3 rounded-md">
                          <h4 className="text-xs font-medium text-gray-700 mb-1">Resolution Notes:</h4>
                          <p className="text-sm text-gray-700">{claim.resolution_notes}</p>
                        </div>
                      )}
                      
                      {claim.resolved_at && (
                        <div className="text-xs text-gray-500">
                          Resolved on {formatDate(claim.resolved_at)} by {claim.resolver?.full_name || 'Contractor'}
                        </div>
                      )}
                      
                      {isContractor && claim.status !== 'completed' && claim.status !== 'cancelled' && (
                        <div className="pt-3 border-t border-gray-200">
                          {updatingClaimId === claim.id ? (
                            <form 
                              onSubmit={(e) => {
                                e.preventDefault();
                                handleUpdateClaim(claim.id);
                              }}
                              className="space-y-3"
                            >
                              <div>
                                <label htmlFor="new_status" className="block text-sm font-medium text-gray-700">
                                  Update Status
                                </label>
                                <select
                                  id="new_status"
                                  value={newStatus}
                                  onChange={(e) => setNewStatus(e.target.value as WarrantyClaimStatus)}
                                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                >
                                  <option value="pending">Pending</option>
                                  <option value="approved">Approved</option>
                                  <option value="rejected">Rejected</option>
                                  <option value="in_progress">In Progress</option>
                                  <option value="completed">Completed</option>
                                  <option value="cancelled">Cancelled</option>
                                </select>
                              </div>
                              
                              <div>
                                <label htmlFor="resolution_notes" className="block text-sm font-medium text-gray-700">
                                  Resolution Notes
                                </label>
                                <textarea
                                  id="resolution_notes"
                                  value={resolutionNotes}
                                  onChange={(e) => setResolutionNotes(e.target.value)}
                                  rows={3}
                                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                  placeholder="Provide details about the resolution..."
                                />
                              </div>
                              
                              <div className="flex justify-end space-x-3">
                                <button
                                  type="button"
                                  onClick={() => setUpdatingClaimId(null)}
                                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="submit"
                                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                  Update Claim
                                </button>
                              </div>
                            </form>
                          ) : (
                            <button
                              onClick={() => {
                                setUpdatingClaimId(claim.id);
                                setNewStatus(claim.status);
                                setResolutionNotes(claim.resolution_notes || '');
                              }}
                              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                              Update Claim Status
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WarrantyClaimsList;
