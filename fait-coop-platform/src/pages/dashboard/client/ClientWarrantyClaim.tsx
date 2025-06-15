import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabase';
import type { Database } from '../../../lib/database.types';
import { ArrowLeft, Shield, Calendar, Upload, X } from 'lucide-react';

type Booking = Database['public']['Tables']['bookings']['Row'] & {
  service_package: Pick<Database['public']['Tables']['service_packages']['Row'], 'title' | 'description'>;
};

const ClientWarrantyClaim = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get('booking');
  
  const [eligibleBookings, setEligibleBookings] = useState<Booking[]>([]);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(bookingId);
  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEligibleBookings = async () => {
      try {
        if (!user) return;

        // Get completed bookings from the last 90 days
        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
        
        const { data, error } = await supabase
          .from('bookings')
          .select(`
            *,
            service_package:service_packages(title, description)
          `)
          .eq('client_id', user.id)
          .eq('status', 'completed')
          .gte('scheduled_date', ninetyDaysAgo.toISOString())
          .order('scheduled_date', { ascending: false });

        if (error) throw error;
        
        // Filter out bookings that already have warranty claims
        const { data: existingClaims } = await supabase
          .from('warranty_claims')
          .select('booking_id')
          .eq('client_id', user.id);
        
        const claimedBookingIds = existingClaims?.map(claim => claim.booking_id) || [];
        const eligibleBookings = data.filter(booking => !claimedBookingIds.includes(booking.id));
        
        setEligibleBookings(eligibleBookings as Booking[]);
        
        // If bookingId is provided but not in eligible bookings, clear it
        if (bookingId && !eligibleBookings.some(b => b.id === bookingId)) {
          setSelectedBookingId(null);
        }
      } catch (error) {
        console.error('Error fetching eligible bookings:', error);
        setError('Failed to load eligible bookings. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchEligibleBookings();
  }, [user, bookingId]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setPhotos(prev => [...prev, ...newFiles]);
      
      // Create preview URLs
      const newUrls = newFiles.map(file => URL.createObjectURL(file));
      setPhotoUrls(prev => [...prev, ...newUrls]);
    }
  };

  const removePhoto = (index: number) => {
    // Revoke the object URL to avoid memory leaks
    URL.revokeObjectURL(photoUrls[index]);
    
    setPhotos(prev => prev.filter((_, i) => i !== index));
    setPhotoUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !selectedBookingId) {
      setError('Please select a booking');
      return;
    }
    
    if (!description.trim()) {
      setError('Please provide a description of the issue');
      return;
    }
    
    setSubmitting(true);
    setError(null);
    
    try {
      // 1. Create the warranty claim
      const { data: claimData, error: claimError } = await supabase
        .from('warranty_claims')
        .insert({
          booking_id: selectedBookingId,
          client_id: user.id,
          description: description.trim(),
          status: 'pending',
        })
        .select()
        .single();
      
      if (claimError) throw claimError;
      
      // 2. Upload photos if any
      if (photos.length > 0) {
        const claimId = claimData.id;
        const photoPromises = photos.map(async (photo, index) => {
          const fileExt = photo.name.split('.').pop();
          const fileName = `${claimId}_${index}.${fileExt}`;
          const filePath = `warranty_claims/${claimId}/${fileName}`;
          
          const { error: uploadError } = await supabase.storage
            .from('warranty_photos')
            .upload(filePath, photo);
          
          if (uploadError) throw uploadError;
          
          // Get public URL
          const { data: urlData } = supabase.storage
            .from('warranty_photos')
            .getPublicUrl(filePath);
          
          return urlData.publicUrl;
        });
        
        const uploadedUrls = await Promise.all(photoPromises);
        
        // 3. Update claim with photo URLs
        const { error: updateError } = await supabase
          .from('warranty_claims')
          .update({ photo_urls: uploadedUrls })
          .eq('id', claimId);
        
        if (updateError) throw updateError;
      }
      
      // Success - navigate to warranty claims list
      navigate('/dashboard/client/warranty', { 
        state: { message: 'Warranty claim submitted successfully' } 
      });
    } catch (error) {
      console.error('Error submitting warranty claim:', error);
      setError('Failed to submit warranty claim. Please try again later.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link to="/dashboard/client/warranty" className="inline-flex items-center text-blue-600 hover:text-blue-800">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Warranty Claims
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-2">File a Warranty Claim</h1>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {eligibleBookings.length === 0 ? (
          <div className="p-8 text-center">
            <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Eligible Bookings</h3>
            <p className="text-gray-500 mb-4">
              You don't have any completed bookings within the last 90 days that are eligible for warranty claims.
              Warranty claims can only be filed for services completed within the last 90 days.
            </p>
            <Link
              to="/dashboard/client/bookings"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              View All Bookings
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6">
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                {error}
              </div>
            )}
            
            <div className="mb-6">
              <label htmlFor="booking" className="block text-sm font-medium text-gray-700 mb-1">
                Select Service
              </label>
              <select
                id="booking"
                value={selectedBookingId || ''}
                onChange={(e) => setSelectedBookingId(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                required
              >
                <option value="">Select a service</option>
                {eligibleBookings.map((booking) => (
                  <option key={booking.id} value={booking.id}>
                    {booking.service_package.title} - {new Date(booking.scheduled_date).toLocaleDateString()}
                  </option>
                ))}
              </select>
            </div>
            
            {selectedBookingId && (
              <div className="mb-6 bg-gray-50 p-4 rounded-md">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Service Details</h3>
                <p className="text-sm text-gray-600 mb-2">
                  {eligibleBookings.find(b => b.id === selectedBookingId)?.service_package.description}
                </p>
                <p className="text-sm text-gray-500">
                  <Calendar className="inline-block h-4 w-4 mr-1" />
                  Completed on {new Date(eligibleBookings.find(b => b.id === selectedBookingId)?.scheduled_date || '').toLocaleDateString()}
                </p>
              </div>
            )}
            
            <div className="mb-6">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Describe the Issue
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                placeholder="Please describe the issue you're experiencing in detail..."
                required
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Upload Photos (Optional)
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                    >
                      <span>Upload files</span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        className="sr-only"
                        accept="image/*"
                        multiple
                        onChange={handlePhotoChange}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                </div>
              </div>
            </div>
            
            {photoUrls.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Uploaded Photos</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {photoUrls.map((url, index) => (
                    <div key={index} className="relative">
                      <img
                        src={url}
                        alt={`Uploaded photo ${index + 1}`}
                        className="h-24 w-24 object-cover rounded-md"
                      />
                      <button
                        type="button"
                        onClick={() => removePhoto(index)}
                        className="absolute -top-2 -right-2 bg-red-100 text-red-600 rounded-full p-1 hover:bg-red-200"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex justify-end">
              <Link
                to="/dashboard/client/warranty"
                className="mr-4 inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={submitting || !selectedBookingId || !description.trim()}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit Claim'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ClientWarrantyClaim;
