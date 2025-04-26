import React, { useState, useEffect } from 'react';
import { VerificationDocument, DocumentType, DOCUMENT_TYPE_INFO } from '../../types/verification.types';
import { verificationService } from '../../services/VerificationService';

interface DocumentViewerProps {
  document: VerificationDocument;
  onClose: () => void;
}

/**
 * Component to view a verification document
 */
const DocumentViewer: React.FC<DocumentViewerProps> = ({ document, onClose }) => {
  const [documentUrl, setDocumentUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDocumentUrl = async () => {
      try {
        setLoading(true);

        const url = await verificationService.getDocumentUrl(document.document_url);

        if (!url) {
          throw new Error('Failed to get document URL');
        }

        setDocumentUrl(url);
      } catch (err) {
        console.error('Error fetching document URL:', err);
        setError(err instanceof Error ? err.message : 'An error occurred while fetching the document');
      } finally {
        setLoading(false);
      }
    };

    fetchDocumentUrl();
  }, [document]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const getDocumentTypeLabel = (type: DocumentType) => {
    return DOCUMENT_TYPE_INFO[type]?.label || type;
  };

  return (
    <div className="fixed z-10 inset-0 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    {document.document_name}
                  </h3>
                  <button
                    type="button"
                    className="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    onClick={onClose}
                  >
                    <span className="sr-only">Close</span>
                    <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="mt-2 flex space-x-4 text-sm text-gray-500">
                  <div>
                    <span className="font-medium">Type:</span> {getDocumentTypeLabel(document.document_type)}
                  </div>
                  <div>
                    <span className="font-medium">Uploaded:</span> {formatDate(document.uploaded_at)}
                  </div>
                  {document.expiration_date && (
                    <div>
                      <span className="font-medium">Expires:</span> {formatDate(document.expiration_date)}
                    </div>
                  )}
                </div>
                <div className="mt-4 border border-gray-200 rounded-lg overflow-hidden">
                  {loading ? (
                    <div className="flex justify-center items-center h-96">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                  ) : error ? (
                    <div className="flex justify-center items-center h-96 bg-gray-50">
                      <div className="text-center">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <p className="mt-2 text-gray-600">{error}</p>
                      </div>
                    </div>
                  ) : documentUrl ? (
                    <div className="h-96">
                      {document.document_name.toLowerCase().endsWith('.pdf') ? (
                        <iframe
                          src={`${documentUrl}#toolbar=1&navpanes=1&scrollbar=1`}
                          className="w-full h-full"
                          title={document.document_name}
                        ></iframe>
                      ) : document.document_name.match(/\.(jpe?g|png|gif|bmp|webp|avif)$/i) ? (
                        <div className="flex justify-center items-center h-full bg-gray-100">
                          <img
                            src={documentUrl}
                            alt={document.document_name}
                            className="max-w-full max-h-full mx-auto object-contain"
                          />
                        </div>
                      ) : document.document_name.match(/\.(mp4|webm|ogg)$/i) ? (
                        <video
                          src={documentUrl}
                          controls
                          className="max-w-full max-h-full mx-auto"
                        >
                          Your browser does not support the video tag.
                        </video>
                      ) : document.document_name.match(/\.(mp3|wav)$/i) ? (
                        <div className="flex flex-col justify-center items-center h-full bg-gray-50">
                          <div className="text-center mb-4">
                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                            </svg>
                            <p className="mt-2 text-gray-600">Audio Document</p>
                          </div>
                          <audio
                            src={documentUrl}
                            controls
                            className="w-3/4"
                          >
                            Your browser does not support the audio element.
                          </audio>
                        </div>
                      ) : document.document_name.match(/\.(docx?|xlsx?|pptx?|txt|rtf|csv)$/i) ? (
                        <div className="flex flex-col justify-center items-center h-full bg-gray-50">
                          <div className="text-center">
                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <p className="mt-2 text-gray-600">Office document preview not available</p>
                            <p className="text-sm text-gray-500">Please download the file to view it</p>
                          </div>
                          <a
                            href={documentUrl}
                            download={document.document_name}
                            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            Download {document.document_name}
                          </a>
                        </div>
                      ) : (
                        <div className="flex justify-center items-center h-full bg-gray-50">
                          <div className="text-center">
                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <p className="mt-2 text-gray-600">Preview not available for this file type</p>
                            <p className="text-sm text-gray-500">Please download the file to view it</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex justify-center items-center h-96 bg-gray-50">
                      <div className="text-center">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="mt-2 text-gray-600">Document not found</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <a
              href={documentUrl || '#'}
              download={document.document_name}
              className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm ${!documentUrl ? 'opacity-50 cursor-not-allowed' : ''}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => !documentUrl && e.preventDefault()}
            >
              Download
            </a>
            <button
              type="button"
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentViewer;
