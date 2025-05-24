import React, { useState, useEffect } from 'react';
import supabase from '../../utils/supabaseClient';
import { getUserCompletedBookings, createWarrantyClaim } from '../../api/warrantyApi';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
// Using singleton Supabase client;

const WarrantyClaimForm = ({ onSuccess, onCancel }) => {
  const [bookings, setBookings] = useState([]);
  const [selectedBookingId, setSelectedBookingId] = useState('');
  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState([]);
  const [photoFiles, setPhotoFiles] = useState([]);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [loadingBookings, setLoadingBookings] = useState(true);

  // Fetch user's completed bookings
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoadingBookings(true);

        // Get authenticated user
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          setError('You must be logged in to submit a warranty claim');
          return;
        }

        // Get user's completed bookings
        const bookingsData = await getUserCompletedBookings(user.id);
        setBookings(bookingsData);
      } catch (err) {
        console.error('Error fetching bookings:', err);
        setError('Failed to load bookings. Please try again.');
      } finally {
        setLoadingBookings(false);
      }
    };

    fetchBookings();
  }, []);

  // Handle photo upload
  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);

    // Validate file types and sizes
    const validFiles = files.filter(file => {
      const isValidType = ['image/jpeg', 'image/png', 'image/jpg'].includes(file.type);
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB max

      if (!isValidType) {
        setError('Only JPEG and PNG images are allowed');
      } else if (!isValidSize) {
        setError('Images must be less than 5MB');
      }

      return isValidType && isValidSize;
    });

    if (validFiles.length === 0) {
      return;
    }

    // Create preview URLs
    const newPhotos = validFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));

    setPhotos([...photos, ...newPhotos]);
    setPhotoFiles([...photoFiles, ...validFiles]);
    setError(null);
  };

  // Remove photo
  const handleRemovePhoto = (index) => {
    const newPhotos = [...photos];
    const newPhotoFiles = [...photoFiles];

    // Revoke object URL to avoid memory leaks
    URL.revokeObjectURL(newPhotos[index].preview);

    newPhotos.splice(index, 1);
    newPhotoFiles.splice(index, 1);

    setPhotos(newPhotos);
    setPhotoFiles(newPhotoFiles);
  };

  // Upload photos to storage
  const uploadPhotos = async (claimId) => {
    if (photoFiles.length === 0) {
      return [];
    }

    setPhotoUploading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('User not authenticated');
      }

      const photoUrls = await Promise.all(
        photoFiles.map(async (file, index) => {
          const fileExt = file.name.split('.').pop();
          const fileName = `${user.id}/${claimId}/${Date.now()}-${index}.${fileExt}`;
          const filePath = `warranty_photos/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('warranty_photos')
            .upload(filePath, file);

          if (uploadError) {
            throw uploadError;
          }

          return filePath;
        })
      );

      return photoUrls;
    } catch (err) {
      console.error('Error uploading photos:', err);
      throw err;
    } finally {
      setPhotoUploading(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    if (!selectedBookingId) {
      setError('Please select a service');
      return;
    }

    if (!description.trim()) {
      setError('Please provide a description of the issue');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Create warranty claim
      const claim = await createWarrantyClaim(selectedBookingId, description);

      // Upload photos if any
      if (photoFiles.length > 0) {
        const photoUrls = await uploadPhotos(claim.id);

        // Update claim with photo URLs
        const { error: updateError } = await supabase
          .from('warranty_claims')
          .update({ photo_urls: photoUrls })
          .eq('id', claim.id);

        if (updateError) {
          throw updateError;
        }
      }

      // Clean up photo previews
      photos.forEach(photo => URL.revokeObjectURL(photo.preview));

      // Call success callback
      if (onSuccess) {
        onSuccess(claim);
      }
    } catch (err) {
      console.error('Error submitting warranty claim:', err);
      setError('Failed to submit warranty claim. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6 bg-gray-50">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Submit a Warranty Claim</h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Please provide details about the issue you're experiencing with a completed service.
        </p>
      </div>

      <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Service Selection */}
          <div className="mb-6">
            <label htmlFor="booking" className="block text-sm font-medium text-gray-700">
              Select Service
            </label>
            <div className="mt-1">
              {loadingBookings ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-500 mr-2"></div>
                  <span className="text-sm text-gray-500">Loading services...</span>
                </div>
              ) : bookings.length === 0 ? (
                <div className="text-sm text-red-500">
                  You don't have any completed services to file a warranty claim for.
                </div>
              ) : (
                <select
                  id="booking"
                  name="booking"
                  value={selectedBookingId}
                  onChange={(e) => setSelectedBookingId(e.target.value)}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  required
                >
                  <option value="">Select a service</option>
                  {bookings.map((booking) => (
                    <option key={booking.id} value={booking.id}>
                      {booking.service.name} - {new Date(booking.service_date).toLocaleDateString()}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description of Issue
            </label>
            <div className="mt-1">
              <textarea
                id="description"
                name="description"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                placeholder="Please describe the issue in detail..."
                required
              />
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Be specific about what's wrong and when you first noticed the issue.
            </p>
          </div>

          {/* Photo Upload */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700">
              Photos (Optional)
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div className="flex text-sm text-gray-600">
                  <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                    <span>Upload photos</span>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      className="sr-only"
                      accept="image/jpeg, image/png"
                      multiple
                      onChange={handlePhotoUpload}
                      disabled={loading || photoUploading}
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">
                  PNG, JPG up to 5MB
                </p>
              </div>
            </div>

            {/* Photo Previews */}
            {photos.length > 0 && (
              <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                {photos.map((photo, index) => (
                  <div key={index} className="relative">
                    <div className="group block w-full aspect-w-10 aspect-h-7 rounded-lg bg-gray-100 overflow-hidden">
                      <img
                        src={photo.preview}
                        alt={`Preview ${index + 1}`}
                        className="object-cover pointer-events-none"
                      />
                      <button
                        type="button"
                        className="absolute top-0 right-0 p-1 bg-red-500 text-white rounded-bl-lg"
                        onClick={() => handleRemovePhoto(index)}
                        disabled={loading || photoUploading}
                      >
                        <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-3">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                disabled={loading || photoUploading}
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={loading || photoUploading || loadingBookings || bookings.length === 0}
            >
              {loading || photoUploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                  {photoUploading ? 'Uploading Photos...' : 'Submitting...'}
                </>
              ) : (
                'Submit Claim'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WarrantyClaimForm;
