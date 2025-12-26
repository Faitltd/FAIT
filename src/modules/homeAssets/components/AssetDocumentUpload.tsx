import React, { useState } from 'react';
import type { AssetDocumentType } from '../types';

interface AssetDocumentUploadProps {
  onUpload: (docType: AssetDocumentType, file: File) => Promise<void>;
}

const documentTypes: AssetDocumentType[] = ['invoice', 'warranty_pdf', 'manual', 'photo', 'other'];

const AssetDocumentUpload: React.FC<AssetDocumentUploadProps> = ({ onUpload }) => {
  const [docType, setDocType] = useState<AssetDocumentType>('warranty_pdf');
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!file) return;

    setError(null);
    try {
      setIsUploading(true);
      await onUpload(docType, file);
      setFile(null);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Failed to upload document.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow">
      <div>
        <label className="block text-sm font-medium text-gray-700">Document type</label>
        <select
          value={docType}
          onChange={(event) => setDocType(event.target.value as AssetDocumentType)}
          className="mt-1 w-full rounded-md border-gray-300 shadow-sm"
        >
          {documentTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">File</label>
        <input
          type="file"
          onChange={(event) => setFile(event.target.files?.[0] || null)}
          className="mt-1 w-full"
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md"
        disabled={isUploading || !file}
      >
        {isUploading ? 'Uploading...' : 'Upload document'}
      </button>
    </form>
  );
};

export default AssetDocumentUpload;
