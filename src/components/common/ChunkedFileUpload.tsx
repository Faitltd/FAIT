import React, { useState, useRef, useCallback } from 'react';
import { chunkedFileUpload } from '../../utils/chunkedApiRequest';
import { Upload, X, FileText, CheckCircle, AlertCircle } from 'lucide-react';

interface ChunkedFileUploadProps {
  /** Upload endpoint URL */
  url: string;
  /** Maximum file size in bytes */
  maxFileSize?: number;
  /** Maximum chunk size in bytes */
  maxChunkSize?: number;
  /** Allowed file types */
  accept?: string;
  /** Field name for the file */
  fieldName?: string;
  /** Additional metadata to send with the upload */
  metadata?: Record<string, any>;
  /** Callback when upload is complete */
  onComplete?: (response: any) => void;
  /** Callback when upload fails */
  onError?: (error: Error) => void;
  /** Custom class name */
  className?: string;
  /** Button label */
  buttonLabel?: string;
  /** Drag and drop label */
  dragDropLabel?: string;
}

/**
 * Component for uploading large files in chunks
 */
const ChunkedFileUpload: React.FC<ChunkedFileUploadProps> = ({
  url,
  maxFileSize = 1024 * 1024 * 100, // 100MB
  maxChunkSize = 1024 * 1024 * 5, // 5MB
  accept,
  fieldName = 'file',
  metadata = {},
  onComplete,
  onError,
  className = '',
  buttonLabel = 'Select File',
  dragDropLabel = 'or drag and drop file here',
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropAreaRef = useRef<HTMLDivElement>(null);

  // Handle file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      validateAndSetFile(selectedFile);
    }
  };

  // Validate file and set it
  const validateAndSetFile = (selectedFile: File) => {
    // Reset states
    setError(null);
    setSuccess(false);
    setProgress(0);

    // Check file size
    if (selectedFile.size > maxFileSize) {
      setError(`File is too large. Maximum size is ${formatFileSize(maxFileSize)}.`);
      return;
    }

    // Check file type if accept is specified
    if (accept) {
      const acceptedTypes = accept.split(',').map(type => type.trim());
      const fileType = selectedFile.type;
      const fileExtension = `.${selectedFile.name.split('.').pop()}`;

      const isAccepted = acceptedTypes.some(type => {
        if (type.startsWith('.')) {
          // Check extension
          return fileExtension.toLowerCase() === type.toLowerCase();
        } else if (type.includes('*')) {
          // Check MIME type pattern (e.g., image/*)
          const [category, subtype] = type.split('/');
          const [fileCategory, fileSubtype] = fileType.split('/');
          return category === fileCategory && (subtype === '*' || subtype === fileSubtype);
        } else {
          // Check exact MIME type
          return type === fileType;
        }
      });

      if (!isAccepted) {
        setError(`File type not accepted. Allowed types: ${accept}`);
        return;
      }
    }

    setFile(selectedFile);
  };

  // Handle drag and drop
  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (dropAreaRef.current) {
      dropAreaRef.current.classList.add('border-blue-500', 'bg-blue-50');
    }
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (dropAreaRef.current) {
      dropAreaRef.current.classList.remove('border-blue-500', 'bg-blue-50');
    }
  }, []);

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    
    if (dropAreaRef.current) {
      dropAreaRef.current.classList.remove('border-blue-500', 'bg-blue-50');
    }
    
    const droppedFile = event.dataTransfer.files[0];
    if (droppedFile) {
      validateAndSetFile(droppedFile);
    }
  }, []);

  // Start upload
  const startUpload = async () => {
    if (!file) return;

    setUploading(true);
    setProgress(0);
    setError(null);
    setSuccess(false);

    try {
      const response = await chunkedFileUpload(url, file, {
        maxChunkSize,
        fieldName,
        metadata,
        onProgress: (uploaded, total) => {
          const percentage = Math.round((uploaded / total) * 100);
          setProgress(percentage);
        },
      });

      setSuccess(true);
      if (onComplete) {
        onComplete(response);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      setError(errorMessage);
      if (onError) {
        onError(err instanceof Error ? err : new Error(errorMessage));
      }
    } finally {
      setUploading(false);
    }
  };

  // Reset the component
  const resetUpload = () => {
    setFile(null);
    setProgress(0);
    setError(null);
    setSuccess(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Format file size for display
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`w-full ${className}`}>
      {!file ? (
        <div
          ref={dropAreaRef}
          className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <div className="mt-4">
            <button
              type="button"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onClick={() => fileInputRef.current?.click()}
            >
              {buttonLabel}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleFileChange}
              accept={accept}
            />
            <p className="mt-2 text-sm text-gray-500">{dragDropLabel}</p>
          </div>
        </div>
      ) : (
        <div className="border rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-blue-500 mr-3" />
              <div>
                <p className="font-medium">{file.name}</p>
                <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
              </div>
            </div>
            <button
              type="button"
              className="p-1 text-gray-400 hover:text-gray-600"
              onClick={resetUpload}
              disabled={uploading}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {!uploading && !success && !error && (
            <button
              type="button"
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onClick={startUpload}
            >
              Upload
            </button>
          )}

          {uploading && (
            <div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                <div
                  className="bg-blue-600 h-2.5 rounded-full"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 text-center">
                Uploading... {progress}%
              </p>
            </div>
          )}

          {success && (
            <div className="flex items-center text-green-600">
              <CheckCircle className="h-5 w-5 mr-2" />
              <span>Upload complete!</span>
            </div>
          )}

          {error && (
            <div className="flex items-center text-red-600">
              <AlertCircle className="h-5 w-5 mr-2" />
              <span>{error}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ChunkedFileUpload;
