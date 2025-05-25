/**
 * Optimized Image Component
 * 
 * A React component for displaying optimized images with:
 * - Responsive loading with srcset and sizes
 * - Modern format support (WebP, AVIF)
 * - Lazy loading with Intersection Observer
 * - Blur-up loading technique
 * - Fallback for unsupported formats
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  generateSrcSet, 
  generateSizes, 
  getOptimizedImageUrl, 
  ImageFormat, 
  createImagePlaceholder 
} from '../../utils/imageOptimization';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  /** Source URL of the image */
  src: string;
  /** Alternative text for the image */
  alt: string;
  /** Whether to lazy load the image */
  lazy?: boolean;
  /** Whether to use blur-up loading technique */
  blurUp?: boolean;
  /** Preferred image format */
  format?: ImageFormat;
  /** Image quality (0-100) */
  quality?: number;
  /** Whether to use responsive loading */
  responsive?: boolean;
  /** Intersection Observer threshold */
  threshold?: number;
  /** Intersection Observer root margin */
  rootMargin?: string;
  /** Callback when image is loaded */
  onLoad?: () => void;
  /** Callback when image fails to load */
  onError?: (error: Error) => void;
  /** Additional CSS class names */
  className?: string;
  /** Additional inline styles */
  style?: React.CSSProperties;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  lazy = true,
  blurUp = true,
  format = ImageFormat.WEBP,
  quality = 80,
  responsive = true,
  threshold = 0.1,
  rootMargin = '200px 0px',
  onLoad,
  onError,
  className = '',
  style = {},
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isVisible, setIsVisible] = useState(!lazy);
  const [placeholderSrc, setPlaceholderSrc] = useState<string | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Generate optimized image URL
  const optimizedSrc = getOptimizedImageUrl(src, { format, quality });

  // Generate srcset and sizes for responsive images
  const srcSet = responsive ? generateSrcSet(src, { format, quality }) : undefined;
  const sizes = responsive ? generateSizes() : undefined;

  // Create placeholder for blur-up loading
  useEffect(() => {
    if (blurUp && !placeholderSrc) {
      const placeholderUrl = getOptimizedImageUrl(src, {
        width: 20,
        quality: 20,
        blur: true
      });

      createImagePlaceholder(placeholderUrl, 10)
        .then(dataUrl => {
          setPlaceholderSrc(dataUrl);
        })
        .catch(error => {
          console.error('Error creating image placeholder:', error);
          if (onError) onError(error);
        });
    }
  }, [src, blurUp, placeholderSrc, onError]);

  // Set up Intersection Observer for lazy loading
  useEffect(() => {
    if (!lazy || isVisible) return;

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    observerRef.current = observer;

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [lazy, isVisible, threshold, rootMargin]);

  // Handle image load
  const handleLoad = () => {
    setIsLoaded(true);
    if (onLoad) onLoad();
  };

  // Handle image error
  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.error('Error loading image:', e);
    if (onError) onError(new Error('Failed to load image'));
  };

  // Combine styles
  const combinedStyle: React.CSSProperties = {
    ...style,
    ...(blurUp && !isLoaded && placeholderSrc
      ? {
          filter: 'blur(10px)',
          transition: 'filter 0.3s ease-out'
        }
      : {}),
    ...(isLoaded
      ? {
          filter: 'blur(0)',
          transition: 'filter 0.3s ease-out'
        }
      : {})
  };

  return (
    <div className={`relative ${className}`} style={{ overflow: 'hidden' }}>
      {blurUp && placeholderSrc && !isLoaded && (
        <img
          src={placeholderSrc}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: 'blur(10px)' }}
          aria-hidden="true"
        />
      )}
      <img
        ref={imgRef}
        src={isVisible ? optimizedSrc : ''}
        srcSet={isVisible ? srcSet : ''}
        sizes={isVisible ? sizes : ''}
        alt={alt}
        loading={lazy ? 'lazy' : undefined}
        onLoad={handleLoad}
        onError={handleError}
        style={combinedStyle}
        {...props}
      />
    </div>
  );
};

export default OptimizedImage;
