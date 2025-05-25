import React, { useState, useEffect } from 'react';
import { 
  getOptimizedImageUrl, 
  generateResponsiveImageSrcSet,
  createPlaceholderImage,
  isImageUrlValid,
  ResponsiveImageProps,
  ImageSize,
  ImageFormat
} from '../../lib/imageUtils';

const ResponsiveImage: React.FC<ResponsiveImageProps> = ({
  src,
  alt,
  className = '',
  size,
  width,
  height,
  format = ImageFormat.WEBP,
  quality = 80,
  lazy = true,
  placeholderText = 'Image'
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [validSrc, setValidSrc] = useState<string | null>(null);

  useEffect(() => {
    // Reset state when src changes
    setIsLoading(true);
    setError(false);
    setValidSrc(null);

    // Validate the image URL
    if (src) {
      isImageUrlValid(src)
        .then(isValid => {
          if (isValid) {
            setValidSrc(src);
          } else {
            setError(true);
          }
          setIsLoading(false);
        })
        .catch(() => {
          setError(true);
          setIsLoading(false);
        });
    } else {
      setError(true);
      setIsLoading(false);
    }
  }, [src]);

  // If we have a valid source, generate optimized image
  const { src: optimizedSrc, srcset } = validSrc
    ? generateResponsiveImageSrcSet(validSrc, { format, quality })
    : { src: '', srcset: '' };

  // If there's an error or no valid source, use placeholder
  const placeholderSrc = createPlaceholderImage(
    width || 300,
    height || 300,
    placeholderText || alt || 'Image'
  );

  // Determine final image source
  const finalSrc = error || !optimizedSrc ? placeholderSrc : optimizedSrc;

  // Common image props
  const imageProps = {
    src: finalSrc,
    alt,
    className: `${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`,
    width: width,
    height: height,
    loading: lazy ? 'lazy' : undefined,
    onLoad: () => setIsLoading(false),
    onError: () => {
      setError(true);
      setIsLoading(false);
    }
  };

  return (
    <div className="relative overflow-hidden" style={{ width, height }}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 animate-pulse">
          <span className="sr-only">Loading...</span>
        </div>
      )}
      
      {srcset ? (
        <img
          {...imageProps}
          srcSet={srcset}
          sizes={`(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw`}
        />
      ) : (
        <img {...imageProps} />
      )}
    </div>
  );
};

export default ResponsiveImage;
