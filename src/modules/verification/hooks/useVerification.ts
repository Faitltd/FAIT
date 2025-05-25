import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { verificationService } from '../../../services/VerificationService';
import { 
  VerificationRequest, 
  VerificationStatus as VerificationStatusType 
} from '../../../types/verification.types';

/**
 * Hook for accessing verification functionality
 */
export const useVerification = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [verificationRequest, setVerificationRequest] = useState<VerificationRequest | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatusType>('unverified');

  // Fetch the latest verification request
  const fetchVerificationRequest = async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const request = await verificationService.getLatestRequest(user.id);
      setVerificationRequest(request);
      
      if (request) {
        setVerificationStatus(request.status as VerificationStatusType);
      } else {
        // If no request exists, check the user's profile for verification status
        setVerificationStatus(user.verification_status || 'unverified');
      }
    } catch (err: any) {
      console.error('Error fetching verification request:', err);
      setError(err.message || 'Failed to load verification data');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch verification data on mount and when user changes
  useEffect(() => {
    if (user) {
      fetchVerificationRequest();
    } else {
      setIsLoading(false);
      setVerificationRequest(null);
      setVerificationStatus('unverified');
    }
  }, [user]);

  // Create a new verification request
  const createVerificationRequest = async () => {
    if (!user) {
      setError('You must be logged in to create a verification request');
      return null;
    }
    
    setError(null);
    
    try {
      const request = await verificationService.createRequest(user.id);
      setVerificationRequest(request);
      
      if (request) {
        setVerificationStatus('pending');
      }
      
      return request;
    } catch (err: any) {
      console.error('Error creating verification request:', err);
      setError(err.message || 'Failed to create verification request');
      return null;
    }
  };

  // Submit a verification request for review
  const submitVerificationRequest = async () => {
    if (!verificationRequest) {
      setError('No verification request to submit');
      return null;
    }
    
    setError(null);
    
    try {
      const request = await verificationService.submitRequest(verificationRequest.id);
      setVerificationRequest(request);
      
      if (request) {
        setVerificationStatus('in_review');
      }
      
      return request;
    } catch (err: any) {
      console.error('Error submitting verification request:', err);
      setError(err.message || 'Failed to submit verification request');
      return null;
    }
  };

  // Refresh verification data
  const refreshVerification = () => {
    fetchVerificationRequest();
  };

  return {
    isLoading,
    error,
    verificationRequest,
    verificationStatus,
    createVerificationRequest,
    submitVerificationRequest,
    refreshVerification
  };
};
