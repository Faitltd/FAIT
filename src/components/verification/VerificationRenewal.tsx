import React, { useState } from 'react';
import { ServiceAgentVerification, VerificationStatus } from '../../types/verification.types';
import { verificationService } from '../../services/VerificationService';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface VerificationRenewalProps {
  verification: ServiceAgentVerification;
  onRenewalInitiated: () => void;
}

/**
 * Component for handling verification renewal
 */
const VerificationRenewal: React.FC<VerificationRenewalProps> = ({
  verification,
  onRenewalInitiated
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // Check if verification is eligible for renewal
  const isEligibleForRenewal = () => {
    if (!verification) return false;
    
    // Only approved verifications can be renewed
    if (verification.verification_status !== VerificationStatus.APPROVED) {
      return false;
    }
    
    // Check if expiration date is within 30 days or already expired
    const now = new Date();
    const expirationDate = verification.expiration_date ? new Date(verification.expiration_date) : null;
    
    if (!expirationDate) return false;
    
    // Allow renewal if within 30 days of expiration or already expired
    return expirationDate <= new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  };
  
  // Get days until expiration
  const getDaysUntilExpiration = (): number | null => {
    if (!verification || !verification.expiration_date) return null;
    
    const now = new Date();
    const expirationDate = new Date(verification.expiration_date);
    const diffTime = expirationDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };
  
  // Handle renewal
  const handleRenewal = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      const result = await verificationService.renewVerification(verification.id);
      
      if (!result) {
        throw new Error('Failed to initiate verification renewal');
      }
      
      setSuccess(true);
      onRenewalInitiated();
    } catch (err) {
      console.error('Error initiating verification renewal:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while initiating verification renewal');
    } finally {
      setLoading(false);
    }
  };
  
  // If verification is not eligible for renewal, don't render anything
  if (!isEligibleForRenewal()) {
    return null;
  }
  
  const daysUntilExpiration = getDaysUntilExpiration();
  const isExpired = daysUntilExpiration !== null && daysUntilExpiration <= 0;
  
  return (
    <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-6">
      <div className="flex">
        <div className="flex-shrink-0">
          <AlertTriangle className="h-5 w-5 text-amber-400" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-amber-800">
            {isExpired
              ? 'Your verification has expired'
              : `Your verification will expire in ${daysUntilExpiration} days`}
          </h3>
          <div className="mt-2 text-sm text-amber-700">
            <p>
              {isExpired
                ? 'To continue using all features of the platform, please renew your verification.'
                : 'To maintain your verified status, please renew your verification before it expires.'}
            </p>
          </div>
          
          {error && (
            <div className="mt-2 bg-red-50 border-l-4 border-red-400 p-3">
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
          
          {success && (
            <div className="mt-2 bg-green-50 border-l-4 border-green-400 p-3">
              <div className="flex">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-700">
                    Verification renewal initiated successfully. Please upload any required documents.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <div className="mt-4">
            <button
              type="button"
              onClick={handleRenewal}
              disabled={loading || success}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : success ? (
                'Renewal Initiated'
              ) : (
                'Renew Verification'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerificationRenewal;
