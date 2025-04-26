import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ServiceAgentVerification, 
  VerificationStatus as VerificationStatusEnum 
} from '../../types/verification.types';

interface VerificationStatusProps {
  verification: ServiceAgentVerification | null;
  className?: string;
}

/**
 * Component to display verification status
 */
const VerificationStatus: React.FC<VerificationStatusProps> = ({ 
  verification, 
  className = '' 
}) => {
  if (!verification) {
    return (
      <div className={`bg-white shadow overflow-hidden sm:rounded-lg ${className}`}>
        <div className="px-4 py-5 sm:p-6">
          <div className="text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Not Verified</h3>
            <p className="mt-1 text-sm text-gray-500">
              You haven't started the verification process yet.
            </p>
            <div className="mt-6">
              <Link
                to="/verification/start"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Start Verification
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };
  
  const getStatusIcon = () => {
    switch (verification.verification_status) {
      case VerificationStatusEnum.PENDING:
        return (
          <svg className="h-8 w-8 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case VerificationStatusEnum.IN_REVIEW:
        return (
          <svg className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        );
      case VerificationStatusEnum.APPROVED:
        return (
          <svg className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        );
      case VerificationStatusEnum.REJECTED:
        return (
          <svg className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case VerificationStatusEnum.EXPIRED:
        return (
          <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return (
          <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };
  
  const getStatusTitle = () => {
    switch (verification.verification_status) {
      case VerificationStatusEnum.PENDING:
        return 'Verification Pending';
      case VerificationStatusEnum.IN_REVIEW:
        return 'Under Review';
      case VerificationStatusEnum.APPROVED:
        return 'Verified';
      case VerificationStatusEnum.REJECTED:
        return 'Verification Rejected';
      case VerificationStatusEnum.EXPIRED:
        return 'Verification Expired';
      default:
        return 'Unknown Status';
    }
  };
  
  const getStatusDescription = () => {
    switch (verification.verification_status) {
      case VerificationStatusEnum.PENDING:
        return 'Your verification request has been submitted and is waiting for review.';
      case VerificationStatusEnum.IN_REVIEW:
        return 'Our team is currently reviewing your verification documents.';
      case VerificationStatusEnum.APPROVED:
        return `Your account has been verified. Valid until ${formatDate(verification.expiration_date)}.`;
      case VerificationStatusEnum.REJECTED:
        return verification.rejection_reason || 'Your verification request was rejected. Please see details below.';
      case VerificationStatusEnum.EXPIRED:
        return 'Your verification has expired. Please renew to maintain your verified status.';
      default:
        return 'Please contact support for more information about your verification status.';
    }
  };
  
  const getActionButton = () => {
    switch (verification.verification_status) {
      case VerificationStatusEnum.PENDING:
      case VerificationStatusEnum.IN_REVIEW:
        return (
          <Link
            to="/verification/status"
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Check Status
          </Link>
        );
      case VerificationStatusEnum.REJECTED:
        return (
          <Link
            to="/verification/resubmit"
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Resubmit Verification
          </Link>
        );
      case VerificationStatusEnum.EXPIRED:
        return (
          <Link
            to="/verification/renew"
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Renew Verification
          </Link>
        );
      case VerificationStatusEnum.APPROVED:
        // Check if expiration is within 30 days
        const expirationDate = verification.expiration_date ? new Date(verification.expiration_date) : null;
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
        
        if (expirationDate && expirationDate <= thirtyDaysFromNow) {
          return (
            <Link
              to="/verification/renew"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
            >
              Renew Soon
            </Link>
          );
        }
        
        return (
          <Link
            to="/verification/details"
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            View Details
          </Link>
        );
      default:
        return (
          <Link
            to="/verification/start"
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Start Verification
          </Link>
        );
    }
  };
  
  return (
    <div className={`bg-white shadow overflow-hidden sm:rounded-lg ${className}`}>
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            {getStatusIcon()}
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-medium text-gray-900">{getStatusTitle()}</h3>
            <p className="mt-1 text-sm text-gray-500">
              {getStatusDescription()}
            </p>
            <div className="mt-4">
              {getActionButton()}
            </div>
          </div>
        </div>
        
        {verification.verification_status === VerificationStatusEnum.APPROVED && (
          <div className="mt-6 border-t border-gray-200 pt-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div className="ml-3">
                <h4 className="text-sm font-medium text-gray-900">Verification Benefits</h4>
                <ul className="mt-2 text-sm text-gray-500 list-disc pl-5 space-y-1">
                  <li>Higher visibility in search results</li>
                  <li>Verified badge on your profile and listings</li>
                  <li>Access to premium features and opportunities</li>
                  <li>Increased trust from potential clients</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerificationStatus;
