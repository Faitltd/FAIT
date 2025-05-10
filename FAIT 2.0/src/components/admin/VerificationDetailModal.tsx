import React, { useState } from 'react';
import {
  X,
  FileText,
  Download,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Calendar,
  User,
  FileType,
  ExternalLink
} from 'lucide-react';
import { adminService } from '../../services/AdminService';
import { VerificationRequest, VerificationStatus } from '../../types/admin';
import { useAuth } from '../../contexts/AuthContext';

interface VerificationDetailModalProps {
  verification: VerificationRequest;
  onClose: () => void;
  onVerificationUpdated: () => void;
}

const VerificationDetailModal: React.FC<VerificationDetailModalProps> = ({
  verification,
  onClose,
  onVerificationUpdated
}) => {
  const { user } = useAuth();
  const [newStatus, setNewStatus] = useState<VerificationStatus>(verification.status as VerificationStatus);
  const [rejectionReason, setRejectionReason] = useState(verification.rejection_reason || '');
  const [expirationDate, setExpirationDate] = useState(
    verification.expiration_date
      ? new Date(verification.expiration_date).toISOString().split('T')[0]
      : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // Default to 1 year from now
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpdateStatus = async () => {
    if (!user) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const updatedVerification = await adminService.updateVerificationStatus(
        verification.id,
        newStatus,
        user.id,
        newStatus === 'rejected' ? rejectionReason : undefined,
        newStatus === 'approved' ? expirationDate : undefined
      );

      if (updatedVerification) {
        onVerificationUpdated();
      } else {
        setError('Failed to update verification status');
      }
    } catch (err) {
      console.error('Error updating verification status:', err);
      setError('An error occurred while updating verification status');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusIcon = (status: VerificationStatus) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'in_review':
        return <Clock className="h-5 w-5 text-blue-500" />;
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'expired':
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadgeColor = (status: VerificationStatus) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_review':
        return 'bg-primary-100 text-primary-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'expired':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDocumentIcon = (documentType: string) => {
    if (documentType.includes('id') || documentType.includes('license')) {
      return <User className="h-5 w-5 text-primary-500" />;
    } else if (documentType.includes('certificate')) {
      return <FileText className="h-5 w-5 text-green-500" />;
    } else {
      return <FileType className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Verification Request Details
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded flex items-start">
              <AlertCircle className="h-5 w-5 mr-2 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Request Information</h3>

              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-500">Verification Type</p>
                  <p className="text-base text-gray-900">{verification.verification_type}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <div className="flex items-center mt-1">
                    {getStatusIcon(verification.status as VerificationStatus)}
                    <span className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(verification.status as VerificationStatus)}`}>
                      {verification.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500">Submitted Date</p>
                  <p className="text-base text-gray-900">{new Date(verification.submitted_at).toLocaleString()}</p>
                </div>

                {verification.reviewed_at && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Reviewed Date</p>
                    <p className="text-base text-gray-900">{new Date(verification.reviewed_at).toLocaleString()}</p>
                  </div>
                )}

                {verification.expiration_date && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Expiration Date</p>
                    <p className="text-base text-gray-900">{new Date(verification.expiration_date).toLocaleDateString()}</p>
                  </div>
                )}

                {verification.rejection_reason && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Rejection Reason</p>
                    <p className="text-base text-gray-900">{verification.rejection_reason}</p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">User Information</h3>

              <div className="flex items-center mb-4">
                <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 overflow-hidden">
                  {verification.user?.avatar_url ? (
                    <img src={verification.user.avatar_url} alt={verification.user.full_name} className="h-full w-full object-cover" />
                  ) : (
                    verification.user?.full_name?.charAt(0).toUpperCase() || 'U'
                  )}
                </div>
                <div className="ml-4">
                  <p className="text-base font-medium text-gray-900">{verification.user?.full_name}</p>
                  <p className="text-sm text-gray-500">{verification.user?.email}</p>
                </div>
              </div>

              <div className="space-y-3">
                {verification.user?.phone && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Phone</p>
                    <p className="text-base text-gray-900">{verification.user.phone}</p>
                  </div>
                )}

                {verification.user?.company_name && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Company</p>
                    <p className="text-base text-gray-900">{verification.user.company_name}</p>
                  </div>
                )}

                {verification.user?.role && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Role</p>
                    <p className="text-base text-gray-900">{verification.user.role}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Documents</h3>

            {verification.documents && verification.documents.length > 0 ? (
              <div className="space-y-3">
                {verification.documents.map((document) => (
                  <div key={document.id} className="flex items-center p-3 border border-gray-200 rounded-md">
                    {getDocumentIcon(document.document_type)}
                    <div className="ml-3 flex-1">
                      <p className="text-sm font-medium text-gray-900">{document.file_name}</p>
                      <p className="text-xs text-gray-500">{document.document_type}</p>
                    </div>
                    <a
                      href={document.file_path}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 flex items-center"
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      View
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No documents attached</p>
            )}
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Update Status</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  id="status"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as VerificationStatus)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  disabled={isSubmitting}
                >
                  <option value="pending">Pending</option>
                  <option value="in_review">In Review</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="expired">Expired</option>
                </select>
              </div>

              {newStatus === 'approved' && (
                <div>
                  <label htmlFor="expiration_date" className="block text-sm font-medium text-gray-700 mb-1">
                    Expiration Date
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      id="expiration_date"
                      value={expirationDate}
                      onChange={(e) => setExpirationDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 pl-10"
                      disabled={isSubmitting}
                    />
                    <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  </div>
                </div>
              )}

              {newStatus === 'rejected' && (
                <div className="md:col-span-2">
                  <label htmlFor="rejection_reason" className="block text-sm font-medium text-gray-700 mb-1">
                    Rejection Reason
                  </label>
                  <textarea
                    id="rejection_reason"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    disabled={isSubmitting}
                    required={newStatus === 'rejected'}
                  ></textarea>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleUpdateStatus}
              disabled={isSubmitting || (newStatus === 'rejected' && !rejectionReason)}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isSubmitting ? 'Updating...' : 'Update Status'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerificationDetailModal;
