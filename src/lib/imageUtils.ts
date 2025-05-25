/**
 * Utilities for image optimization and handling
 */

/**
 * Image size options for responsive images
 */
export enum ImageSize {
  THUMBNAIL = 'thumbnail', // 150x150
  SMALL = 'small',         // 300x300
  MEDIUM = 'medium',       // 600x600
  LARGE = 'large',         // 1200x1200
  ORIGINAL = 'original'    // Original size
}

/**
 * Image format options
 */
export enum ImageFormat {
  JPEG = 'jpeg',
  PNG = 'png',
  WEBP = 'webp',
  AVIF = 'avif'
}

/**
 * Options for optimizing images
 */
export interface ImageOptimizationOptions {
  size?: ImageSize;
  width?: number;
  height?: number;
  format?: ImageFormat;
  quality?: number;
}

/**
 * Get optimized image URL for Supabase Storage
 * @param url Original image URL
 * @param options Optimization options
 * @returns Optimized image URL
 */
export function getOptimizedImageUrl(url: string, options: ImageOptimizationOptions = {}): string {
  if (!url) return '';

  // If it's not a Supabase storage URL, return as is
  if (!url.includes('storage.googleapis.com') && !url.includes('supabase.co/storage/v1')) {
    return url;
  }

  // Start building the transformation parameters
  const params: string[] = [];

  // Handle predefined sizes
  if (options.size) {
    switch (options.size) {
      case ImageSize.THUMBNAIL:
        params.push('width=150');
        params.push('height=150');
        break;
      case ImageSize.SMALL:
        params.push('width=300');
        params.push('height=300');
        break;
      case ImageSize.MEDIUM:
        params.push('width=600');
        params.push('height=600');
        break;
      case ImageSize.LARGE:
        params.push('width=1200');
        params.push('height=1200');
        break;
      case ImageSize.ORIGINAL:
      default:
        // No transformation needed
        break;
    }
  } else {
    // Handle custom dimensions
    if (options.width) {
      params.push(`width=${options.width}`);
    }
    if (options.height) {
      params.push(`height=${options.height}`);
    }
  }

  // Handle format conversion
  if (options.format) {
    params.push(`format=${options.format}`);
  }

  // Handle quality
  if (options.quality) {
    params.push(`quality=${options.quality}`);
  }

  // If no transformations, return original URL
  if (params.length === 0) {
    return url;
  }

  // Add transformation parameters to URL
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}${params.join('&')}`;
}

/**
 * Generate a set of srcset URLs for responsive images
 * @param url Original image URL
 * @param options Base optimization options
 * @returns Object with src and srcset properties
 */
export function generateResponsiveImageSrcSet(
  url: string,
  options: Omit<ImageOptimizationOptions, 'width' | 'size'> = {}
): { src: string; srcset: string } {
  if (!url) return { src: '', srcset: '' };

  // Define widths for srcset
  const widths = [300, 600, 900, 1200, 1800];

  // Generate the srcset string
  const srcset = widths
    .map(width => {
      const optimizedUrl = getOptimizedImageUrl(url, { ...options, width });
      return `${optimizedUrl} ${width}w`;
    })
    .join(', ');

  // Use medium size as default src
  const src = getOptimizedImageUrl(url, { ...options, size: ImageSize.MEDIUM });

  return { src, srcset };
}

/**
 * Create a placeholder image URL with specified dimensions and text
 * @param width Width of the placeholder
 * @param height Height of the placeholder
 * @param text Text to display on the placeholder
 * @returns Placeholder image URL
 */
export function createPlaceholderImage(
  width: number = 300,
  height: number = 300,
  text: string = 'Image'
): string {
  // Use a placeholder service
  return `https://via.placeholder.com/${width}x${height}?text=${encodeURIComponent(text)}`;
}

/**
 * Check if an image URL is valid
 * @param url Image URL to check
 * @returns Promise that resolves to boolean indicating if image is valid
 */
export function isImageUrlValid(url: string): Promise<boolean> {
  return new Promise(resolve => {
    if (!url) {
      resolve(false);
      return;
    }

    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
}

/**
 * Optimize an image file before upload
 * @param file Image file to optimize
 * @param options Optimization options
 * @returns Promise that resolves to optimized file
 */
export async function optimizeImageFile(
  file: File,
  options: {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
    format?: ImageFormat;
  } = {}
): Promise<File> {
  // Default options
  const maxWidth = options.maxWidth || 1920;
  const maxHeight = options.maxHeight || 1080;
  const quality = options.quality || 0.8;
  const format = options.format || ImageFormat.JPEG;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Calculate new dimensions while maintaining aspect ratio
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }

        // Create canvas and draw image
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Convert to desired format
        let mimeType: string;
        switch (format) {
          case ImageFormat.PNG:
            mimeType = 'image/png';
            break;
          case ImageFormat.WEBP:
            mimeType = 'image/webp';
            break;
          case ImageFormat.AVIF:
            mimeType = 'image/avif';
            break;
          case ImageFormat.JPEG:
          default:
            mimeType = 'image/jpeg';
            break;
        }

        // Get data URL
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Could not create blob'));
              return;
            }

            // Create new file
            const optimizedFile = new File(
              [blob],
              file.name.replace(/\.[^/.]+$/, `.${format}`),
              {
                type: mimeType,
                lastModified: Date.now(),
              }
            );

            resolve(optimizedFile);
          },
          mimeType,
          quality
        );
      };

      img.onerror = () => {
        reject(new Error('Could not load image'));
      };

      img.src = event.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error('Could not read file'));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Responsive Image component props
 */
export interface ResponsiveImageProps {
  src: string;
  alt: string;
  className?: string;
  size?: ImageSize;
  width?: number;
  height?: number;
  format?: ImageFormat;
  quality?: number;
  lazy?: boolean;
  placeholderText?: string;
}
