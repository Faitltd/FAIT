/**
 * Image Optimization Utilities
 * 
 * This module provides utilities for optimizing images, including:
 * - Responsive image loading with srcset
 * - Modern format support (WebP, AVIF)
 * - Lazy loading with Intersection Observer
 * - Blur-up loading technique
 * - Image compression
 */

// Supported image formats
export enum ImageFormat {
  JPEG = 'jpeg',
  PNG = 'png',
  WEBP = 'webp',
  AVIF = 'avif',
  GIF = 'gif'
}

// Image optimization options
export interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: ImageFormat;
  blur?: boolean;
  blurAmount?: number;
  resize?: boolean;
  crop?: boolean;
  grayscale?: boolean;
}

// Responsive image breakpoints
export const RESPONSIVE_BREAKPOINTS = [
  { width: 640, name: 'sm' },
  { width: 768, name: 'md' },
  { width: 1024, name: 'lg' },
  { width: 1280, name: 'xl' },
  { width: 1536, name: '2xl' }
];

/**
 * Generate srcset for responsive images
 * @param baseUrl Base URL of the image
 * @param options Optimization options
 * @returns srcset string
 */
export function generateSrcSet(
  baseUrl: string,
  options: ImageOptimizationOptions = {}
): string {
  if (!baseUrl) return '';

  // If it's not a Supabase storage URL, return as is
  if (!baseUrl.includes('storage.googleapis.com') && !baseUrl.includes('supabase.co/storage/v1')) {
    return baseUrl;
  }

  // Generate srcset for different breakpoints
  return RESPONSIVE_BREAKPOINTS.map(breakpoint => {
    const url = getOptimizedImageUrl(baseUrl, {
      ...options,
      width: breakpoint.width
    });
    return `${url} ${breakpoint.width}w`;
  }).join(', ');
}

/**
 * Generate sizes attribute for responsive images
 * @returns sizes string
 */
export function generateSizes(): string {
  return RESPONSIVE_BREAKPOINTS.map(breakpoint => {
    return `(max-width: ${breakpoint.width}px) ${breakpoint.width}px`;
  }).join(', ') + ', 100vw';
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

  // Parse URL
  const parsedUrl = new URL(url);
  const params = new URLSearchParams(parsedUrl.search);

  // Add optimization parameters
  if (options.width) {
    params.set('width', options.width.toString());
  }

  if (options.height) {
    params.set('height', options.height.toString());
  }

  if (options.quality) {
    params.set('quality', options.quality.toString());
  }

  if (options.format) {
    params.set('format', options.format);
  }

  if (options.blur) {
    params.set('blur', options.blurAmount?.toString() || '10');
  }

  if (options.resize) {
    params.set('resize', 'contain');
  }

  if (options.crop) {
    params.set('resize', 'cover');
  }

  if (options.grayscale) {
    params.set('grayscale', 'true');
  }

  // Update URL with new parameters
  parsedUrl.search = params.toString();
  return parsedUrl.toString();
}

/**
 * Check if browser supports a specific image format
 * @param format Image format to check
 * @returns Promise that resolves to true if format is supported
 */
export async function isFormatSupported(format: ImageFormat): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  // Create a canvas element
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;

  // Try to get data URL in the specified format
  let mimeType: string;
  switch (format) {
    case ImageFormat.WEBP:
      mimeType = 'image/webp';
      break;
    case ImageFormat.AVIF:
      mimeType = 'image/avif';
      break;
    case ImageFormat.PNG:
      mimeType = 'image/png';
      break;
    case ImageFormat.GIF:
      mimeType = 'image/gif';
      break;
    case ImageFormat.JPEG:
    default:
      mimeType = 'image/jpeg';
      break;
  }

  try {
    const dataUrl = canvas.toDataURL(mimeType, 0.1);
    return dataUrl.indexOf(`data:${mimeType}`) === 0;
  } catch (e) {
    return false;
  }
}

/**
 * Get the best supported image format for the current browser
 * @returns Promise that resolves to the best supported format
 */
export async function getBestSupportedFormat(): Promise<ImageFormat> {
  // Check AVIF support
  if (await isFormatSupported(ImageFormat.AVIF)) {
    return ImageFormat.AVIF;
  }

  // Check WebP support
  if (await isFormatSupported(ImageFormat.WEBP)) {
    return ImageFormat.WEBP;
  }

  // Fallback to JPEG
  return ImageFormat.JPEG;
}

/**
 * Create a low-quality image placeholder
 * @param url Image URL
 * @param size Size of the placeholder
 * @returns Promise that resolves to a data URL
 */
export async function createImagePlaceholder(url: string, size = 10): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = url;

    img.onload = () => {
      // Create a small canvas
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      // Set canvas size
      canvas.width = size;
      canvas.height = size * (img.height / img.width);

      // Draw image at small size
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Get data URL
      resolve(canvas.toDataURL('image/jpeg', 0.1));
    };

    img.onerror = () => {
      reject(new Error('Could not load image'));
    };
  });
}
