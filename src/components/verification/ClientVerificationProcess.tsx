import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

// Verification steps
import IdentityVerificationStep from './steps/IdentityVerificationStep';
import AddressVerificationStep from './steps/AddressVerificationStep';
import PhoneVerificationStep from './steps/PhoneVerificationStep';
import VerificationReviewStep from './steps/VerificationReviewStep';

type VerificationStatus = 'not_started' | 'in_progress' | 'pending_review' | 'approved' | 'rejected' | 'expired';

interface VerificationData {
  id_document?: File | null;
  id_document_url?: string;
  address_document?: File | null;
  address_document_url?: string;
  phone_number?: string;
  phone_verified?: boolean;
  verification_code?: string;
}

const ClientVerificationProcess: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>('not_started');
  const [verificationData, setVerificationData] = useState<VerificationData>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  useEffect(() => {
    const fetchVerificationStatus = async () => {
      if (!user) return;
      
      try {
        // Check if user has an existing verification record
        const { data, error } = await supabase
          .from('client_verifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
          
        if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned" error
          throw error;
        }
        
        if (data) {
          setVerificationStatus(data.status as VerificationStatus);
          
          // If verification is in progress, set the current step
          if (data.status === 'in_progress') {
            // Determine which step to show based on what's been completed
            if (data.id_document_url && data.address_document_url && data.phone_verified) {
              setCurrentStep(4); // Review step
            } else if (data.id_document_url && data.address_document_url) {
              setCurrentStep(3); // Phone verification step
            } else if (data.id_document_url) {
              setCurrentStep(2); // Address verification step
            } else {
              setCurrentStep(1); // Identity verification step
            }
            
            // Set verification data from the database
            setVerificationData({
              id_document_url: data.id_document_url,
              address_document_url: data.address_document_url,
              phone_number: data.phone_number,
              phone_verified: data.phone_verified
            });
          }
        } else {
          setVerificationStatus('not_started');
        }
      } catch (err) {
        console.error('Error fetching verification status:', err);
        setError('Failed to load verification status');
      } finally {
        setLoading(false);
      }
    };
    
    fetchVerificationStatus();
  }, [user]);
  
  const handleStartVerification = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Create a new verification record
      const { error } = await supabase
        .from('client_verifications')
        .insert({
          user_id: user.id,
          status: 'in_progress',
          created_at: new Date().toISOString()
        });
        
      if (error) throw error;
      
      setVerificationStatus('in_progress');
      setCurrentStep(1);
    } catch (err) {
      console.error('Error starting verification:', err);
      setError('Failed to start verification process');
    } finally {
      setLoading(false);
    }
  };
  
  const handleUploadDocument = async (file: File, type: 'id' | 'address') => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Upload file to storage
      const fileName = `${user.id}/${type}_document_${Date.now()}.${file.name.split('.').pop()}`;
      const { error: uploadError } = await supabase.storage
        .from('verification_documents')
        .upload(fileName, file);
        
      if (uploadError) throw uploadError;
      
      // Get public URL
      const { data: publicUrl } = supabase.storage
        .from('verification_documents')
        .getPublicUrl(fileName);
        
      // Update verification record
      const updateData = type === 'id' 
        ? { id_document_url: publicUrl.publicUrl }
        : { address_document_url: publicUrl.publicUrl };
        
      const { error: updateError } = await supabase
        .from('client_verifications')
        .update(updateData)
        .eq('user_id', user.id)
        .eq('status', 'in_progress');
        
      if (updateError) throw updateError;
      
      // Update local state
      setVerificationData(prev => ({
        ...prev,
        ...(type === 'id' 
          ? { id_document: file, id_document_url: publicUrl.publicUrl }
          : { address_document: file, address_document_url: publicUrl.publicUrl })
      }));
      
      // Move to next step
      if (type === 'id') {
        setCurrentStep(2);
      } else if (type === 'address') {
        setCurrentStep(3);
      }
    } catch (err) {
      console.error(`Error uploading ${type} document:`, err);
      setError(`Failed to upload ${type === 'id' ? 'identity' : 'address'} document`);
    } finally {
      setLoading(false);
    }
  };
  
  const handleVerifyPhone = async (phoneNumber: string, verificationCode: string) => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // In a real implementation, you would verify the code with a service like Twilio
      // For now, we'll simulate a successful verification
      
      // Update verification record
      const { error } = await supabase
        .from('client_verifications')
        .update({
          phone_number: phoneNumber,
          phone_verified: true
        })
        .eq('user_id', user.id)
        .eq('status', 'in_progress');
        
      if (error) throw error;
      
      // Update local state
      setVerificationData(prev => ({
        ...prev,
        phone_number: phoneNumber,
        phone_verified: true
      }));
      
      // Move to next step
      setCurrentStep(4);
    } catch (err) {
      console.error('Error verifying phone:', err);
      setError('Failed to verify phone number');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSubmitVerification = async () => {
    if (!user) return;
    
    try {
      setSubmitting(true);
      
      // Update verification record
      const { error } = await supabase
        .from('client_verifications')
        .update({
          status: 'pending_review',
          submitted_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .eq('status', 'in_progress');
        
      if (error) throw error;
      
      // Update local state
      setVerificationStatus('pending_review');
      
      // Show success message
      alert('Your verification has been submitted for review. You will be notified once it has been processed.');
      
      // Redirect to dashboard
      navigate('/dashboard');
    } catch (err) {
      console.error('Error submitting verification:', err);
      setError('Failed to submit verification for review');
    } finally {
      setSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4">
        <p className="text-red-700">{error}</p>
      </div>
    );
  }
  
  // Show different UI based on verification status
  if (verificationStatus === 'not_started') {
    return (
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6">Client Verification</h1>
        <p className="text-gray-600 mb-6">
          Complete the verification process to unlock all features of the platform and build trust with service providers.
        </p>
        
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                Verification helps ensure the safety and security of our platform. You'll need to provide:
              </p>
              <ul className="mt-2 text-sm text-blue-700 list-disc list-inside">
                <li>A valid government-issued ID</li>
                <li>Proof of address (utility bill, bank statement, etc.)</li>
                <li>A verified phone number</li>
              </ul>
            </div>
          </div>
        </div>
        
        <button
          type="button"
          data-cy="start-verification"
          onClick={handleStartVerification}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Start Verification Process
        </button>
      </div>
    );
  }
  
  if (verificationStatus === 'pending_review') {
    return (
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-md">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100">
            <svg className="h-6 w-6 text-yellow-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="mt-3 text-lg font-medium text-gray-900">Verification In Review</h1>
          <p className="mt-2 text-sm text-gray-500">
            Your verification documents are currently being reviewed by our team. This process typically takes 1-2 business days.
          </p>
          <div className="mt-6">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  if (verificationStatus === 'approved') {
    return (
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-md">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
            <svg className="h-6 w-6 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="mt-3 text-lg font-medium text-gray-900">Verification Approved</h1>
          <p className="mt-2 text-sm text-gray-500">
            Congratulations! Your account has been verified. You now have full access to all platform features.
          </p>
          <div className="mt-6">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  if (verificationStatus === 'rejected') {
    return (
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-md">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="mt-3 text-lg font-medium text-gray-900">Verification Rejected</h1>
          <p className="mt-2 text-sm text-gray-500">
            Unfortunately, your verification was not approved. This could be due to unclear documents or information that couldn't be verified.
          </p>
          <div className="mt-6">
            <button
              type="button"
              onClick={handleStartVerification}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  if (verificationStatus === 'expired') {
    return (
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-md">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100">
            <svg className="h-6 w-6 text-yellow-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="mt-3 text-lg font-medium text-gray-900">Verification Expired</h1>
          <p className="mt-2 text-sm text-gray-500">
            Your verification has expired. Please complete the verification process again to maintain full access to the platform.
          </p>
          <div className="mt-6">
            <button
              type="button"
              onClick={handleStartVerification}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Renew Verification
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // Verification in progress - show the current step
  return (
    <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">Client Verification</h1>
      
      {/* Progress indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {[1, 2, 3, 4].map(step => (
            <div 
              key={step} 
              className={`flex items-center justify-center w-10 h-10 rounded-full ${
                currentStep >= step ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}
            >
              {step}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2 text-sm">
          <span>Identity</span>
          <span>Address</span>
          <span>Phone</span>
          <span>Review</span>
        </div>
      </div>
      
      {/* Step content */}
      <div className="mb-6">
        {currentStep === 1 && (
          <IdentityVerificationStep 
            onUpload={(file) => handleUploadDocument(file, 'id')}
            loading={loading}
          />
        )}
        
        {currentStep === 2 && (
          <AddressVerificationStep 
            onUpload={(file) => handleUploadDocument(file, 'address')}
            loading={loading}
          />
        )}
        
        {currentStep === 3 && (
          <PhoneVerificationStep 
            onVerify={handleVerifyPhone}
            loading={loading}
          />
        )}
        
        {currentStep === 4 && (
          <VerificationReviewStep 
            verificationData={verificationData}
            onSubmit={handleSubmitVerification}
            loading={submitting}
          />
        )}
      </div>
    </div>
  );
};

export default ClientVerificationProcess;
