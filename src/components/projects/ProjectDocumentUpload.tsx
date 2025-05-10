import React, { useState, useRef } from 'react';
import { ProjectDocument } from '../../types/project';
import { projectService } from '../../services/projectService';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { 
  Card, 
  CardHeader, 
  CardContent, 
  CardFooter,
  Heading, 
  Input,
  Select,
  Button
} from '../ui';

interface ProjectDocumentUploadProps {
  projectId: string;
  onDocumentUploaded?: (document: ProjectDocument) => void;
  onCancel?: () => void;
  className?: string;
}

const ProjectDocumentUpload: React.FC<ProjectDocumentUploadProps> = ({ 
  projectId,
  onDocumentUploaded,
  onCancel,
  className = '' 
}) => {
  const [name, setName] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState('contract');
  
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user, hasPermission } = useAuth();
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    
    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (selectedFile.size > maxSize) {
      setError('File is too large. Maximum size is 10MB.');
      e.target.value = '';
      return;
    }
    
    setFile(selectedFile);
    
    // Set document name if not already set
    if (!name) {
      setName(selectedFile.name.split('.')[0]);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError('You must be logged in to upload a document');
      return;
    }
    
    if (!file) {
      setError('Please select a file to upload');
      return;
    }
    
    if (!name) {
      setError('Document name is required');
      return;
    }
    
    try {
      setIsUploading(true);
      setError(null);
      setSuccessMessage(null);
      setProgress(0);
      
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
      
      // Upload file to storage
      const fileName = `${projectId}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('project_documents')
        .upload(fileName, file);
        
      if (uploadError) throw uploadError;
      
      // Get public URL
      const { data: publicUrl } = supabase.storage
        .from('project_documents')
        .getPublicUrl(fileName);
        
      if (!publicUrl) throw new Error('Failed to get public URL');
      
      // Create document record
      const newDocument: Partial<ProjectDocument> = {
        project_id: projectId,
        name,
        file_url: publicUrl.publicUrl,
        file_type: file.type,
        file_size: file.size,
        uploaded_by: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const uploadedDocument = await projectService.createDocument(newDocument);
      
      clearInterval(progressInterval);
      setProgress(100);
      
      if (!uploadedDocument) {
        throw new Error('Failed to create document record');
      }
      
      setSuccessMessage('Document uploaded successfully!');
      
      // Reset form
      setName('');
      setFile(null);
      setDocumentType('contract');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      // Call the callback if provided
      if (onDocumentUploaded) {
        onDocumentUploaded(uploadedDocument);
      }
    } catch (err) {
      console.error('Error uploading document:', err);
      setError(err instanceof Error ? err.message : 'Failed to upload document');
    } finally {
      setIsUploading(false);
    }
  };
  
  const documentTypeOptions = [
    { value: 'contract', label: 'Contract' },
    { value: 'proposal', label: 'Proposal' },
    { value: 'invoice', label: 'Invoice' },
    { value: 'permit', label: 'Permit' },
    { value: 'plan', label: 'Plan' },
    { value: 'photo', label: 'Photo' },
    { value: 'other', label: 'Other' }
  ];
  
  // Check if user has permission to upload documents
  const canUploadDocument = hasPermission('create:project');
  
  if (!canUploadDocument) {
    return (
      <div className={className}>
        <Card>
          <CardContent>
            <div className="text-center py-6">
              <p className="text-red-600">You don't have permission to upload documents.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className={className}>
      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <Heading level={3}>Upload Document</Heading>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-6">
              <div>
                <Input
                  label="Document Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              
              <div>
                <Select
                  label="Document Type"
                  options={documentTypeOptions}
                  value={documentType}
                  onChange={(value) => setDocumentType(value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  File
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
                          ref={fileInputRef}
                          onChange={handleFileChange}
                          accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                          disabled={isUploading}
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      PDF, Word, Excel, or image up to 10MB
                    </p>
                    {file && (
                      <p className="text-sm text-gray-700 mt-2">
                        Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                      </p>
                    )}
                  </div>
                </div>
              </div>
              
              {isUploading && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Upload Progress
                  </label>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {progress}% complete
                  </p>
                </div>
              )}
              
              {error && (
                <div className="bg-red-50 border-l-4 border-red-400 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                </div>
              )}
              
              {successMessage && (
                <div className="bg-green-50 border-l-4 border-green-400 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-green-700">{successMessage}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
          
          <CardFooter>
            <div className="flex justify-end space-x-4">
              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                >
                  Cancel
                </Button>
              )}
              
              <Button
                type="submit"
                variant="primary"
                isLoading={isUploading}
                disabled={!file || isUploading}
              >
                Upload Document
              </Button>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default ProjectDocumentUpload;
