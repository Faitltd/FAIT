import React, { useState, useEffect } from 'react';
import { 
  AlertCircle, 
  Upload, 
  X, 
  Camera,
  FileText
} from 'lucide-react';
import { Warranty, WarrantyClaim } from '../../types/warranty';
import { warrantyService } from '../../services/WarrantyService';
import { supabase } from '../../lib/supabase';

interface WarrantyClaimFormProps {
  warrantyId: string;
  onClaimSubmitted?: (claim: WarrantyClaim) => void;
  onCancel?: () => void;
}

const WarrantyClaimForm: React.FC<WarrantyClaimFormProps> = ({ 
  warrantyId, 
  onClaimSubmitted,
  onCancel
}) => {
  const [warranty, setWarranty] = useState<Warranty | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEligible, setIsEligible] = useState(false);
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [photoPreviewUrls, setPhotoPreviewUrls] = useState<string[]>([]);
  
  // Form state
  const [description, setDescription] = useState('');

  useEffect(() => {
    fetchWarranty();
    checkEligibility();
  }, [warrantyId]);

  const fetchWarranty = async () => {
    try {
      setLoading(true);
      const data = await warrantyService.getWarranty(warrantyId);
      setWarranty(data);
      setError(null);
    } catch (err) {
      setError('Failed to load warranty');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const checkEligibility = async () => {
    try {
      const eligible = await warrantyService.isWarrantyEligibleForClaim(warrantyId);
      setIsEligible(eligible);
      
      if (!eligible) {
        setError('This warranty is not eligible for claims');
      }
    } catch (err) {
      console.error('Failed to check warranty eligibility:', err);
      setError('Failed to check warranty eligibility');
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newPhotos = Array.from(e.target.files);
      setPhotos([...photos, ...newPhotos]);
      
      // Create preview URLs
      const newPreviewUrls = newPhotos.map(file => URL.createObjectURL(file));
      setPhotoPreviewUrls([...photoPreviewUrls, ...newPreviewUrls]);
    }
  };

  const removePhoto = (index: number) => {
    const newPhotos = [...photos];
    newPhotos.splice(index, 1);
    setPhotos(newPhotos);
    
    const newPreviewUrls = [...photoPreviewUrls];
    URL.revokeObjectURL(newPreviewUrls[index]);
    newPreviewUrls.splice(index, 1);
    setPhotoPreviewUrls(newPreviewUrls);
  };

  const uploadPhotos = async () => {
    const urls: string[] = [];
    
    for (const photo of photos) {
      const fileExt = photo.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `warranty-claims/${warrantyId}/${fileName}`;
      
      const { data, error } = await supabase.storage
        .from('warranty-photos')
        .upload(filePath, photo);
      
      if (error) {
        console.error('Error uploading photo:', error);
        continue;
      }
      
      const { data: { publicUrl } } = supabase.storage
        .from('warranty-photos')
        .getPublicUrl(filePath);
      
      urls.push(publicUrl);
    }
    
    return urls;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isEligible) {
      setError('This warranty is not eligible for claims');
      return;
    }
    
    if (!warranty) {
      setError('Warranty information is missing');
      return;
    }
    
    try {
      setSubmitting(true);
      setError(null);
      
      // Upload photos if any
      let uploadedPhotoUrls: string[] = [];
      if (photos.length > 0) {
        uploadedPhotoUrls = await uploadPhotos();
      }
      
      // Create the claim
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('User not authenticated');
        return;
      }
      
      const newClaim = await warrantyService.createWarrantyClaim({
        warranty_id: warrantyId,
        client_id: warranty.client_id,
        contractor_id: warranty.contractor_id,
        description,
        photo_urls: uploadedPhotoUrls.length > 0 ? uploadedPhotoUrls : null
      });
      
      if (newClaim) {
        // Clear form
        setDescription('');
        setPhotos([]);
        setPhotoPreviewUrls([]);
        
        // Notify parent component
        if (onClaimSubmitted) {
          onClaimSubmitted(newClaim);
        }
      } else {
        setError('Failed to submit warranty claim');
      }
    } catch (err) {
      console.error('Error submitting warranty claim:', err);
      setError('An error occurred while submitting the claim');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 bg-white rounded-lg shadow">
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!warranty) {
    return (
      <div className="p-4 bg-white rounded-lg shadow">
        <div className="text-red-500 flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          <span>Warranty not found</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Submit Warranty Claim</h3>
        <p className="mt-1 text-sm text-gray-500">
          Please provide details about the issue you're experiencing.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border-b border-red-200">
          <div className="text-red-700 flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            <span>{error}</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description of Issue
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            required
            disabled={!isEligible || submitting}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Please describe the issue in detail..."
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Photos (Optional)
          </label>
          <p className="mt-1 text-xs text-gray-500">
            Upload photos of the issue to help us better understand the problem.
          </p>
          
          <div className="mt-2 flex items-center">
            <label
              htmlFor="photo-upload"
              className={`cursor-pointer inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                !isEligible || submitting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <Camera className="h-4 w-4 mr-1" />
              Add Photos
              <input
                id="photo-upload"
                name="photos"
                type="file"
                multiple
                accept="image/*"
                disabled={!isEligible || submitting}
                onChange={handlePhotoChange}
                className="sr-only"
              />
            </label>
          </div>
          
          {photoPreviewUrls.length > 0 && (
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
              {photoPreviewUrls.map((url, index) => (
                <div key={index} className="relative">
                  <img
                    src={url}
                    alt={`Preview ${index + 1}`}
                    className="h-24 w-24 object-cover rounded-md"
                  />
                  <button
                    type="button"
                    onClick={() => removePhoto(index)}
                    disabled={submitting}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={submitting}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={!isEligible || submitting}
            className={`inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
              !isEligible || submitting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {submitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Submitting...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-1" />
                Submit Claim
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default WarrantyClaimForm;
