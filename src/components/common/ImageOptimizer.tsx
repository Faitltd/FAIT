import React, { useState, useEffect, useRef } from 'react';
import { performanceMonitor } from '../../lib/performanceUtils';

interface ImageOptimizerProps {
  /** Image source URL */
  src: string;
  /** Alternative text */
  alt: string;
  /** Width of the image */
  width?: number;
  /** Height of the image */
  height?: number;
  /** Whether to lazy load the image */
  lazy?: boolean;
  /** Image loading priority */
  priority?: boolean;
  /** Image quality (1-100) */
  quality?: number;
  /** Whether to use WebP format if supported */
  useWebP?: boolean;
  /** Placeholder to show while loading */
  placeholder?: 'blur' | 'empty';
  /** Blur data URL for placeholder */
  blurDataURL?: string;
  /** CSS class name */
  className?: string;
  /** Style object */
  style?: React.CSSProperties;
  /** On load callback */
  onLoad?: () => void;
  /** On error callback */
  onError?: (error: Error) => void;
}

/**
 * Component for optimizing image loading and display
 */
const ImageOptimizer: React.FC<ImageOptimizerProps> = ({
  src,
  alt,
  width,
  height,
  lazy = true,
  priority = false,
  quality = 75,
  useWebP = true,
  placeholder = 'empty',
  blurDataURL,
  className = '',
  style = {},
  onLoad,
  onError
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isVisible, setIsVisible] = useState(!lazy || priority);
  const [error, setError] = useState<Error | null>(null);
  const [optimizedSrc, setOptimizedSrc] = useState<string | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  
  // Check if WebP is supported
  const [supportsWebP, setSupportsWebP] = useState(false);
  
  useEffect(() => {
    const checkWebPSupport = async () => {
      try {
        const webPCheck = document.createElement('canvas');
        if (webPCheck.getContext && webPCheck.getContext('2d')) {
          const result = webPCheck.toDataURL('image/webp').indexOf('data:image/webp') === 0;
          setSupportsWebP(result);
        } else {
          setSupportsWebP(false);
        }
      } catch (e) {
        setSupportsWebP(false);
      }
    };
    
    checkWebPSupport();
  }, []);
  
  // Generate optimized image URL
  useEffect(() => {
    if (!src) return;
    
    try {
      // Start performance monitoring
      const id = performanceMonitor.start('ImageOptimizer.optimize', {
        src,
        width,
        height,
        useWebP
      });
      
      // Parse the URL
      const url = new URL(src);
      
      // Check if this is already an optimized image URL
      if (url.searchParams.has('width') || url.searchParams.has('format')) {
        setOptimizedSrc(src);
        performanceMonitor.end(id, { alreadyOptimized: true });
        return;
      }
      
      // Create a new URL with optimization parameters
      const optimizedUrl = new URL(src);
      
      // Add width and height if provided
      if (width) {
        optimizedUrl.searchParams.set('width', width.toString());
      }
      
      if (height) {
        optimizedUrl.searchParams.set('height', height.toString());
      }
      
      // Add quality parameter
      optimizedUrl.searchParams.set('quality', quality.toString());
      
      // Add format parameter if WebP is supported
      if (useWebP && supportsWebP) {
        optimizedUrl.searchParams.set('format', 'webp');
      }
      
      setOptimizedSrc(optimizedUrl.toString());
      
      // End performance monitoring
      performanceMonitor.end(id, { 
        optimizedUrl: optimizedUrl.toString(),
        useWebP: useWebP && supportsWebP
      });
    } catch (e) {
      // If URL parsing fails, use the original source
      console.warn('Failed to optimize image URL:', e);
      setOptimizedSrc(src);
      
      if (e instanceof Error) {
        setError(e);
        if (onError) onError(e);
      }
    }
  }, [src, width, height, quality, useWebP, supportsWebP, onError]);
  
  // Set up intersection observer for lazy loading
  useEffect(() => {
    if (!lazy || priority || !imgRef.current) {
      return;
    }
    
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
          observerRef.current = null;
        }
      },
      {
        rootMargin: '200px 0px',
        threshold: 0.01
      }
    );
    
    observer.observe(imgRef.current);
    observerRef.current = observer;
    
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [lazy, priority]);
  
  // Handle image load
  const handleLoad = () => {
    setIsLoaded(true);
    if (onLoad) onLoad();
  };
  
  // Handle image error
  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const errorMessage = 'Failed to load image';
    console.error(errorMessage, e);
    
    const error = new Error(errorMessage);
    setError(error);
    if (onError) onError(error);
  };
  
  // Determine placeholder style
  const placeholderStyle: React.CSSProperties = {
    ...style,
    backgroundColor: placeholder === 'blur' ? 'transparent' : '#f0f0f0',
    backgroundImage: placeholder === 'blur' && blurDataURL ? `url(${blurDataURL})` : 'none',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    filter: placeholder === 'blur' ? 'blur(20px)' : 'none',
    transition: 'opacity 0.3s ease-in-out'
  };
  
  // Determine image style
  const imageStyle: React.CSSProperties = {
    ...style,
    opacity: isLoaded ? 1 : 0,
    transition: 'opacity 0.3s ease-in-out'
  };
  
  return (
    <div
      className={`image-optimizer-container relative ${className}`}
      style={{
        width: width ? `${width}px` : '100%',
        height: height ? `${height}px` : 'auto',
        overflow: 'hidden'
      }}
    >
      {/* Placeholder */}
      {!isLoaded && (
        <div
          className="image-optimizer-placeholder absolute inset-0"
          style={placeholderStyle}
        />
      )}
      
      {/* Image */}
      <img
        ref={imgRef}
        src={isVisible ? optimizedSrc || src : ''}
        alt={alt}
        width={width}
        height={height}
        loading={lazy && !priority ? 'lazy' : 'eager'}
        onLoad={handleLoad}
        onError={handleError}
        className={`image-optimizer ${className}`}
        style={imageStyle}
      />
      
      {/* Error state */}
      {error && (
        <div className="image-optimizer-error absolute inset-0 flex items-center justify-center bg-gray-200 text-red-500">
          <span>Failed to load image</span>
        </div>
      )}
    </div>
  );
};

export default ImageOptimizer;
