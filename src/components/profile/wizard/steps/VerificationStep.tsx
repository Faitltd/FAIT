import React, { useState } from 'react';
import { Shield, Upload, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { supabase } from '../../../../lib/supabaseClient';
import LoadingSpinner from '../../../LoadingSpinner';

interface VerificationStepProps {
  profile: any;
  onChange: (name: string, value: any) => void;
  errors: Record<string, string>;
}

/**
 * Verification step in the profile setup wizard (for service agents only)
 */
const VerificationStep: React.FC<VerificationStepProps> = ({ profile, onChange, errors }) => {
  // Skip this step if not a service agent
  if (profile.user_type !== 'service_agent') {
    return null;
  }
  
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState<Record<string, boolean>>({});
  const [uploadErrors, setUploadErrors] = useState<Record<string, string>>({});
  
  // Handle document upload
  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>, documentType: string) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }
    
    const file = e.target.files[0];
    
    try {
      setUploading(true);
      
      // Create a unique file path
      const fileExt = file.name.split('.').pop();
      const fileName = `${documentType}_${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${profile.id}/verification/${fileName}`;
      
      // Upload the file
      const { error: uploadError } = await supabase.storage
        .from('verification_documents')
        .upload(filePath, file);
      
      if (uploadError) throw uploadError;
      
      // Get the public URL
      const { data } = supabase.storage
        .from('verification_documents')
        .getPublicUrl(filePath);
      
      // Update the profile with the document URL
      const documentUrls = profile.verification_documents || {};
      documentUrls[documentType] = data.publicUrl;
      
      onChange('verification_documents', documentUrls);
      
      // Set upload success
      setUploadSuccess(prev => ({ ...prev, [documentType]: true }));
      
      // Clear any previous error
      setUploadErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[documentType];
        return newErrors;
      });
    } catch (error) {
      console.error(`Error uploading ${documentType}:`, error);
      setUploadErrors(prev => ({
        ...prev,
        [documentType]: `Failed to upload ${documentType}. Please try again.`
      }));
    } finally {
      setUploading(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900">Verification</h3>
        <p className="mt-1 text-sm text-gray-600">
          Upload documents to verify your business credentials. This helps build trust with clients.
        </p>
      </div>
      
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <div className="flex">
          <Info className="h-5 w-5 text-blue-400 mr-3 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-medium text-blue-800">Verification Process</h4>
            <p className="mt-1 text-sm text-blue-700">
              Our team will review your documents within 1-2 business days. You'll receive an email
              when your verification is complete. You can still use the platform while verification
              is pending, but some features may be limited.
            </p>
          </div>
        </div>
      </div>
      
      {/* License Document */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Business License
        </label>
        <div className="mt-1 flex items-center">
          <div className="flex-grow">
            <div className="flex max-w-lg justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                <div className="flex text-sm text-gray-600">
                  <label
                    htmlFor="license-upload"
                    className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                  >
                    <span>Upload a file</span>
                    <input
                      id="license-upload"
                      name="license-upload"
                      type="file"
                      className="sr-only"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleDocumentUpload(e, 'license')}
                      disabled={uploading}
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">
                  PDF, PNG, JPG up to 10MB
                </p>
              </div>
            </div>
          </div>
          <div className="ml-4">
            {uploadSuccess.license ? (
              <CheckCircle className="h-8 w-8 text-green-500" />
            ) : profile.verification_documents?.license ? (
              <CheckCircle className="h-8 w-8 text-green-500" />
            ) : (
              <Shield className="h-8 w-8 text-gray-300" />
            )}
          </div>
        </div>
        {uploadErrors.license && (
          <p className="mt-1 text-sm text-red-600">{uploadErrors.license}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          Upload a copy of your business license or professional certification.
        </p>
      </div>
      
      {/* Insurance Document */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Insurance Certificate (Optional)
        </label>
        <div className="mt-1 flex items-center">
          <div className="flex-grow">
            <div className="flex max-w-lg justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                <div className="flex text-sm text-gray-600">
                  <label
                    htmlFor="insurance-upload"
                    className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                  >
                    <span>Upload a file</span>
                    <input
                      id="insurance-upload"
                      name="insurance-upload"
                      type="file"
                      className="sr-only"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleDocumentUpload(e, 'insurance')}
                      disabled={uploading}
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">
                  PDF, PNG, JPG up to 10MB
                </p>
              </div>
            </div>
          </div>
          <div className="ml-4">
            {uploadSuccess.insurance ? (
              <CheckCircle className="h-8 w-8 text-green-500" />
            ) : profile.verification_documents?.insurance ? (
              <CheckCircle className="h-8 w-8 text-green-500" />
            ) : (
              <Shield className="h-8 w-8 text-gray-300" />
            )}
          </div>
        </div>
        {uploadErrors.insurance && (
          <p className="mt-1 text-sm text-red-600">{uploadErrors.insurance}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          Upload a copy of your insurance certificate if available.
        </p>
      </div>
      
      {/* ID Document */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Government-Issued ID
        </label>
        <div className="mt-1 flex items-center">
          <div className="flex-grow">
            <div className="flex max-w-lg justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                <div className="flex text-sm text-gray-600">
                  <label
                    htmlFor="id-upload"
                    className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                  >
                    <span>Upload a file</span>
                    <input
                      id="id-upload"
                      name="id-upload"
                      type="file"
                      className="sr-only"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleDocumentUpload(e, 'id')}
                      disabled={uploading}
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">
                  PDF, PNG, JPG up to 10MB
                </p>
              </div>
            </div>
          </div>
          <div className="ml-4">
            {uploadSuccess.id ? (
              <CheckCircle className="h-8 w-8 text-green-500" />
            ) : profile.verification_documents?.id ? (
              <CheckCircle className="h-8 w-8 text-green-500" />
            ) : (
              <Shield className="h-8 w-8 text-gray-300" />
            )}
          </div>
        </div>
        {uploadErrors.id && (
          <p className="mt-1 text-sm text-red-600">{uploadErrors.id}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          Upload a copy of your driver's license or other government-issued ID.
        </p>
      </div>
      
      {uploading && (
        <div className="flex justify-center">
          <LoadingSpinner />
          <span className="ml-2 text-sm text-gray-500">Uploading document...</span>
        </div>
      )}
      
      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
        <div className="flex">
          <AlertTriangle className="h-5 w-5 text-yellow-400 mr-3 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-medium text-yellow-800">Privacy Notice</h4>
            <p className="mt-1 text-sm text-yellow-700">
              Your documents are stored securely and are only used for verification purposes.
              They will not be shared with clients or third parties.
            </p>
          </div>
        </div>
      </div>
      
      <div className="flex items-center">
        <input
          id="agree-terms"
          name="agree-terms"
          type="checkbox"
          checked={profile.agreed_to_verification_terms || false}
          onChange={(e) => onChange('agreed_to_verification_terms', e.target.checked)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="agree-terms" className="ml-2 block text-sm text-gray-900">
          I confirm that all information provided is accurate and I agree to the verification process.
        </label>
      </div>
      {errors.agreed_to_verification_terms && (
        <p className="mt-1 text-sm text-red-600">{errors.agreed_to_verification_terms}</p>
      )}
    </div>
  );
};

export default VerificationStep;
