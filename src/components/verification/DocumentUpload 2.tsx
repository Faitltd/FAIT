import React, { useState } from 'react';
import { 
  DocumentType, 
  DocumentTypeInfo, 
  DOCUMENT_TYPE_INFO 
} from '../../types/verification.types';
import { verificationService } from '../../services/VerificationService';

interface DocumentUploadProps {
  verificationId: string;
  documentType: DocumentType;
  onSuccess: () => void;
  onCancel: () => void;
}

/**
 * Component for uploading verification documents
 */
const DocumentUpload: React.FC<DocumentUploadProps> = ({
  verificationId,
  documentType,
  onSuccess,
  onCancel
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [documentName, setDocumentName] = useState('');
  const [documentNumber, setDocumentNumber] = useState('');
  const [issuingAuthority, setIssuingAuthority] = useState('');
  const [expirationDate, setExpirationDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Get document type info
  const documentInfo: DocumentTypeInfo = DOCUMENT_TYPE_INFO[documentType];
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    
    // Check file type
    const fileExt = selectedFile.name.split('.').pop()?.toLowerCase();
    const acceptedExts = documentInfo.acceptedFormats.map(ext => ext.replace('.', ''));
    
    if (fileExt && acceptedExts.includes(fileExt)) {
      setFile(selectedFile);
      
      // Set document name if not already set
      if (!documentName) {
        setDocumentName(selectedFile.name.split('.')[0]);
      }
    } else {
      setError(`Invalid file type. Accepted formats: ${documentInfo.acceptedFormats.join(', ')}`);
      e.target.value = '';
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      setError('Please select a file to upload');
      return;
    }
    
    if (!documentName) {
      setError('Please enter a document name');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await verificationService.uploadDocument(
        verificationId,
        file,
        documentType,
        documentName,
        {
          documentNumber: documentNumber || undefined,
          issuingAuthority: issuingAuthority || undefined,
          expirationDate: expirationDate || undefined
        }
      );
      
      if (!result) {
        throw new Error('Failed to upload document');
      }
      
      onSuccess();
    } catch (err) {
      console.error('Error uploading document:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while uploading the document');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="bg-white shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg font-medium leading-6 text-gray-900">
          Upload {documentInfo.label}
        </h3>
        <div className="mt-2 max-w-xl text-sm text-gray-500">
          <p>{documentInfo.description}</p>
        </div>
        
        {error && (
          <div className="mt-4 bg-red-50 border-l-4 border-red-400 p-4">
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
        )}
        
        <form className="mt-5 sm:flex sm:items-center" onSubmit={handleSubmit}>
          <div className="w-full space-y-6">
            <div>
              <label htmlFor="document-name" className="block text-sm font-medium text-gray-700">
                Document Name
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="document-name"
                  id="document-name"
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  value={documentName}
                  onChange={(e) => setDocumentName(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="document-number" className="block text-sm font-medium text-gray-700">
                Document Number (optional)
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="document-number"
                  id="document-number"
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  value={documentNumber}
                  onChange={(e) => setDocumentNumber(e.target.value)}
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="issuing-authority" className="block text-sm font-medium text-gray-700">
                Issuing Authority (optional)
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="issuing-authority"
                  id="issuing-authority"
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  value={issuingAuthority}
                  onChange={(e) => setIssuingAuthority(e.target.value)}
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="expiration-date" className="block text-sm font-medium text-gray-700">
                Expiration Date (optional)
              </label>
              <div className="mt-1">
                <input
                  type="date"
                  name="expiration-date"
                  id="expiration-date"
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  value={expirationDate}
                  onChange={(e) => setExpirationDate(e.target.value)}
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Document File
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                    aria-hidden="true"
                  >
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                    >
                      <span>Upload a file</span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        className="sr-only"
                        accept={documentInfo.acceptedFormats.join(',')}
                        onChange={handleFileChange}
                        required
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    {documentInfo.acceptedFormats.join(', ')} up to 10MB
                  </p>
                  {file && (
                    <p className="text-sm text-green-600">
                      Selected: {file.name}
                    </p>
                  )}
                </div>
              </div>
            </div>
            
            <div className="mt-5 sm:mt-6 sm:flex sm:flex-row-reverse">
              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
              >
                {loading ? 'Uploading...' : 'Upload Document'}
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
        
        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-900">Examples</h4>
          <ul className="mt-2 text-sm text-gray-500 list-disc pl-5 space-y-1">
            {documentInfo.examples.map((example, index) => (
              <li key={index}>{example}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DocumentUpload;
