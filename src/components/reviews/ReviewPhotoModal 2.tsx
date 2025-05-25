import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface ReviewPhoto {
  id: string;
  review_id: string;
  file_path: string;
  file_name: string;
  file_type: string;
  file_size: number;
  public_url: string;
}

interface ReviewPhotoModalProps {
  photos: ReviewPhoto[];
  initialIndex: number;
  onClose: () => void;
}

const ReviewPhotoModal: React.FC<ReviewPhotoModalProps> = ({
  photos,
  initialIndex,
  onClose
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Add event listener for escape key
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    // Add event listener for arrow keys
    const handleArrows = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };

    window.addEventListener('keydown', handleEscape);
    window.addEventListener('keydown', handleArrows);

    // Prevent body scrolling
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleEscape);
      window.removeEventListener('keydown', handleArrows);
      document.body.style.overflow = 'auto';
    };
  }, [currentIndex]);

  const handleNext = () => {
    setIsLoading(true);
    setCurrentIndex((prevIndex) => (prevIndex + 1) % photos.length);
  };

  const handlePrev = () => {
    setIsLoading(true);
    setCurrentIndex((prevIndex) => (prevIndex - 1 + photos.length) % photos.length);
  };

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only close if the backdrop itself was clicked
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90"
      onClick={handleBackdropClick}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-75 focus:outline-none"
        aria-label="Close"
      >
        <X className="h-6 w-6" />
      </button>

      {/* Navigation buttons */}
      {photos.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-75 focus:outline-none"
            aria-label="Previous photo"
          >
            <ChevronLeft className="h-8 w-8" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-75 focus:outline-none"
            aria-label="Next photo"
          >
            <ChevronRight className="h-8 w-8" />
          </button>
        </>
      )}

      {/* Image container */}
      <div className="relative max-w-4xl max-h-[90vh] w-full">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
          </div>
        )}
        <img
          src={photos[currentIndex].public_url}
          alt={`Review photo ${currentIndex + 1}`}
          className="max-h-[90vh] max-w-full mx-auto object-contain"
          onLoad={handleImageLoad}
          style={{ opacity: isLoading ? 0 : 1, transition: 'opacity 0.3s ease' }}
        />

        {/* Photo counter */}
        {photos.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
            {currentIndex + 1} / {photos.length}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewPhotoModal;
