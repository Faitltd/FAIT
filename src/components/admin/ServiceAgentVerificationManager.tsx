import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Shield, CheckCircle, XCircle, AlertTriangle, Eye, Search, Filter, ChevronDown } from 'lucide-react';
import LoadingSpinner from '../LoadingSpinner';

interface VerificationRequest {
  id: string;
  service_agent_id: string;
  status: 'pending' | 'approved' | 'rejected';
  submitted_at: string;
  reviewed_at: string | null;
  reviewer_id: string | null;
  rejection_reason: string | null;
  documents: Record<string, string>;
  service_agent: {
    full_name: string;
    email: string;
    phone: string;
    business_name: string;
    license_number: string;
    license_type: string;
  };
}

/**
 * Component for admins to manage service agent verification requests
 */
const ServiceAgentVerificationManager: React.FC = () => {
  const [verificationRequests, setVerificationRequests] = useState<VerificationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<VerificationRequest | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  // Fetch verification requests
  useEffect(() => {
    fetchVerificationRequests();
  }, [statusFilter]);
  
  const fetchVerificationRequests = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('service_agent_verifications')
        .select(`
          *,
          service_agent:profiles(
            full_name,
            email,
            phone,
            business_name,
            license_number,
            license_type
          )
        `)
        .order('submitted_at', { ascending: false });
      
      // Apply status filter
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }
      
      const { data, error: fetchError } = await query;
      
      if (fetchError) throw fetchError;
      
      setVerificationRequests(data as VerificationRequest[]);
      setError(null);
    } catch (err) {
      console.error('Error fetching verification requests:', err);
      setError('Failed to load verification requests. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle approving a verification request
  const handleApprove = async () => {
    if (!selectedRequest) return;
    
    try {
      setProcessing(true);
      
      // Update verification request
      const { error: updateError } = await supabase
        .from('service_agent_verifications')
        .update({
          status: 'approved',
          reviewed_at: new Date().toISOString(),
          reviewer_id: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', selectedRequest.id);
      
      if (updateError) throw updateError;
      
      // Update service agent profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          verified: true,
          verification_date: new Date().toISOString()
        })
        .eq('id', selectedRequest.service_agent_id);
      
      if (profileError) throw profileError;
      
      // Close modal and refresh data
      setShowModal(false);
      fetchVerificationRequests();
    } catch (err) {
      console.error('Error approving verification request:', err);
      setError('Failed to approve verification request. Please try again.');
    } finally {
      setProcessing(false);
    }
  };
  
  // Handle rejecting a verification request
  const handleReject = async () => {
    if (!selectedRequest || !rejectionReason.trim()) return;
    
    try {
      setProcessing(true);
      
      // Update verification request
      const { error: updateError } = await supabase
        .from('service_agent_verifications')
        .update({
          status: 'rejected',
          reviewed_at: new Date().toISOString(),
          reviewer_id: (await supabase.auth.getUser()).data.user?.id,
          rejection_reason: rejectionReason
        })
        .eq('id', selectedRequest.id);
      
      if (updateError) throw updateError;
      
      // Close modal and refresh data
      setShowModal(false);
      setRejectionReason('');
      fetchVerificationRequests();
    } catch (err) {
      console.error('Error rejecting verification request:', err);
      setError('Failed to reject verification request. Please try again.');
    } finally {
      setProcessing(false);
    }
  };
  
  // Open verification details modal
  const openVerificationModal = (request: VerificationRequest) => {
    setSelectedRequest(request);
    setShowModal(true);
  };
  
  // Filter verification requests by search query
  const filteredRequests = verificationRequests.filter(request => {
    if (!searchQuery.trim()) return true;
    
    const query = searchQuery.toLowerCase();
    const serviceAgent = request.service_agent;
    
    return (
      serviceAgent.full_name.toLowerCase().includes(query) ||
      serviceAgent.email.toLowerCase().includes(query) ||
      serviceAgent.business_name?.toLowerCase().includes(query) ||
      serviceAgent.license_number?.toLowerCase().includes(query)
    );
  });
  
  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  return (
    <div className="space-y-6">
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900">Service Agent Verification</h2>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
              <ChevronDown className={`ml-1 h-4 w-4 transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
            
            <button
              onClick={fetchVerificationRequests}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Refresh
            </button>
          </div>
        </div>
        
        {showFilters && (
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  id="status-filter"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="search-query" className="block text-sm font-medium text-gray-700 mb-1">
                  Search
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="search-query"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name, email, business..."
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
        
        {error && (
          <div className="px-6 py-4">
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <AlertTriangle className="h-5 w-5 text-red-400 mr-3" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        {loading ? (
          <div className="px-6 py-12 flex justify-center">
            <LoadingSpinner />
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No verification requests found</h3>
            <p className="text-gray-500">
              {statusFilter === 'pending'
                ? 'There are no pending verification requests.'
                : 'No verification requests match your filters.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Service Agent
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Business
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    License
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submitted
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRequests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {request.service_agent.full_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {request.service_agent.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{request.service_agent.business_name || '-'}</div>
                      <div className="text-sm text-gray-500">{request.service_agent.phone || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{request.service_agent.license_type || '-'}</div>
                      <div className="text-sm text-gray-500">{request.service_agent.license_number || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(request.submitted_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        request.status === 'approved'
                          ? 'bg-green-100 text-green-800'
                          : request.status === 'rejected'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => openVerificationModal(request)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Verification Details Modal */}
      {showModal && selectedRequest && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Verification Details
                    </h3>
                    
                    <div className="mt-4 border-t border-gray-200 pt-4">
                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-500">Service Agent</h4>
                          <p className="mt-1 text-sm text-gray-900">{selectedRequest.service_agent.full_name}</p>
                          <p className="text-sm text-gray-500">{selectedRequest.service_agent.email}</p>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium text-gray-500">Business Information</h4>
                          <p className="mt-1 text-sm text-gray-900">
                            {selectedRequest.service_agent.business_name || 'Not provided'}
                          </p>
                          <p className="text-sm text-gray-500">
                            {selectedRequest.service_agent.license_type || 'No license type'} • 
                            {selectedRequest.service_agent.license_number 
                              ? ` License #${selectedRequest.service_agent.license_number}`
                              : ' No license number'}
                          </p>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium text-gray-500">Verification Documents</h4>
                          <div className="mt-2 space-y-2">
                            {selectedRequest.documents?.license && (
                              <a
                                href={selectedRequest.documents.license}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block px-4 py-2 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100"
                              >
                                View Business License
                              </a>
                            )}
                            
                            {selectedRequest.documents?.insurance && (
                              <a
                                href={selectedRequest.documents.insurance}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block px-4 py-2 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100"
                              >
                                View Insurance Certificate
                              </a>
                            )}
                            
                            {selectedRequest.documents?.id && (
                              <a
                                href={selectedRequest.documents.id}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block px-4 py-2 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100"
                              >
                                View Government ID
                              </a>
                            )}
                            
                            {!selectedRequest.documents?.license && 
                             !selectedRequest.documents?.insurance && 
                             !selectedRequest.documents?.id && (
                              <p className="text-sm text-gray-500">No documents provided</p>
                            )}
                          </div>
                        </div>
                        
                        {selectedRequest.status === 'rejected' && selectedRequest.rejection_reason && (
                          <div>
                            <h4 className="text-sm font-medium text-gray-500">Rejection Reason</h4>
                            <p className="mt-1 text-sm text-red-600">{selectedRequest.rejection_reason}</p>
                          </div>
                        )}
                        
                        {selectedRequest.status === 'pending' && (
                          <div>
                            <h4 className="text-sm font-medium text-gray-500">Verification Decision</h4>
                            <div className="mt-2 flex space-x-4">
                              <button
                                type="button"
                                onClick={handleApprove}
                                disabled={processing}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                              >
                                {processing ? (
                                  <LoadingSpinner size="small" className="mr-2" />
                                ) : (
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                )}
                                Approve
                              </button>
                              
                              <button
                                type="button"
                                onClick={() => document.getElementById('rejection-reason')?.focus()}
                                disabled={processing}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                              >
                                {processing ? (
                                  <LoadingSpinner size="small" className="mr-2" />
                                ) : (
                                  <XCircle className="h-4 w-4 mr-2" />
                                )}
                                Reject
                              </button>
                            </div>
                            
                            <div className="mt-4">
                              <label htmlFor="rejection-reason" className="block text-sm font-medium text-gray-700">
                                Rejection Reason (required for rejection)
                              </label>
                              <textarea
                                id="rejection-reason"
                                rows={3}
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                                placeholder="Explain why this verification is being rejected..."
                              />
                              <button
                                type="button"
                                onClick={handleReject}
                                disabled={processing || !rejectionReason.trim()}
                                className="mt-2 w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                              >
                                Confirm Rejection
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceAgentVerificationManager;
