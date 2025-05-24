import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Image, Upload, X, AlertCircle } from 'lucide-react';

interface DetailsStepProps {
  bookingData: any;
  updateBookingData: (step: string, data: any) => void;
  service: any;
}

const DetailsStep: React.FC<DetailsStepProps> = ({ 
  bookingData, 
  updateBookingData, 
  service 
}) => {
  const [description, setDescription] = useState(bookingData.details.description || '');
  const [specialInstructions, setSpecialInstructions] = useState(bookingData.details.special_instructions || '');
  const [photos, setPhotos] = useState<string[]>(bookingData.details.photos || []);
  const [dragActive, setDragActive] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Update booking data when form changes
  useEffect(() => {
    updateBookingData('details', {
      description,
      special_instructions: specialInstructions,
      photos
    });
  }, [description, specialInstructions, photos, updateBookingData]);
  
  // Handle file drop
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };
  
  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };
  
  // Process files
  const handleFiles = (files: FileList) => {
    if (photos.length + files.length > 5) {
      setErrors({
        ...errors,
        photos: 'You can upload a maximum of 5 photos'
      });
      return;
    }
    
    setErrors({
      ...errors,
      photos: ''
    });
    
    // Convert files to data URLs
    Array.from(files).forEach(file => {
      if (!file.type.match('image.*')) {
        setErrors({
          ...errors,
          photos: 'Only image files are allowed'
        });
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target && typeof e.target.result === 'string') {
          setPhotos(prev => [...prev, e.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };
  
  // Remove photo
  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };
  
  // Drag events
  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };
  
  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-4">Service Details</h2>
      
      {/* Description */}
      <div className="mb-6">
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
          <FileText className="h-4 w-4 mr-1" />
          Describe what you need
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className="block w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-company-lightpink focus:border-company-lightpink"
          placeholder="Please describe what you need help with in detail..."
        />
        <p className="mt-1 text-sm text-gray-500">
          The more details you provide, the better prepared your service provider will be.
        </p>
      </div>
      
      {/* Special Instructions */}
      <div className="mb-6">
        <label htmlFor="special-instructions" className="block text-sm font-medium text-gray-700 mb-1">
          Special Instructions (Optional)
        </label>
        <textarea
          id="special-instructions"
          value={specialInstructions}
          onChange={(e) => setSpecialInstructions(e.target.value)}
          rows={3}
          className="block w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-company-lightpink focus:border-company-lightpink"
          placeholder="Any special instructions or requirements..."
        />
      </div>
      
      {/* Photo Upload */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
          <Image className="h-4 w-4 mr-1" />
          Upload Photos (Optional)
        </label>
        
        {/* Drag and Drop Area */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md ${
            dragActive 
              ? 'border-company-lightpink bg-pink-50' 
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <div className="space-y-1 text-center">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <div className="flex text-sm text-gray-600">
              <label
                htmlFor="file-upload"
                className="relative cursor-pointer rounded-md font-medium text-company-lightpink hover:text-company-lighterpink focus-within:outline-none"
              >
                <span>Upload files</span>
                <input
                  id="file-upload"
                  name="file-upload"
                  type="file"
                  className="sr-only"
                  accept="image/*"
                  multiple
                  onChange={handleFileChange}
                />
              </label>
              <p className="pl-1">or drag and drop</p>
            </div>
            <p className="text-xs text-gray-500">
              PNG, JPG, GIF up to 10MB (max 5 photos)
            </p>
          </div>
        </div>
        
        {errors.photos && (
          <div className="mt-2 flex items-center text-sm text-red-600">
            <AlertCircle className="h-4 w-4 mr-1" />
            {errors.photos}
          </div>
        )}
        
        {/* Preview Photos */}
        {photos.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Uploaded Photos</h4>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              {photos.map((photo, index) => (
                <div key={index} className="relative group">
                  <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-md bg-gray-200">
                    <img
                      src={photo}
                      alt={`Uploaded photo ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removePhoto(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Service Reminders */}
      <div className="mt-8 p-4 bg-blue-50 rounded-md">
        <h3 className="font-medium text-blue-800 mb-2">Service Reminders</h3>
        <ul className="space-y-2 text-sm text-blue-700">
          <li className="flex items-start">
            <span className="h-5 w-5 text-blue-500 mr-2">•</span>
            Please ensure the service area is accessible and clear of obstacles.
          </li>
          <li className="flex items-start">
            <span className="h-5 w-5 text-blue-500 mr-2">•</span>
            If you have pets, please secure them during the service appointment.
          </li>
          <li className="flex items-start">
            <span className="h-5 w-5 text-blue-500 mr-2">•</span>
            The service provider may contact you before the appointment to confirm details.
          </li>
        </ul>
      </div>
    </div>
  );
};

export default DetailsStep;
