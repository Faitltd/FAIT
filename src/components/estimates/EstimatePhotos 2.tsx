import React, { useState, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { EstimatePhoto } from './EstimateBuilder';
import { Camera, X, Image, Plus } from 'lucide-react';
import LoadingSpinner from '../LoadingSpinner';

interface EstimatePhotosProps {
  photos: EstimatePhoto[];
  estimateId?: string;
  onAddPhotos: (photos: EstimatePhoto[]) => void;
  onRemovePhoto: (index: number) => void;
}

const EstimatePhotos: React.FC<EstimatePhotosProps> = ({
  photos,
  estimateId,
  onAddPhotos,
  onRemovePhoto
}) => {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      const uploadedPhotos: EstimatePhoto[] = [];
      
      for (const file of files) {
        // If we have an estimateId, upload directly to storage
        if (estimateId) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
          const filePath = `${estimateId}/${fileName}`;
          
          const { error: uploadError } = await supabase.storage
            .from('estimate-photos')
            .upload(filePath, file);
          
          if (uploadError) throw uploadError;
          
          const { data: urlData } = supabase.storage
            .from('estimate-photos')
            .getPublicUrl(filePath);
          
          uploadedPhotos.push({
            file_path: filePath,
            file_name: file.name,
            file_type: file.type,
            file_size: file.size,
            public_url: urlData.publicUrl
          });
        } else {
          // If no estimateId yet, create object URLs for preview
          const objectUrl = URL.createObjectURL(file);
          
          uploadedPhotos.push({
            file_name: file.name,
            file_type: file.type,
            file_size: file.size,
            public_url: objectUrl
          });
        }
      }
      
      onAddPhotos(uploadedPhotos);
    } catch (err) {
      console.error('Error uploading photos:', err);
      setError(err instanceof Error ? err.message : 'Failed to upload photos');
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
    if (!estimateId && photos[index].public_url.startsWith('blob:')) {
      URL.revokeObjectURL(photos[index].public_url);
    }
    
    onRemovePhoto(index);
  };

  const openPhotoModal = (index: number) => {
    setSelectedPhotoIndex(index);
    setShowPhotoModal(true);
  };

  const closePhotoModal = () => {
    setShowPhotoModal(false);
  };

  const nextPhoto = () => {
    setSelectedPhotoIndex((selectedPhotoIndex + 1) % photos.length);
  };

  const prevPhoto = () => {
    setSelectedPhotoIndex((selectedPhotoIndex - 1 + photos.length) % photos.length);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900">Photos</h3>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
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
      
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-3 text-sm text-red-600">
          {error}
        </div>
      )}
      
      {photos.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {photos.map((photo, index) => (
            <div key={index} className="relative group">
              <div
                className="aspect-w-1 aspect-h-1 bg-gray-100 rounded-md overflow-hidden cursor-pointer"
                onClick={() => openPhotoModal(index)}
              >
                <img
                  src={photo.public_url}
                  alt={photo.file_name}
                  className="object-cover w-full h-full"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity flex items-center justify-center">
                  <Image className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleRemovePhoto(index)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 focus:outline-none"
              >
                <X className="h-4 w-4" />
              </button>
              <p className="mt-1 text-xs text-gray-500 truncate">
                {photo.file_name}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-300 rounded-md p-8 text-center">
          <Camera className="h-12 w-12 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500 mb-2">No photos added yet</p>
          <p className="text-sm text-gray-400">
            Click "Add Photos" to upload images of the work to be done
          </p>
        </div>
      )}
      
      {/* Photo Modal */}
      {showPhotoModal && photos.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
          <div className="relative max-w-4xl max-h-screen p-4">
            <button
              onClick={closePhotoModal}
              className="absolute top-2 right-2 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-75"
            >
              <X className="h-6 w-6" />
            </button>
            
            <img
              src={photos[selectedPhotoIndex].public_url}
              alt={photos[selectedPhotoIndex].file_name}
              className="max-h-[80vh] max-w-full object-contain"
            />
            
            {photos.length > 1 && (
              <div className="absolute inset-x-0 bottom-4 flex justify-center space-x-4">
                <button
                  onClick={prevPhoto}
                  className="bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-75"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <div className="bg-black bg-opacity-50 text-white px-3 py-1 rounded-full">
                  {selectedPhotoIndex + 1} / {photos.length}
                </div>
                <button
                  onClick={nextPhoto}
                  className="bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-75"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EstimatePhotos;
