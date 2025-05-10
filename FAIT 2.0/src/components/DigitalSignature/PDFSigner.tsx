import React, { useState } from 'react';
import SignatureCapture from './SignatureCapture';

interface PDFSignerProps {
  documentUrl: string;
  onSignComplete: (signedDocumentUrl: string) => void;
  documentName: string;
}

const PDFSigner: React.FC<PDFSignerProps> = ({
  documentUrl,
  onSignComplete,
  documentName,
}) => {
  const [signature, setSignature] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSignatureCapture, setShowSignatureCapture] = useState(false);

  // Handle signature save
  const handleSignatureSave = (signatureData: string) => {
    setSignature(signatureData);
    setShowSignatureCapture(false);
  };

  // Apply signature to document
  const applySignature = async () => {
    if (!signature) {
      setError('Please create a signature first');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // In a real implementation, we would send the signature and document to a server
      // to apply the signature to the PDF. For now, we'll simulate this process.

      // Simulate API call to sign document
      await new Promise(resolve => setTimeout(resolve, 1500));

      // For demo purposes, we'll just return the original document URL
      // In a real implementation, this would be the URL to the signed document
      onSignComplete(documentUrl);
    } catch (err) {
      setError('Failed to sign document. Please try again.');
      console.error('Error signing document:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Sign Document: {documentName}</h2>

      {/* Document preview */}
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-2">Document Preview</h3>
        <div className="border border-gray-300 rounded-md p-2 h-64 overflow-auto">
          <iframe
            src={documentUrl}
            title="Document Preview"
            className="w-full h-full"
          />
        </div>
      </div>

      {/* Signature section */}
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-2">Your Signature</h3>

        {signature ? (
          <div className="border border-gray-300 rounded-md p-4 mb-4">
            <img
              src={signature}
              alt="Your signature"
              className="max-h-32 mx-auto"
            />
            <button
              type="button"
              onClick={() => setShowSignatureCapture(true)}
              className="mt-4 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
            >
              Change Signature
            </button>
          </div>
        ) : (
          <div className="text-center p-4 border border-dashed border-gray-300 rounded-md mb-4">
            {showSignatureCapture ? (
              <SignatureCapture onSave={handleSignatureSave} />
            ) : (
              <button
                type="button"
                onClick={() => setShowSignatureCapture(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Create Signature
              </button>
            )}
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex justify-end space-x-4">
        <button
          type="button"
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={applySignature}
          disabled={!signature || loading}
          className={`px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
            !signature || loading
              ? 'bg-primary-400 text-white cursor-not-allowed'
              : 'bg-primary-500 text-white hover:bg-primary-600'
          }`}
        >
          {loading ? 'Signing...' : 'Sign Document'}
        </button>
      </div>
    </div>
  );
};

export default PDFSigner;
