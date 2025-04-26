import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { verificationService } from '../../services/VerificationService';
import { 
  VerificationRequest, 
  VerificationDocument 
} from '../../types/verification.types';
import VerificationStatus from '../../modules/verification/components/VerificationStatus';

/**
 * Admin page for reviewing verification requests
 */
const VerificationReviewPage: React.FC = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requests, setRequests] = useState<VerificationRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<VerificationRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Check if user is admin
  const isAdmin = user?.role === 'admin';

  // Fetch verification requests
  const fetchRequests = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const requestsData = await verificationService.getRequestsForReview();
      setRequests(requestsData);
    } catch (err: any) {
      console.error('Error fetching verification requests:', err);
      setError(err.message || 'Failed to load verification requests');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch requests on mount
  useEffect(() => {
    if (isAdmin) {
      fetchRequests();
    } else {
      setIsLoading(false);
    }
  }, [isAdmin]);

  // Fetch request details
  const handleSelectRequest = async (request: VerificationRequest) => {
    try {
      const requestDetails = await verificationService.getRequestById(request.id);
      if (requestDetails) {
        setSelectedRequest(requestDetails);
      }
    } catch (err: any) {
      console.error('Error fetching request details:', err);
      setError(err.message || 'Failed to load request details');
    }
  };

  // Approve a verification request
  const handleApprove = async () => {
    if (!selectedRequest || !user) return;
    
    setIsProcessing(true);
    setError(null);
    
    try {
      await verificationService.approveRequest(selectedRequest.id, user.id);
      setSelectedRequest(null);
      fetchRequests();
    } catch (err: any) {
      console.error('Error approving request:', err);
      setError(err.message || 'Failed to approve request');
    } finally {
      setIsProcessing(false);
    }
  };

  // Reject a verification request
  const handleReject = async () => {
    if (!selectedRequest || !user || !rejectionReason.trim()) return;
    
    setIsProcessing(true);
    setError(null);
    
    try {
      await verificationService.rejectRequest(
        selectedRequest.id, 
        user.id, 
        rejectionReason
      );
      setSelectedRequest(null);
      setRejectionReason('');
      fetchRequests();
    } catch (err: any) {
      console.error('Error rejecting request:', err);
      setError(err.message || 'Failed to reject request');
    } finally {
      setIsProcessing(false);
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
        <div className="relative py-3 sm:max-w-xl sm:mx-auto">
          <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-lg sm:p-20">
            <div className="max-w-md mx-auto">
              <div className="divide-y divide-gray-200">
                <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                  <p>You don't have permission to access this page.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="py-10">
        <header>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold leading-tight text-gray-900">Verification Requests</h1>
          </div>
        </header>
        <main>
          <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div className="px-4 py-6 sm:px-0">
              {error && (
                <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex flex-col md:flex-row gap-6">
                {/* Requests List */}
                <div className="md:w-1/3">
                  <div className="bg-white shadow overflow-hidden sm:rounded-md">
                    <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        Pending Requests
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        {requests.length} requests awaiting review
                      </p>
                    </div>
                    
                    {isLoading ? (
                      <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                      </div>
                    ) : requests.length === 0 ? (
                      <div className="px-4 py-5 text-center text-gray-500">
                        No pending verification requests
                      </div>
                    ) : (
                      <ul className="divide-y divide-gray-200">
                        {requests.map((request) => (
                          <li key={request.id}>
                            <button
                              onClick={() => handleSelectRequest(request)}
                              className={`w-full px-4 py-4 flex items-center hover:bg-gray-50 focus:outline-none ${
                                selectedRequest?.id === request.id ? 'bg-blue-50' : ''
                              }`}
                            >
                              <div className="min-w-0 flex-1 flex items-center">
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm font-medium text-gray-900 truncate">
                                    {(request as any).profiles?.first_name} {(request as any).profiles?.last_name}
                                  </p>
                                  <p className="text-sm text-gray-500 truncate">
                                    {(request as any).profiles?.email}
                                  </p>
                                  <p className="mt-1 flex items-center text-xs text-gray-500">
                                    <span>Requested: {formatDate(request.request_date)}</span>
                                  </p>
                                </div>
                              </div>
                              <div>
                                <VerificationStatus status={request.status} />
                              </div>
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
                
                {/* Request Details */}
                <div className="md:w-2/3">
                  {selectedRequest ? (
                    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                      <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">
                          Verification Request Details
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                          Review the submitted documents and approve or reject the request.
                        </p>
                      </div>
                      
                      <div className="px-4 py-5 sm:p-6">
                        <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                          <div className="sm:col-span-1">
                            <dt className="text-sm font-medium text-gray-500">Request ID</dt>
                            <dd className="mt-1 text-sm text-gray-900">{selectedRequest.id}</dd>
                          </div>
                          <div className="sm:col-span-1">
                            <dt className="text-sm font-medium text-gray-500">Status</dt>
                            <dd className="mt-1 text-sm text-gray-900">
                              <VerificationStatus status={selectedRequest.status} />
                            </dd>
                          </div>
                          <div className="sm:col-span-1">
                            <dt className="text-sm font-medium text-gray-500">Requested Date</dt>
                            <dd className="mt-1 text-sm text-gray-900">{formatDate(selectedRequest.request_date)}</dd>
                          </div>
                          <div className="sm:col-span-1">
                            <dt className="text-sm font-medium text-gray-500">User ID</dt>
                            <dd className="mt-1 text-sm text-gray-900">{selectedRequest.user_id}</dd>
                          </div>
                        </dl>
                        
                        <div className="mt-6">
                          <h4 className="text-sm font-medium text-gray-500">Submitted Documents</h4>
                          
                          {selectedRequest.documents && selectedRequest.documents.length > 0 ? (
                            <ul className="mt-2 border border-gray-200 rounded-md divide-y divide-gray-200">
                              {selectedRequest.documents.map((document: VerificationDocument) => (
                                <li key={document.id} className="pl-3 pr-4 py-3 flex items-center justify-between text-sm">
                                  <div className="w-0 flex-1 flex items-center">
                                    <svg className="flex-shrink-0 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                      <path fillRule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" clipRule="evenodd" />
                                    </svg>
                                    <span className="ml-2 flex-1 w-0 truncate">
                                      {document.document_name}
                                    </span>
                                  </div>
                                  <div className="ml-4 flex-shrink-0">
                                    <a
                                      href={document.document_url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="font-medium text-blue-600 hover:text-blue-500"
                                    >
                                      View
                                    </a>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="mt-2 text-sm text-gray-500">No documents submitted</p>
                          )}
                        </div>
                        
                        <div className="mt-6">
                          <div className="flex flex-col space-y-4">
                            <button
                              type="button"
                              onClick={handleApprove}
                              disabled={isProcessing}
                              className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {isProcessing ? 'Processing...' : 'Approve Verification'}
                            </button>
                            
                            <div>
                              <label htmlFor="rejection-reason" className="block text-sm font-medium text-gray-700">
                                Rejection Reason
                              </label>
                              <div className="mt-1">
                                <textarea
                                  id="rejection-reason"
                                  name="rejection-reason"
                                  rows={3}
                                  value={rejectionReason}
                                  onChange={(e) => setRejectionReason(e.target.value)}
                                  className="shadow-sm focus:ring-red-500 focus:border-red-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                  placeholder="Provide a reason for rejection"
                                />
                              </div>
                              <div className="mt-2">
                                <button
                                  type="button"
                                  onClick={handleReject}
                                  disabled={isProcessing || !rejectionReason.trim()}
                                  className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  {isProcessing ? 'Processing...' : 'Reject Verification'}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                      <div className="px-4 py-5 sm:p-6 text-center">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No request selected</h3>
                        <p className="mt-1 text-sm text-gray-500">
                          Select a verification request from the list to review.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default VerificationReviewPage;
