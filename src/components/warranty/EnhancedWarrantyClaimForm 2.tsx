import React, { useState, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Camera, Upload, X, AlertCircle, CheckCircle } from 'lucide-react';
import LoadingSpinner from '../LoadingSpinner';

interface Warranty {
  id: string;
  booking_id: string;
  service_id: string;
  warranty_type: {
    id: string;
    name: string;
    description: string;
  };
  start_date: string;
  end_date: string;
  status: string;
}

interface EnhancedWarrantyClaimFormProps {
  warranty: Warranty;
  onSuccess: () => void;
  onCancel: () => void;
}

const EnhancedWarrantyClaimForm: React.FC<EnhancedWarrantyClaimFormProps> = ({
  warranty,
  onSuccess,
  onCancel
}) => {
  const { user } = useAuth();
  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviewUrls, setPhotoPreviewUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      
      // Validate file types (only images)
      const invalidFiles = newFiles.filter(file => !file.type.startsWith('image/'));
      if (invalidFiles.length > 0) {
        setError('Only image files are allowed');
        return;
      }
      
      // Validate file size (max 5MB per file)
      const oversizedFiles = newFiles.filter(file => file.size > 5 * 1024 * 1024);
      if (oversizedFiles.length > 0) {
        setError('Files must be less than 5MB each');
        return;
      }
      
      // Add new files to state
      setPhotos(prevPhotos => [...prevPhotos, ...newFiles]);
      
      // Create preview URLs for the new files
      const newPreviewUrls = newFiles.map(file => URL.createObjectURL(file));
      setPhotoPreviewUrls(prevUrls => [...prevUrls, ...newPreviewUrls]);
      
      // Clear any previous errors
      setError(null);
    }
  };

  const removePhoto = (index: number) => {
    // Revoke the object URL to avoid memory leaks
    URL.revokeObjectURL(photoPreviewUrls[index]);
    
    // Remove the photo and its preview URL
    setPhotos(photos.filter((_, i) => i !== index));
    setPhotoPreviewUrls(photoPreviewUrls.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError('You must be logged in to submit a warranty claim');
      return;
    }
    
    if (!description.trim()) {
      setError('Please provide a description of the issue');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // 1. Create the warranty claim
      const { data: claim, error: claimError } = await supabase
        .from('warranty_claims')
        .insert({
          warranty_id: warranty.id,
          client_id: user.id,
          description: description.trim(),
          status: 'pending'
        })
        .select()
        .single();
      
      if (claimError) throw claimError;
      
      // 2. Upload photos if any
      if (photos.length > 0) {
        const photoUploads = photos.map(async (photo, index) => {
          const fileExt = photo.name.split('.').pop();
          const fileName = `${claim.id}_${index}_${Math.random().toString(36).substring(2)}.${fileExt}`;
          const filePath = `warranty-claims/${claim.id}/${fileName}`;
          
          const { error: uploadError } = await supabase.storage
            .from('warranty-photos')
            .upload(filePath, photo);
          
          if (uploadError) throw uploadError;
          
          // Get the public URL
          const { data: urlData } = supabase.storage
            .from('warranty-photos')
            .getPublicUrl(filePath);
          
          // Add the photo to the warranty_claim_photos table
          const { error: photoError } = await supabase
            .from('warranty_claim_photos')
            .insert({
              claim_id: claim.id,
              file_path: filePath,
              file_name: photo.name,
              file_type: photo.type,
              file_size: photo.size,
              public_url: urlData.publicUrl
            });
          
          if (photoError) throw photoError;
        });
        
        // Wait for all photo uploads to complete
        await Promise.all(photoUploads);
      }
      
      // 3. Create a notification for the service agent
      await supabase
        .from('notifications')
        .insert({
          user_id: claim.service_agent_id,
          title: 'New Warranty Claim',
          message: `A new warranty claim has been submitted for your service.`,
          type: 'warranty',
          is_read: false
        });
      
      setSuccess(true);
      
      // Clear form
      setDescription('');
      setPhotos([]);
      setPhotoPreviewUrls([]);
      
      // Call the success callback after a short delay to show the success message
      setTimeout(() => {
        onSuccess();
      }, 2000);
      
    } catch (err) {
      console.error('Error submitting warranty claim:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit warranty claim');
    } finally {
      setLoading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  if (success) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="text-center py-8">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Claim Submitted Successfully</h2>
          <p className="text-gray-600 mb-6">
            Your warranty claim has been submitted and will be reviewed shortly.
          </p>
          <button
            onClick={onSuccess}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Return to Warranties
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Submit Warranty Claim</h2>
      
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4 flex items-start">
          <AlertCircle className="h-5 w-5 text-red-500 mr-3 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Describe the Issue
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={4}
            placeholder="Please provide detailed information about the issue..."
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Add Photos (Optional)
          </label>
          <p className="text-xs text-gray-500 mb-3">
            Adding photos helps us better understand and resolve your issue. You can upload up to 5 images (max 5MB each).
          </p>
          
          <div className="flex flex-wrap gap-4 mb-4">
            {photoPreviewUrls.map((url, index) => (
              <div key={index} className="relative">
                <img
                  src={url}
                  alt={`Preview ${index + 1}`}
                  className="h-24 w-24 object-cover rounded-md border border-gray-300"
                />
                <button
                  type="button"
                  onClick={() => removePhoto(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 focus:outline-none"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
            
            {photos.length < 5 && (
              <button
                type="button"
                onClick={triggerFileInput}
                className="h-24 w-24 border-2 border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center text-gray-500 hover:border-blue-500 hover:text-blue-500 focus:outline-none"
              >
                <Upload className="h-6 w-6 mb-1" />
                <span className="text-xs">Add Photo</span>
              </button>
            )}
          </div>
          
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            multiple
            className="hidden"
          />
        </div>
        
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 flex items-center"
          >
            {loading ? (
              <>
                <LoadingSpinner size="small" />
                <span className="ml-2">Submitting...</span>
              </>
            ) : (
              'Submit Claim'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EnhancedWarrantyClaimForm;
