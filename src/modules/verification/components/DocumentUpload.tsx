import React, { useState, useRef } from 'react';
import { DocumentType, VerificationDocument } from '../../../types/verification.types';
import { verificationService } from '../../../services/VerificationService';

interface DocumentUploadProps {
  requestId: string;
  documentType: DocumentType;
  onUploadSuccess: (document: VerificationDocument) => void;
  onUploadError: (error: string) => void;
}

/**
 * Component for uploading verification documents
 */
const DocumentUpload: React.FC<DocumentUploadProps> = ({
  requestId,
  documentType,
  onUploadSuccess,
  onUploadError
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    
    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      onUploadError('Invalid file type. Please upload a PDF or image file (JPEG, PNG).');
      return;
    }
    
    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      onUploadError('File is too large. Maximum size is 10MB.');
      return;
    }

    setIsUploading(true);
    setProgress(0);

    try {
      // Simulate progress (in a real app, you might get this from the upload API)
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + 10;
          if (newProgress >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return newProgress;
        });
      }, 300);

      // Upload the document
      const document = await verificationService.uploadDocument(
        requestId,
        file,
        documentType
      );

      clearInterval(progressInterval);
      setProgress(100);

      if (document) {
        onUploadSuccess(document);
      } else {
        onUploadError('Failed to upload document. Please try again.');
      }
    } catch (error) {
      console.error('Error uploading document:', error);
      onUploadError('An error occurred while uploading the document.');
    } finally {
      setIsUploading(false);
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="mt-1 flex items-center">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept=".pdf,.jpg,.jpeg,.png"
        disabled={isUploading}
      />
      
      <button
        type="button"
        onClick={handleButtonClick}
        disabled={isUploading}
        className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isUploading ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Uploading...
          </>
        ) : (
          <>
            <svg className="-ml-1 mr-2 h-4 w-4 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            Upload File
          </>
        )}
      </button>
      
      {isUploading && (
        <div className="ml-4 flex-1">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-in-out" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <span className="text-xs text-gray-500 mt-1">{progress}% uploaded</span>
        </div>
      )}
    </div>
  );
};

export default DocumentUpload;
