import React, { useState, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Star, Camera, X, AlertCircle } from 'lucide-react';
import LoadingSpinner from '../LoadingSpinner';

interface ReviewPhoto {
  file_path?: string;
  file_name: string;
  file_type?: string;
  file_size?: number;
  public_url: string;
}

interface ReviewFormProps {
  servicePackageId: string;
  bookingId?: string;
  serviceAgentId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({
  servicePackageId,
  bookingId,
  serviceAgentId,
  onSuccess,
  onCancel
}) => {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [photos, setPhotos] = useState<ReviewPhoto[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleRatingChange = (value: number) => {
    setRating(value);
  };

  const handleMouseEnter = (value: number) => {
    setHoverRating(value);
  };

  const handleMouseLeave = () => {
    setHoverRating(0);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }
    
    const files = Array.from(e.target.files);
    
    // Validate file types (only images)
    const invalidFiles = files.filter(file => !file.type.startsWith('image/'));
    if (invalidFiles.length > 0) {
      setError('Only image files are allowed');
      return;
    }
    
    // Validate file size (max 5MB per file)
    const oversizedFiles = files.filter(file => file.size > 5 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      setError('Files must be less than 5MB each');
      return;
    }
    
    setUploading(true);
    setError(null);
    
    try {
      const uploadedPhotos: ReviewPhoto[] = [];
      
      for (const file of files) {
        // Create object URLs for preview
        const objectUrl = URL.createObjectURL(file);
        
        uploadedPhotos.push({
          file_name: file.name,
          file_type: file.type,
          file_size: file.size,
          public_url: objectUrl
        });
      }
      
      setPhotos([...photos, ...uploadedPhotos]);
    } catch (err) {
      console.error('Error handling photos:', err);
      setError(err instanceof Error ? err.message : 'Failed to process photos');
    } finally {
      setUploading(false);
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemovePhoto = (index: number) => {
    // If it's a temporary object URL, revoke it to avoid memory leaks
    if (photos[index].public_url.startsWith('blob:')) {
      URL.revokeObjectURL(photos[index].public_url);
    }
    
    const newPhotos = [...photos];
    newPhotos.splice(index, 1);
    setPhotos(newPhotos);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError('You must be logged in to submit a review');
      return;
    }
    
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }
    
    if (!title.trim()) {
      setError('Please provide a title for your review');
      return;
    }
    
    if (!content.trim()) {
      setError('Please provide review content');
      return;
    }
    
    setSubmitting(true);
    setError(null);
    
    try {
      // Insert the review
      const { data: reviewData, error: reviewError } = await supabase
        .from('reviews')
        .insert({
          service_package_id: servicePackageId,
          booking_id: bookingId,
          client_id: user.id,
          service_agent_id: serviceAgentId,
          rating,
          title,
          content,
          status: 'published'
        })
        .select()
        .single();
      
      if (reviewError) throw reviewError;
      
      // Upload photos if any
      if (photos.length > 0) {
        for (let i = 0; i < photos.length; i++) {
          const photo = photos[i];
          
          // Skip photos that are already uploaded
          if (photo.file_path) continue;
          
          // Get the file from the object URL
          const response = await fetch(photo.public_url);
          const blob = await response.blob();
          const file = new File([blob], photo.file_name, { type: photo.file_type });
          
          // Upload to storage
          const fileExt = photo.file_name.split('.').pop();
          const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
          const filePath = `${reviewData.id}/${fileName}`;
          
          const { error: uploadError } = await supabase.storage
            .from('review-photos')
            .upload(filePath, file);
          
          if (uploadError) throw uploadError;
          
          const { data: urlData } = supabase.storage
            .from('review-photos')
            .getPublicUrl(filePath);
          
          // Insert photo record
          const { error: photoError } = await supabase
            .from('review_photos')
            .insert({
              review_id: reviewData.id,
              file_path: filePath,
              file_name: photo.file_name,
              file_type: photo.file_type,
              file_size: photo.file_size,
              public_url: urlData.publicUrl,
              sort_order: i
            });
          
          if (photoError) throw photoError;
          
          // Revoke the object URL
          URL.revokeObjectURL(photo.public_url);
        }
      }
      
      onSuccess();
    } catch (err) {
      console.error('Error submitting review:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="border-b border-gray-200 px-6 py-4">
        <h2 className="text-xl font-semibold text-gray-900">Write a Review</h2>
      </div>
      
      <form onSubmit={handleSubmit} className="p-6">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4 flex items-start">
            <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-red-800">There was an error</h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}
        
        {/* Rating */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rating*
          </label>
          <div className="flex items-center">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => handleRatingChange(value)}
                onMouseEnter={() => handleMouseEnter(value)}
                onMouseLeave={handleMouseLeave}
                className="p-1 focus:outline-none"
              >
                <Star
                  className={`h-8 w-8 ${
                    (hoverRating || rating) >= value
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                  }`}
                />
              </button>
            ))}
            <span className="ml-2 text-sm text-gray-500">
              {rating > 0 ? `${rating} out of 5 stars` : 'Click to rate'}
            </span>
          </div>
        </div>
        
        {/* Title */}
        <div className="mb-6">
          <label htmlFor="review-title" className="block text-sm font-medium text-gray-700 mb-2">
            Title*
          </label>
          <input
            type="text"
            id="review-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            placeholder="Summarize your experience"
            maxLength={100}
            required
          />
        </div>
        
        {/* Content */}
        <div className="mb-6">
          <label htmlFor="review-content" className="block text-sm font-medium text-gray-700 mb-2">
            Review*
          </label>
          <textarea
            id="review-content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            placeholder="Share details of your experience with this service"
            required
          />
        </div>
        
        {/* Photos */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Photos (Optional)
            </label>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {uploading ? (
                <>
                  <LoadingSpinner size="small" />
                  <span className="ml-1">Uploading...</span>
                </>
              ) : (
                <>
                  <Camera className="h-4 w-4 mr-1" />
                  Add Photos
                </>
              )}
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              multiple
              className="hidden"
            />
          </div>
          
          {photos.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {photos.map((photo, index) => (
                <div key={index} className="relative group">
                  <div className="aspect-w-1 aspect-h-1 bg-gray-100 rounded-md overflow-hidden">
                    <img
                      src={photo.public_url}
                      alt={photo.file_name}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemovePhoto(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 focus:outline-none"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center">
              <Camera className="h-8 w-8 text-gray-400 mx-auto mb-1" />
              <p className="text-sm text-gray-500">
                Add photos to your review (optional)
              </p>
            </div>
          )}
        </div>
        
        {/* Submit buttons */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {submitting ? (
              <>
                <LoadingSpinner size="small" />
                <span className="ml-2">Submitting...</span>
              </>
            ) : (
              'Submit Review'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReviewForm;
