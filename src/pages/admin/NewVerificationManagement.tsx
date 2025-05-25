import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { 
  ServiceAgentVerification, 
  VerificationStatus,
  DocumentType
} from '../../types/verification.types';
import { useAuth } from '../../contexts/AuthContext';
import AdminLayout from '../../components/layouts/AdminLayout';
import {
  Shield,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Search,
  Filter,
  ChevronDown
} from 'lucide-react';

/**
 * Admin verification management page for the new verification system
 */
const NewVerificationManagement: React.FC = () => {
  const { user } = useAuth();
  const [verifications, setVerifications] = useState<ServiceAgentVerification[]>([]);
  const [selectedVerification, setSelectedVerification] = useState<ServiceAgentVerification | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<VerificationStatus | 'all'>('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  
  useEffect(() => {
    fetchVerifications();
  }, [statusFilter]);
  
  const fetchVerifications = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('service_agent_verification')
        .select(`
          *,
          profiles:service_agent_id(id, full_name, email, phone, business_name),
          verification_documents(*)
        `);
      
      if (statusFilter !== 'all') {
        query = query.eq('verification_status', statusFilter);
      }
      
      query = query.order('created_at', { ascending: false });
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      setVerifications(data || []);
    } catch (err) {
      console.error('Error fetching verifications:', err);
      setError('Failed to load verification requests');
    } finally {
      setLoading(false);
    }
  };
  
  const handleApprove = async (verificationId: string) => {
    if (!user) return;
    
    try {
      setProcessingId(verificationId);
      
      const { data, error } = await supabase.rpc('approve_verification', {
        verification_id: verificationId,
        admin_id: user.id,
        admin_notes: ''
      });
      
      if (error) throw error;
      
      // Refresh the list
      fetchVerifications();
      
      // If the approved verification was selected, update it
      if (selectedVerification && selectedVerification.id === verificationId) {
        const { data: updatedVerification, error: fetchError } = await supabase
          .from('service_agent_verification')
          .select(`
            *,
            profiles:service_agent_id(id, full_name, email, phone, business_name),
            verification_documents(*)
          `)
          .eq('id', verificationId)
          .single();
        
        if (!fetchError && updatedVerification) {
          setSelectedVerification(updatedVerification);
        }
      }
    } catch (err) {
      console.error('Error approving verification:', err);
      setError('Failed to approve verification');
    } finally {
      setProcessingId(null);
    }
  };
  
  const handleReject = async () => {
    if (!user || !selectedVerification) return;
    
    if (!rejectionReason.trim()) {
      setError('Please provide a reason for rejection');
      return;
    }
    
    try {
      setProcessingId(selectedVerification.id);
      
      const { data, error } = await supabase.rpc('reject_verification', {
        verification_id: selectedVerification.id,
        admin_id: user.id,
        rejection_reason: rejectionReason
      });
      
      if (error) throw error;
      
      // Close modal and reset form
      setShowRejectModal(false);
      setRejectionReason('');
      
      // Refresh the list
      fetchVerifications();
      
      // Update the selected verification
      const { data: updatedVerification, error: fetchError } = await supabase
        .from('service_agent_verification')
        .select(`
          *,
          profiles:service_agent_id(id, full_name, email, phone, business_name),
          verification_documents(*)
        `)
        .eq('id', selectedVerification.id)
        .single();
      
      if (!fetchError && updatedVerification) {
        setSelectedVerification(updatedVerification);
      }
    } catch (err) {
      console.error('Error rejecting verification:', err);
      setError('Failed to reject verification');
    } finally {
      setProcessingId(null);
    }
  };
  
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };
  
  const getStatusBadge = (status: VerificationStatus) => {
    switch (status) {
      case VerificationStatus.PENDING:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="w-4 h-4 mr-1" />
            Pending
          </span>
        );
      case VerificationStatus.IN_REVIEW:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <Search className="w-4 h-4 mr-1" />
            In Review
          </span>
        );
      case VerificationStatus.APPROVED:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-4 h-4 mr-1" />
            Approved
          </span>
        );
      case VerificationStatus.REJECTED:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="w-4 h-4 mr-1" />
            Rejected
          </span>
        );
      case VerificationStatus.EXPIRED:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <AlertTriangle className="w-4 h-4 mr-1" />
            Expired
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <Clock className="w-4 h-4 mr-1" />
            Unknown
          </span>
        );
    }
  };
  
  const getDocumentTypeLabel = (type: DocumentType) => {
    switch (type) {
      case DocumentType.IDENTITY:
        return 'Identity Document';
      case DocumentType.BUSINESS_LICENSE:
        return 'Business License';
      case DocumentType.INSURANCE:
        return 'Insurance';
      case DocumentType.CERTIFICATION:
        return 'Certification';
      case DocumentType.TAX_DOCUMENT:
        return 'Tax Document';
      case DocumentType.REFERENCE:
        return 'Reference';
      case DocumentType.PORTFOLIO:
        return 'Portfolio';
      case DocumentType.BACKGROUND_CHECK:
        return 'Background Check';
      default:
        return type;
    }
  };
  
  // Filter verifications based on search term
  const filteredVerifications = verifications.filter(v => {
    const matchesSearch = 
      (v.profiles?.full_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (v.profiles?.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (v.profiles?.business_name?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });
  
  if (loading && verifications.length === 0) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </AdminLayout>
    );
  }
  
  return (
    <AdminLayout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <h1 className="text-2xl font-semibold text-gray-900">Verification Management</h1>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="py-4">
            {error && (
              <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <XCircle className="h-5 w-5 text-red-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                <div>
                  <h2 className="text-lg leading-6 font-medium text-gray-900">
                    Verification Requests
                  </h2>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">
                    Review and process service agent verification requests.
                  </p>
                </div>
                <div className="flex space-x-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search by name or email..."
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                  <div className="relative">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <select
                      id="status-filter"
                      name="status-filter"
                      className="block w-full pl-10 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value as VerificationStatus | 'all')}
                    >
                      <option value="all">All Statuses</option>
                      <option value={VerificationStatus.PENDING}>Pending</option>
                      <option value={VerificationStatus.IN_REVIEW}>In Review</option>
                      <option value={VerificationStatus.APPROVED}>Approved</option>
                      <option value={VerificationStatus.REJECTED}>Rejected</option>
                      <option value={VerificationStatus.EXPIRED}>Expired</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col md:flex-row">
                <div className="w-full md:w-1/3 border-r border-gray-200">
                  <ul className="divide-y divide-gray-200 max-h-screen overflow-y-auto">
                    {filteredVerifications.length === 0 ? (
                      <li className="px-6 py-4 text-center text-gray-500">
                        No verification requests found
                      </li>
                    ) : (
                      filteredVerifications.map((verification) => (
                        <li
                          key={verification.id}
                          className={`px-6 py-4 cursor-pointer hover:bg-gray-50 ${
                            selectedVerification?.id === verification.id ? 'bg-blue-50' : ''
                          }`}
                          onClick={() => setSelectedVerification(verification)}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {verification.profiles?.full_name || 'Unknown'}
                              </p>
                              <p className="text-sm text-gray-500">
                                {verification.profiles?.business_name || 'No business name'}
                              </p>
                              <p className="text-xs text-gray-400">
                                Submitted: {formatDate(verification.created_at)}
                              </p>
                            </div>
                            <div>
                              {getStatusBadge(verification.verification_status)}
                            </div>
                          </div>
                        </li>
                      ))
                    )}
                  </ul>
                </div>
                
                <div className="w-full md:w-2/3">
                  {selectedVerification ? (
                    <div className="p-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">
                            {selectedVerification.profiles?.full_name || 'Unknown'}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {selectedVerification.profiles?.business_name || 'No business name'}
                          </p>
                          <div className="mt-2">
                            {getStatusBadge(selectedVerification.verification_status)}
                          </div>
                        </div>
                        <div className="flex space-x-3">
                          {(selectedVerification.verification_status === VerificationStatus.PENDING ||
                            selectedVerification.verification_status === VerificationStatus.IN_REVIEW) && (
                            <>
                              <button
                                type="button"
                                onClick={() => setShowRejectModal(true)}
                                disabled={processingId === selectedVerification.id}
                                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                              >
                                Reject
                              </button>
                              <button
                                type="button"
                                onClick={() => handleApprove(selectedVerification.id)}
                                disabled={processingId === selectedVerification.id}
                                className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                              >
                                {processingId === selectedVerification.id ? (
                                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                ) : null}
                                Approve
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                      
                      <div className="mt-6 border-t border-gray-200 pt-6">
                        <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                          <div className="sm:col-span-1">
                            <dt className="text-sm font-medium text-gray-500">Email</dt>
                            <dd className="mt-1 text-sm text-gray-900">
                              {selectedVerification.profiles?.email || 'N/A'}
                            </dd>
                          </div>
                          <div className="sm:col-span-1">
                            <dt className="text-sm font-medium text-gray-500">Phone</dt>
                            <dd className="mt-1 text-sm text-gray-900">
                              {selectedVerification.profiles?.phone || 'N/A'}
                            </dd>
                          </div>
                          <div className="sm:col-span-1">
                            <dt className="text-sm font-medium text-gray-500">Verification Level</dt>
                            <dd className="mt-1 text-sm text-gray-900 capitalize">
                              {selectedVerification.verification_level}
                            </dd>
                          </div>
                          <div className="sm:col-span-1">
                            <dt className="text-sm font-medium text-gray-500">Submitted Date</dt>
                            <dd className="mt-1 text-sm text-gray-900">
                              {formatDate(selectedVerification.created_at)}
                            </dd>
                          </div>
                          {selectedVerification.verification_date && (
                            <div className="sm:col-span-1">
                              <dt className="text-sm font-medium text-gray-500">Verification Date</dt>
                              <dd className="mt-1 text-sm text-gray-900">
                                {formatDate(selectedVerification.verification_date)}
                              </dd>
                            </div>
                          )}
                          {selectedVerification.expiration_date && (
                            <div className="sm:col-span-1">
                              <dt className="text-sm font-medium text-gray-500">Expiration Date</dt>
                              <dd className="mt-1 text-sm text-gray-900">
                                {formatDate(selectedVerification.expiration_date)}
                              </dd>
                            </div>
                          )}
                          {selectedVerification.rejection_reason && (
                            <div className="sm:col-span-2">
                              <dt className="text-sm font-medium text-gray-500">Rejection Reason</dt>
                              <dd className="mt-1 text-sm text-red-600">
                                {selectedVerification.rejection_reason}
                              </dd>
                            </div>
                          )}
                        </dl>
                      </div>
                      
                      <div className="mt-6 border-t border-gray-200 pt-6">
                        <h4 className="text-sm font-medium text-gray-500">Documents</h4>
                        {selectedVerification.verification_documents && selectedVerification.verification_documents.length > 0 ? (
                          <ul className="mt-3 grid grid-cols-1 gap-5 sm:grid-cols-2">
                            {selectedVerification.verification_documents.map((document) => (
                              <li key={document.id} className="col-span-1 bg-white rounded-lg shadow divide-y divide-gray-200">
                                <div className="w-full flex items-center justify-between p-6 space-x-6">
                                  <div className="flex-1 truncate">
                                    <div className="flex items-center space-x-3">
                                      <h3 className="text-sm font-medium text-gray-900 truncate">
                                        {document.document_name}
                                      </h3>
                                      <span className="flex-shrink-0 inline-block px-2 py-0.5 text-green-800 text-xs font-medium bg-green-100 rounded-full">
                                        {getDocumentTypeLabel(document.document_type)}
                                      </span>
                                    </div>
                                    <p className="mt-1 text-sm text-gray-500 truncate">
                                      Uploaded: {formatDate(document.uploaded_at)}
                                    </p>
                                  </div>
                                  <button
                                    type="button"
                                    className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    onClick={() => window.open(`/api/documents/${document.document_url}`, '_blank')}
                                  >
                                    View
                                  </button>
                                </div>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="mt-3 text-sm text-gray-500">No documents uploaded</p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 text-center text-gray-500">
                      <p>Select a verification request to view details</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Reject Modal */}
      {showRejectModal && selectedVerification && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <XCircle className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Reject Verification
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Please provide a reason for rejecting this verification request. This will be shared with the service agent.
                      </p>
                      <div className="mt-4">
                        <label htmlFor="rejection-reason" className="block text-sm font-medium text-gray-700">
                          Rejection Reason
                        </label>
                        <textarea
                          id="rejection-reason"
                          rows={4}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                          placeholder="Explain why this verification is being rejected"
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                        ></textarea>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={handleReject}
                  disabled={processingId === selectedVerification.id}
                >
                  {processingId === selectedVerification.id ? (
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : null}
                  Reject
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setShowRejectModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default NewVerificationManagement;
