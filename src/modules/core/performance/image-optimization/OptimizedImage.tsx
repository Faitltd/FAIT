/**
 * OptimizedImage Component
 * 
 * This component provides optimized image loading with responsive images,
 * lazy loading, and placeholder support.
 */

import React, { useState, useEffect, useRef, ImgHTMLAttributes } from 'react';
import { BaseComponentProps } from '../../components/types';

export interface OptimizedImageProps extends 
  BaseComponentProps,
  Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  /** Image source URL */
  src: string;
  /** Alternative text for the image */
  alt: string;
  /** Placeholder image to show while loading */
  placeholder?: string;
  /** Whether to lazy load the image */
  lazy?: boolean;
  /** Blur amount for the placeholder (px) */
  blurAmount?: number;
  /** Whether to fade in the image when loaded */
  fadeIn?: boolean;
  /** Duration of the fade-in animation (ms) */
  fadeInDuration?: number;
  /** Image sources for different resolutions */
  srcSet?: string;
  /** Image sizes for different viewport widths */
  sizes?: string;
  /** Whether to use WebP format if supported */
  webp?: boolean;
  /** Whether to use AVIF format if supported */
  avif?: boolean;
  /** Callback when the image is loaded */
  onLoad?: () => void;
  /** Callback when the image fails to load */
  onError?: () => void;
  /** Whether to show a loading indicator */
  showLoadingIndicator?: boolean;
  /** Whether to retry loading on error */
  retry?: boolean;
  /** Number of retries on error */
  retryCount?: number;
  /** Delay between retries (ms) */
  retryDelay?: number;
}

/**
 * OptimizedImage component
 * 
 * @example
 * ```tsx
 * <OptimizedImage
 *   src="/images/hero.jpg"
 *   alt="Hero image"
 *   placeholder="/images/hero-placeholder.jpg"
 *   lazy
 *   fadeIn
 *   srcSet="/images/hero-small.jpg 480w, /images/hero-medium.jpg 768w, /images/hero.jpg 1080w"
 *   sizes="(max-width: 480px) 100vw, (max-width: 768px) 50vw, 33vw"
 *   webp
 * />
 * ```
 */
export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  placeholder,
  lazy = true,
  blurAmount = 5,
  fadeIn = true,
  fadeInDuration = 300,
  srcSet,
  sizes,
  webp = true,
  avif = true,
  className,
  style,
  onLoad,
  onError,
  showLoadingIndicator = false,
  retry = true,
  retryCount = 3,
  retryDelay = 1000,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const [retries, setRetries] = useState(0);
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Handle image load
  const handleLoad = () => {
    setIsLoaded(true);
    if (onLoad) onLoad();
  };

  // Handle image error
  const handleError = () => {
    if (retry && retries < retryCount) {
      // Retry loading the image after a delay
      setTimeout(() => {
        setRetries(prev => prev + 1);
        if (imgRef.current) {
          imgRef.current.src = src;
        }
      }, retryDelay);
    } else {
      setIsError(true);
      if (onError) onError();
    }
  };

  // Set up intersection observer for lazy loading
  useEffect(() => {
    if (!lazy || !imgRef.current) return;

    // Create intersection observer
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && imgRef.current) {
            // Load the image when it enters the viewport
            imgRef.current.src = src;
            
            // Stop observing once loaded
            if (observerRef.current) {
              observerRef.current.unobserve(imgRef.current);
            }
          }
        });
      },
      { rootMargin: '200px 0px' } // Start loading when image is 200px from viewport
    );

    // Start observing the image
    observerRef.current.observe(imgRef.current);

    // Clean up observer
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [lazy, src]);

  // Generate image styles
  const imageStyles: React.CSSProperties = {
    ...style,
    opacity: isLoaded ? 1 : 0,
    transition: fadeIn ? `opacity ${fadeInDuration}ms ease-in-out` : undefined,
  };

  // Generate placeholder styles
  const placeholderStyles: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    filter: `blur(${blurAmount}px)`,
    opacity: isLoaded ? 0 : 1,
    transition: fadeIn ? `opacity ${fadeInDuration}ms ease-in-out` : undefined,
    objectFit: 'cover',
  };

  // Generate container styles
  const containerStyles: React.CSSProperties = {
    position: 'relative',
    overflow: 'hidden',
    width: '100%',
    height: '100%',
  };

  // Generate loading indicator styles
  const loadingIndicatorStyles: React.CSSProperties = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    opacity: isLoaded ? 0 : 1,
    transition: fadeIn ? `opacity ${fadeInDuration}ms ease-in-out` : undefined,
  };

  return (
    <div style={containerStyles} className={className}>
      {/* Placeholder image */}
      {placeholder && !isLoaded && (
        <img
          src={placeholder}
          alt=""
          style={placeholderStyles}
          aria-hidden="true"
        />
      )}

      {/* Loading indicator */}
      {showLoadingIndicator && !isLoaded && !isError && (
        <div style={loadingIndicatorStyles}>
          <div className="loading-spinner" />
        </div>
      )}

      {/* Main image */}
      <picture>
        {/* AVIF format */}
        {avif && srcSet && (
          <source
            type="image/avif"
            srcSet={srcSet.replace(/\.(jpe?g|png|webp)/g, '.avif')}
            sizes={sizes}
          />
        )}

        {/* WebP format */}
        {webp && srcSet && (
          <source
            type="image/webp"
            srcSet={srcSet.replace(/\.(jpe?g|png)/g, '.webp')}
            sizes={sizes}
          />
        )}

        {/* Original format */}
        <img
          ref={imgRef}
          src={lazy ? placeholder || 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==' : src}
          srcSet={!lazy ? srcSet : undefined}
          sizes={!lazy ? sizes : undefined}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          style={imageStyles}
          loading={lazy ? 'lazy' : undefined}
          {...props}
        />
      </picture>

      {/* Error message */}
      {isError && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: '#ff0000',
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            padding: '8px',
            borderRadius: '4px',
          }}
        >
          Failed to load image
        </div>
      )}
    </div>
  );
};

export default OptimizedImage;
