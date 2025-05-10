import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useMobile } from '../../hooks/useMediaQuery';

interface EnhancedResponsiveImageProps {
  src: string;
  alt: string;
  sizes?: string;
  className?: string;
  style?: React.CSSProperties;
  width?: number | string;
  height?: number | string;
  priority?: boolean;
  loading?: 'lazy' | 'eager';
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  objectPosition?: string;
  quality?: number;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  onLoad?: () => void;
  onError?: (error: Error) => void;
  fadeIn?: boolean;
  animation?: 'none' | 'fade' | 'zoom' | 'slide';
}

/**
 * Enhanced responsive image component with automatic srcset generation,
 * lazy loading, and animation effects
 */
const EnhancedResponsiveImage: React.FC<EnhancedResponsiveImageProps> = ({
  src,
  alt,
  sizes = '100vw',
  className = '',
  style = {},
  width,
  height,
  priority = false,
  loading = 'lazy',
  objectFit = 'cover',
  objectPosition = 'center',
  quality = 75,
  placeholder = 'empty',
  blurDataURL,
  onLoad,
  onError,
  fadeIn = true,
  animation = 'fade',
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const [srcSet, setSrcSet] = useState<string>('');
  const imageRef = useRef<HTMLImageElement>(null);
  const isMobile = useMobile();

  // Generate srcset for responsive images
  useEffect(() => {
    if (!src) return;

    // Define widths for srcset
    const widths = [320, 480, 640, 750, 828, 1080, 1200, 1920, 2048, 3840];
    
    // Generate srcset string
    const srcsetArray = widths.map(w => {
      // For simplicity, we're just appending width parameter
      // In a real implementation, you might use a proper image optimization service
      const url = new URL(src, window.location.origin);
      url.searchParams.set('w', w.toString());
      url.searchParams.set('q', quality.toString());
      return `${url.toString()} ${w}w`;
    });
    
    setSrcSet(srcsetArray.join(', '));
  }, [src, quality]);

  // Handle image load
  const handleLoad = () => {
    setIsLoaded(true);
    if (onLoad) onLoad();
  };

  // Handle image error
  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setIsError(true);
    if (onError) onError(new Error('Image failed to load'));
  };

  // Determine loading attribute
  const loadingAttribute = priority ? 'eager' : loading;

  // Animation variants
  const variants = {
    hidden: {
      opacity: 0,
      scale: animation === 'zoom' ? 1.05 : 1,
      x: animation === 'slide' ? 20 : 0,
    },
    visible: {
      opacity: 1,
      scale: 1,
      x: 0,
      transition: {
        duration: 0.4,
        ease: 'easeOut',
      },
    },
  };

  // Placeholder styles
  const placeholderStyles: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#f3f4f6',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  return (
    <div 
      className={`relative overflow-hidden ${className}`}
      style={{ 
        width: width || '100%', 
        height: height || 'auto',
        ...style 
      }}
    >
      {/* Placeholder */}
      {!isLoaded && placeholder === 'empty' && (
        <div style={placeholderStyles}>
          <svg 
            width="40" 
            height="40" 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className="text-gray-300"
          >
            <path 
              d="M4 16L8.586 11.414C8.96106 11.0391 9.46967 10.8284 10 10.8284C10.5303 10.8284 11.0389 11.0391 11.414 11.414L16 16M14 14L15.586 12.414C15.9611 12.0391 16.4697 11.8284 17 11.8284C17.5303 11.8284 18.0389 12.0391 18.414 12.414L20 14M14 8H14.01M6 20H18C18.5304 20 19.0391 19.7893 19.4142 19.4142C19.7893 19.0391 20 18.5304 20 18V6C20 5.46957 19.7893 4.96086 19.4142 4.58579C19.0391 4.21071 18.5304 4 18 4H6C5.46957 4 4.96086 4.21071 4.58579 4.58579C4.21071 4.96086 4 5.46957 4 6V18C4 18.5304 4.21071 19.0391 4.58579 19.4142C4.96086 19.7893 5.46957 20 6 20Z" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
        </div>
      )}

      {/* Blur placeholder */}
      {!isLoaded && placeholder === 'blur' && blurDataURL && (
        <div 
          style={{
            ...placeholderStyles,
            backgroundImage: `url(${blurDataURL})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(20px)',
          }}
        />
      )}

      {/* Actual image */}
      <motion.img
        ref={imageRef}
        src={src}
        srcSet={srcSet}
        sizes={sizes}
        alt={alt}
        loading={loadingAttribute}
        onLoad={handleLoad}
        onError={handleError}
        style={{
          objectFit,
          objectPosition,
          width: '100%',
          height: '100%',
          display: isError ? 'none' : 'block',
        }}
        initial={fadeIn ? 'hidden' : 'visible'}
        animate={isLoaded ? 'visible' : 'hidden'}
        variants={animation !== 'none' ? variants : undefined}
      />

      {/* Error state */}
      {isError && (
        <div style={placeholderStyles} className="bg-gray-100">
          <div className="text-center p-4">
            <svg 
              width="40" 
              height="40" 
              viewBox="0 0 24 24" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              className="mx-auto text-gray-400 mb-2"
            >
              <path 
                d="M12 9V11M12 15H12.01M5.07183 19H18.9282C20.4678 19 21.4301 17.3333 20.6603 16L13.7321 4C12.9623 2.66667 11.0378 2.66667 10.268 4L3.33978 16C2.56998 17.3333 3.53223 19 5.07183 19Z" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
            <p className="text-sm text-gray-500">Failed to load image</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedResponsiveImage;
