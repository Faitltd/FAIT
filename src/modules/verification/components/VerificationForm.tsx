import React, { useState, useEffect } from 'react';
import { 
  VerificationRequest, 
  VerificationDocument, 
  VerificationRequirement,
  DocumentType
} from '../../../types/verification.types';
import { verificationService } from '../../../services/VerificationService';
import DocumentUpload from './DocumentUpload';
import VerificationStatus from './VerificationStatus';

interface VerificationFormProps {
  userId: string;
  onRequestCreated?: (request: VerificationRequest) => void;
  onRequestSubmitted?: (request: VerificationRequest) => void;
}

/**
 * Form for service agent verification
 */
const VerificationForm: React.FC<VerificationFormProps> = ({
  userId,
  onRequestCreated,
  onRequestSubmitted
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [request, setRequest] = useState<VerificationRequest | null>(null);
  const [requirements, setRequirements] = useState<VerificationRequirement[]>([]);
  const [uploadedDocuments, setUploadedDocuments] = useState<Record<DocumentType, VerificationDocument | null>>({} as Record<DocumentType, VerificationDocument | null>);
  const [isCreating, setIsCreating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch the latest verification request and requirements
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Get requirements
        const requirementsData = await verificationService.getRequirements();
        setRequirements(requirementsData);
        
        // Get the latest request
        const latestRequest = await verificationService.getLatestRequest(userId);
        
        if (latestRequest) {
          setRequest(latestRequest);
          
          // Initialize uploaded documents
          const docs: Record<DocumentType, VerificationDocument | null> = {} as Record<DocumentType, VerificationDocument | null>;
          
          latestRequest.documents?.forEach(doc => {
            docs[doc.document_type] = doc;
          });
          
          setUploadedDocuments(docs);
        }
      } catch (err: any) {
        console.error('Error fetching verification data:', err);
        setError(err.message || 'Failed to load verification data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [userId]);

  // Create a new verification request
  const handleCreateRequest = async () => {
    setIsCreating(true);
    setError(null);
    
    try {
      const newRequest = await verificationService.createRequest(userId);
      
      if (newRequest) {
        setRequest(newRequest);
        if (onRequestCreated) {
          onRequestCreated(newRequest);
        }
      } else {
        setError('Failed to create verification request');
      }
    } catch (err: any) {
      console.error('Error creating verification request:', err);
      setError(err.message || 'Failed to create verification request');
    } finally {
      setIsCreating(false);
    }
  };

  // Submit the verification request for review
  const handleSubmitRequest = async () => {
    if (!request) return;
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const updatedRequest = await verificationService.submitRequest(request.id);
      
      if (updatedRequest) {
        setRequest(updatedRequest);
        if (onRequestSubmitted) {
          onRequestSubmitted(updatedRequest);
        }
      } else {
        setError('Failed to submit verification request');
      }
    } catch (err: any) {
      console.error('Error submitting verification request:', err);
      setError(err.message || 'Failed to submit verification request');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle successful document upload
  const handleUploadSuccess = (document: VerificationDocument) => {
    setUploadedDocuments(prev => ({
      ...prev,
      [document.document_type]: document
    }));
    
    // Update the request with the new document
    if (request) {
      const updatedDocuments = [...(request.documents || [])];
      const existingIndex = updatedDocuments.findIndex(
        doc => doc.document_type === document.document_type
      );
      
      if (existingIndex >= 0) {
        updatedDocuments[existingIndex] = document;
      } else {
        updatedDocuments.push(document);
      }
      
      setRequest({
        ...request,
        documents: updatedDocuments
      });
    }
  };

  // Handle document upload error
  const handleUploadError = (errorMessage: string) => {
    setError(errorMessage);
  };

  // Check if all required documents are uploaded
  const areRequiredDocumentsUploaded = () => {
    const requiredTypes = requirements
      .filter(req => req.is_required)
      .map(req => req.document_type);
    
    return requiredTypes.every(type => uploadedDocuments[type]);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // If there's no active request, show the create button
  if (!request || ['rejected', 'expired'].includes(request.status)) {
    return (
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 bg-gray-50">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Service Agent Verification</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Get verified to access all features and build trust with clients.
          </p>
        </div>
        
        {error && (
          <div className="px-4 py-3 bg-red-50 border-l-4 border-red-400 text-red-700 mb-4">
            <p>{error}</p>
          </div>
        )}
        
        <div className="px-4 py-5 sm:p-6">
          <div className="text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Not Verified</h3>
            <p className="mt-1 text-sm text-gray-500">
              Start the verification process to unlock all platform features.
            </p>
            <div className="mt-6">
              <button
                type="button"
                onClick={handleCreateRequest}
                disabled={isCreating}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreating ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Request...
                  </>
                ) : (
                  <>
                    <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    Start Verification Process
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If the request is already submitted, show the status
  if (['in_review', 'approved'].includes(request.status)) {
    return (
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 bg-gray-50 flex justify-between items-center">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">Service Agent Verification</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Verification status and details.
            </p>
          </div>
          <VerificationStatus status={request.status} />
        </div>
        
        <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
          <div className="text-center">
            {request.status === 'in_review' ? (
              <>
                <svg className="mx-auto h-12 w-12 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">Verification In Progress</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Your verification request is being reviewed by our team. This usually takes 1-2 business days.
                </p>
              </>
            ) : (
              <>
                <svg className="mx-auto h-12 w-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">Verification Complete</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Your account is now verified. You have full access to all platform features.
                </p>
              </>
            )}
          </div>
          
          <div className="mt-6 border-t border-gray-200 pt-6">
            <h4 className="text-sm font-medium text-gray-900">Submitted Documents</h4>
            <ul className="mt-2 divide-y divide-gray-200">
              {request.documents?.map(doc => (
                <li key={doc.id} className="py-3 flex justify-between items-center">
                  <div className="flex items-center">
                    <svg className="h-5 w-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="text-sm text-gray-900">
                      {requirements.find(r => r.document_type === doc.document_type)?.name || doc.document_type}
                    </span>
                  </div>
                  <a
                    href={doc.document_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-500"
                  >
                    View
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // Otherwise, show the document upload form
  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6 bg-gray-50 flex justify-between items-center">
        <div>
          <h3 className="text-lg leading-6 font-medium text-gray-900">Service Agent Verification</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Upload required documents to complete verification.
          </p>
        </div>
        <VerificationStatus status={request.status} />
      </div>
      
      {error && (
        <div className="px-4 py-3 bg-red-50 border-l-4 border-red-400 text-red-700 mb-4">
          <p>{error}</p>
        </div>
      )}
      
      <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
        <div className="space-y-6">
          <div>
            <h4 className="text-sm font-medium text-gray-900">Required Documents</h4>
            <p className="mt-1 text-sm text-gray-500">
              Please upload the following documents to verify your account.
            </p>
          </div>
          
          <div className="space-y-4">
            {requirements.map((requirement) => (
              <div key={requirement.document_type} className="border border-gray-200 rounded-md p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h5 className="text-sm font-medium text-gray-900">
                      {requirement.name}
                      {requirement.is_required && (
                        <span className="ml-1 text-red-500">*</span>
                      )}
                    </h5>
                    <p className="mt-1 text-xs text-gray-500">
                      {requirement.description}
                    </p>
                  </div>
                  {uploadedDocuments[requirement.document_type] && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <svg className="-ml-0.5 mr-1.5 h-2 w-2 text-green-400" fill="currentColor" viewBox="0 0 8 8">
                        <circle cx="4" cy="4" r="3" />
                      </svg>
                      Uploaded
                    </span>
                  )}
                </div>
                
                {uploadedDocuments[requirement.document_type] ? (
                  <div className="mt-2 flex items-center">
                    <a
                      href={uploadedDocuments[requirement.document_type]?.document_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-500 mr-4"
                    >
                      View Document
                    </a>
                    <DocumentUpload
                      requestId={request.id}
                      documentType={requirement.document_type}
                      onUploadSuccess={handleUploadSuccess}
                      onUploadError={handleUploadError}
                    />
                  </div>
                ) : (
                  <div className="mt-2">
                    <DocumentUpload
                      requestId={request.id}
                      documentType={requirement.document_type}
                      onUploadSuccess={handleUploadSuccess}
                      onUploadError={handleUploadError}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <div className="pt-5 border-t border-gray-200">
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleSubmitRequest}
                disabled={isSubmitting || !areRequiredDocumentsUploaded()}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </>
                ) : (
                  'Submit for Verification'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerificationForm;
