import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Star, AlertCircle, CheckCircle, Camera, X } from 'lucide-react';
import LoadingSpinner from '../LoadingSpinner';
import { formatDateTime } from '../../utils/formatters';

interface Booking {
  id: string;
  service_package_id: string;
  scheduled_date: string;
  service_agent_id: string;
  service_package?: {
    title: string;
  };
  service_agent?: {
    full_name: string;
    avatar_url?: string;
  };
}

interface EnhancedReviewFormProps {
  booking: Booking;
  onSuccess: () => void;
  onCancel: () => void;
  existingReview?: Review;
}

interface Review {
  id: string;
  booking_id: string;
  service_package_id: string;
  client_id: string;
  service_agent_id: string;
  rating: number;
  content: string;
  created_at: string;
  photos?: ReviewPhoto[];
}

interface ReviewPhoto {
  id: string;
  review_id: string;
  file_path: string;
  file_name: string;
  file_type: string;
  file_size: number;
  public_url: string;
}

const EnhancedReviewForm: React.FC<EnhancedReviewFormProps> = ({
  booking,
  onSuccess,
  onCancel,
  existingReview
}) => {
  const { user } = useAuth();
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [hoverRating, setHoverRating] = useState(0);
  const [content, setContent] = useState(existingReview?.content || '');
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviewUrls, setPhotoPreviewUrls] = useState<string[]>(
    existingReview?.photos?.map(photo => photo.public_url) || []
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleRatingChange = (newRating: number) => {
    setRating(newRating);
  };

  const handleMouseEnter = (index: number) => {
    setHoverRating(index);
  };

  const handleMouseLeave = () => {
    setHoverRating(0);
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
  };

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
    // If it's a new photo (File object), revoke the object URL to avoid memory leaks
    if (index < photos.length) {
      URL.revokeObjectURL(photoPreviewUrls[index]);
    }
    
    // Remove the photo and its preview URL
    setPhotos(photos.filter((_, i) => i !== index));
    setPhotoPreviewUrls(photoPreviewUrls.filter((_, i) => i !== index));
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
    
    if (!content.trim()) {
      setError('Please provide a review');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      let reviewId: string;
      
      if (existingReview) {
        // Update existing review
        const { error: updateError } = await supabase
          .from('reviews')
          .update({
            rating,
            content: content.trim(),
            updated_at: new Date().toISOString()
          })
          .eq('id', existingReview.id);
        
        if (updateError) throw updateError;
        
        reviewId = existingReview.id;
      } else {
        // Create new review
        const { data: review, error: reviewError } = await supabase
          .from('reviews')
          .insert({
            booking_id: booking.id,
            service_package_id: booking.service_package_id,
            client_id: user.id,
            service_agent_id: booking.service_agent_id,
            rating,
            content: content.trim()
          })
          .select()
          .single();
        
        if (reviewError) throw reviewError;
        
        reviewId = review.id;
      }
      
      // Upload photos if any
      if (photos.length > 0) {
        const photoUploads = photos.map(async (photo, index) => {
          const fileExt = photo.name.split('.').pop();
          const fileName = `${reviewId}_${index}_${Math.random().toString(36).substring(2)}.${fileExt}`;
          const filePath = `review-photos/${reviewId}/${fileName}`;
          
          const { error: uploadError } = await supabase.storage
            .from('review-photos')
            .upload(filePath, photo);
          
          if (uploadError) throw uploadError;
          
          // Get the public URL
          const { data: urlData } = supabase.storage
            .from('review-photos')
            .getPublicUrl(filePath);
          
          // Add the photo to the review_photos table
          const { error: photoError } = await supabase
            .from('review_photos')
            .insert({
              review_id: reviewId,
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
      
      // Create notification for the service agent
      await supabase
        .from('notifications')
        .insert({
          user_id: booking.service_agent_id,
          title: existingReview ? 'Review Updated' : 'New Review',
          message: existingReview 
            ? `A client has updated their review for your service.`
            : `A client has left a ${rating}-star review for your service.`,
          type: 'review',
          is_read: false
        });
      
      setSuccess(true);
      
      // Clear form
      if (!existingReview) {
        setRating(0);
        setContent('');
        setPhotos([]);
        setPhotoPreviewUrls([]);
      }
      
      // Call the success callback after a short delay to show the success message
      setTimeout(() => {
        onSuccess();
      }, 2000);
      
    } catch (err) {
      console.error('Error submitting review:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit review');
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
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            {existingReview ? 'Review Updated!' : 'Review Submitted!'}
          </h2>
          <p className="text-gray-600 mb-6">
            Thank you for sharing your feedback. Your review helps others make informed decisions.
          </p>
          <button
            onClick={onSuccess}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Return to Bookings
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">
        {existingReview ? 'Edit Your Review' : 'Write a Review'}
      </h2>
      
      {/* Booking info */}
      <div className="mb-6 bg-gray-50 p-4 rounded-md">
        <div className="flex items-start">
          <div className="flex-shrink-0 mr-4">
            <img
              src={booking.service_agent?.avatar_url || '/default-avatar.png'}
              alt={booking.service_agent?.full_name || 'Service Agent'}
              className="h-12 w-12 rounded-full object-cover"
            />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              {booking.service_package?.title || 'Service'}
            </h3>
            <p className="text-sm text-gray-500">
              by {booking.service_agent?.full_name || 'Service Agent'}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {formatDateTime(booking.scheduled_date)}
            </p>
          </div>
        </div>
      </div>
      
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4 flex items-start">
          <AlertCircle className="h-5 w-5 text-red-500 mr-3 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Star rating */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Rating
          </label>
          <div className="flex items-center">
            {[1, 2, 3, 4, 5].map((index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleRatingChange(index)}
                onMouseEnter={() => handleMouseEnter(index)}
                onMouseLeave={handleMouseLeave}
                className="p-1 focus:outline-none"
              >
                <Star
                  className={`h-8 w-8 ${
                    index <= (hoverRating || rating)
                      ? 'text-yellow-400 fill-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              </button>
            ))}
            <span className="ml-2 text-sm text-gray-500">
              {rating > 0 ? `${rating} out of 5 stars` : 'Select a rating'}
            </span>
          </div>
        </div>
        
        {/* Review text */}
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
            Your Review
          </label>
          <textarea
            id="content"
            value={content}
            onChange={handleContentChange}
            rows={4}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            placeholder="Share your experience with this service..."
            required
          />
        </div>
        
        {/* Photo upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Add Photos (Optional)
          </label>
          <p className="text-xs text-gray-500 mb-3">
            Share photos of the completed service. You can upload up to 5 images (max 5MB each).
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
            
            {photoPreviewUrls.length < 5 && (
              <button
                type="button"
                onClick={triggerFileInput}
                className="h-24 w-24 border-2 border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center text-gray-500 hover:border-blue-500 hover:text-blue-500 focus:outline-none"
              >
                <Camera className="h-6 w-6 mb-1" />
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
        
        {/* Submit buttons */}
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
            disabled={loading || rating === 0 || !content.trim()}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 flex items-center"
          >
            {loading ? (
              <>
                <LoadingSpinner size="small" />
                <span className="ml-2">Submitting...</span>
              </>
            ) : (
              existingReview ? 'Update Review' : 'Submit Review'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EnhancedReviewForm;
