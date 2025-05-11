import React, { useState } from 'react';
import { motion } from 'framer-motion';
import performanceMonitor from '../../utils/performanceMonitor';

interface LazyImageProps {
  src: string;
  alt: string;
  width?: number | string;
  height?: number | string;
  className?: string;
}

const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  width = '100%',
  height = 'auto',
  className = '',
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);

  // Track image load time
  const handleLoad = () => {
    performanceMonitor.markEnd(`image_load_${src}`);
    setIsLoaded(true);
  };

  // Track image load error
  const handleError = () => {
    performanceMonitor.markEnd(`image_load_${src}`);
    setIsError(true);
  };

  // Start tracking image load time
  performanceMonitor.markStart(`image_load_${src}`);

  return (
    <div
      className={`relative overflow-hidden rounded-lg ${className}`}
      style={{ width, height: isLoaded ? 'auto' : '200px' }}
    >
      {/* Placeholder */}
      {!isLoaded && !isError && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          <svg
            className="w-12 h-12 text-gray-400"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
      )}

      {/* Error state */}
      {isError && (
        <div className="absolute inset-0 bg-red-50 flex flex-col items-center justify-center p-4">
          <svg
            className="w-12 h-12 text-red-400 mb-2"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <p className="text-red-600 text-center">Failed to load image</p>
        </div>
      )}

      {/* Actual image */}
      <motion.img
        src={src}
        alt={alt}
        className={`w-full h-auto ${isLoaded ? 'block' : 'invisible'}`}
        onLoad={handleLoad}
        onError={handleError}
        initial={{ opacity: 0 }}
        animate={isLoaded ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.3 }}
      />

      {/* Image info */}
      {isLoaded && (
        <motion.div
          className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white p-2 text-sm"
          initial={{ y: 30 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          {alt}
        </motion.div>
      )}
    </div>
  );
};

export default LazyImage;
