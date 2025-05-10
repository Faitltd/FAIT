import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { verificationService } from '../../services/VerificationService';
import {
  ServiceAgentVerification,
  VerificationDocument,
  VerificationStatus,
  DocumentType,
  VerificationLevel,
  VERIFICATION_REQUIREMENTS,
  DOCUMENT_TYPE_INFO
} from '../../types/verification.types';
import VerificationStatusComponent from '../../components/verification/VerificationStatus';
import VerificationRenewal from '../../components/verification/VerificationRenewal';
import DocumentList from '../../components/verification/DocumentList';
import DocumentUpload from '../../components/verification/DocumentUpload';
import DocumentViewer from '../../components/verification/DocumentViewer';

/**
 * Page for managing service agent verification
 */
const VerificationPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [verification, setVerification] = useState<ServiceAgentVerification | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadingDocumentType, setUploadingDocumentType] = useState<DocumentType | null>(null);
  const [viewingDocument, setViewingDocument] = useState<VerificationDocument | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchVerification = async () => {
      try {
        setLoading(true);

        // Get or create verification
        let verificationData = await verificationService.getVerification(user.id);

        if (!verificationData) {
          verificationData = await verificationService.createOrUpdateVerification(
            user.id,
            VerificationLevel.STANDARD
          );
        }

        setVerification(verificationData);
      } catch (err) {
        console.error('Error fetching verification:', err);
        setError('Failed to load verification data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchVerification();
  }, [user, navigate]);

  const handleDocumentUploadSuccess = async () => {
    setUploadingDocumentType(null);

    // Refresh verification data
    if (user) {
      const verificationData = await verificationService.getVerification(user.id);
      setVerification(verificationData);
    }
  };

  const handleDocumentDelete = async (documentId: string) => {
    // Refresh verification data
    if (user) {
      const verificationData = await verificationService.getVerification(user.id);
      setVerification(verificationData);
    }
  };

  const handleSubmitVerification = async () => {
    if (!verification) return;

    setSubmitting(true);
    setSubmitError(null);

    try {
      const success = await verificationService.submitVerification(verification.id);

      if (!success) {
        throw new Error('Failed to submit verification');
      }

      // Refresh verification data
      if (user) {
        const verificationData = await verificationService.getVerification(user.id);
        setVerification(verificationData);
      }
    } catch (err) {
      console.error('Error submitting verification:', err);
      setSubmitError(err instanceof Error ? err.message : 'An error occurred while submitting verification');
    } finally {
      setSubmitting(false);
    }
  };

  const getMissingDocumentTypes = (): DocumentType[] => {
    if (!verification) return [];

    const requiredDocumentTypes = VERIFICATION_REQUIREMENTS[verification.verification_level];

    const uploadedDocumentTypes = verification.verification_documents?.map(
      doc => doc.document_type
    ) || [];

    return requiredDocumentTypes.filter(type => !uploadedDocumentTypes.includes(type));
  };

  const canSubmitVerification = (): boolean => {
    if (!verification) return false;

    // Can only submit if status is pending
    if (verification.verification_status !== VerificationStatus.PENDING) {
      return false;
    }

    // Check if all required documents are uploaded
    return getMissingDocumentTypes().length === 0;
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
      <div className="bg-red-50 border-l-4 border-red-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Verification
          </h2>
        </div>
      </div>

      <div className="mt-8">
        <VerificationStatusComponent verification={verification} />
        {verification && (
          <VerificationRenewal
            verification={verification}
            onRenewalInitiated={() => {
              // Refresh verification data after renewal is initiated
              if (user) {
                verificationService.getVerification(user.id).then(data => {
                  setVerification(data);
                });
              }
            }}
          />
        )}
      </div>

      <div className="mt-8">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Verification Documents
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Upload the required documents to complete your verification.
              </p>
            </div>
            <div>
              <button
                type="button"
                onClick={() => setUploadingDocumentType(DocumentType.IDENTITY)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Upload Document
              </button>
            </div>
          </div>

          <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
            {verification?.verification_documents && verification.verification_documents.length > 0 ? (
              <DocumentList
                documents={verification.verification_documents}
                onDelete={handleDocumentDelete}
                onView={setViewingDocument}
              />
            ) : (
              <div className="text-center py-6">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No documents</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Get started by uploading your first document.
                </p>
                <div className="mt-6">
                  <button
                    type="button"
                    onClick={() => setUploadingDocumentType(DocumentType.IDENTITY)}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    Upload Document
                  </button>
                </div>
              </div>
            )}
          </div>

          {verification?.verification_status === VerificationStatus.PENDING && (
            <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Required Documents
                  </h3>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">
                    The following documents are required for verification:
                  </p>
                  <ul className="mt-2 list-disc pl-5 text-sm text-gray-600 space-y-1">
                    {VERIFICATION_REQUIREMENTS[verification.verification_level].map((type) => {
                      const isUploaded = verification.verification_documents?.some(
                        doc => doc.document_type === type
                      );

                      return (
                        <li key={type} className="flex items-center">
                          {isUploaded ? (
                            <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <svg className="h-5 w-5 text-red-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          )}
                          {DOCUMENT_TYPE_INFO[type].label}
                          {!isUploaded && (
                            <button
                              type="button"
                              onClick={() => setUploadingDocumentType(type)}
                              className="ml-2 inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                              Upload
                            </button>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
                <div>
                  <button
                    type="button"
                    onClick={handleSubmitVerification}
                    disabled={!canSubmitVerification() || submitting}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                  >
                    {submitting ? 'Submitting...' : 'Submit for Verification'}
                  </button>
                </div>
              </div>

              {submitError && (
                <div className="mt-4 bg-red-50 border-l-4 border-red-400 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700">{submitError}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Document Upload Modal */}
      {uploadingDocumentType && verification && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <DocumentUpload
                verificationId={verification.id}
                documentType={uploadingDocumentType}
                onSuccess={handleDocumentUploadSuccess}
                onCancel={() => setUploadingDocumentType(null)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Document Viewer Modal */}
      {viewingDocument && (
        <DocumentViewer
          document={viewingDocument}
          onClose={() => setViewingDocument(null)}
        />
      )}
    </div>
  );
};

export default VerificationPage;
