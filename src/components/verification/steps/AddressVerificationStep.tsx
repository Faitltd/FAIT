import React, { useState } from 'react';

interface AddressVerificationStepProps {
  onUpload: (file: File) => void;
  loading: boolean;
}

const AddressVerificationStep: React.FC<AddressVerificationStepProps> = ({ onUpload, loading }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        setError('Please upload a valid file type (JPEG, PNG, or PDF)');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }
      
      setSelectedFile(file);
      setError(null);
    }
  };
  
  const handleSubmit = () => {
    if (!selectedFile) {
      setError('Please select a file to upload');
      return;
    }
    
    onUpload(selectedFile);
  };
  
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Address Verification</h2>
      <p className="text-gray-600 mb-6">
        Please upload a document that verifies your current address. This can be a utility bill, bank statement, or official mail received within the last 3 months.
      </p>
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <p className="text-red-700">{error}</p>
        </div>
      )}
      
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Upload Address Document
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
                htmlFor="address-upload"
                className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
              >
                <span>Upload a file</span>
                <input
                  id="address-upload"
                  name="address-upload"
                  type="file"
                  data-cy="verify-address"
                  className="sr-only"
                  accept="image/jpeg,image/png,image/jpg,application/pdf"
                  onChange={handleFileChange}
                />
              </label>
              <p className="pl-1">or drag and drop</p>
            </div>
            <p className="text-xs text-gray-500">
              PNG, JPG, JPEG, PDF up to 5MB
            </p>
          </div>
        </div>
        {selectedFile && (
          <p className="mt-2 text-sm text-gray-500">
            Selected file: {selectedFile.name}
          </p>
        )}
      </div>
      
      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-md">
        <h3 className="text-sm font-medium text-blue-800">Acceptable Documents</h3>
        <ul className="mt-2 text-sm text-blue-700 list-disc list-inside">
          <li>Utility bill (electricity, water, gas)</li>
          <li>Bank or credit card statement</li>
          <li>Lease or mortgage statement</li>
          <li>Tax document or government correspondence</li>
          <li>Insurance statement</li>
        </ul>
        <p className="mt-2 text-sm text-blue-700">
          Document must be dated within the last 3 months and clearly show your name and address.
        </p>
      </div>
      
      <div className="flex justify-end mt-6">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!selectedFile || loading}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {loading ? 'Uploading...' : 'Continue'}
        </button>
      </div>
    </div>
  );
};

export default AddressVerificationStep;
