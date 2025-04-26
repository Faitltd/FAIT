import {
  getOptimizedImageUrl,
  generateResponsiveImageSrcSet,
  createPlaceholderImage,
  ImageSize,
  ImageFormat
} from '../imageUtils';

describe('imageUtils', () => {
  describe('getOptimizedImageUrl', () => {
    it('returns empty string for empty input', () => {
      expect(getOptimizedImageUrl('')).toBe('');
      expect(getOptimizedImageUrl(null as any)).toBe('');
      expect(getOptimizedImageUrl(undefined as any)).toBe('');
    });

    it('returns original URL for non-Supabase URLs', () => {
      const url = 'https://example.com/image.jpg';
      expect(getOptimizedImageUrl(url)).toBe(url);
    });

    it('adds transformation parameters for Supabase URLs', () => {
      const url = 'https://storage.googleapis.com/bucket/image.jpg';
      const result = getOptimizedImageUrl(url, {
        width: 300,
        height: 200,
        format: ImageFormat.WEBP,
        quality: 80
      });

      expect(result).toBe('https://storage.googleapis.com/bucket/image.jpg?width=300&height=200&format=webp&quality=80');
    });

    it('handles predefined sizes', () => {
      const url = 'https://supabase.co/storage/v1/object/image.jpg';
      
      const thumbnail = getOptimizedImageUrl(url, { size: ImageSize.THUMBNAIL });
      expect(thumbnail).toContain('width=150');
      expect(thumbnail).toContain('height=150');
      
      const medium = getOptimizedImageUrl(url, { size: ImageSize.MEDIUM });
      expect(medium).toContain('width=600');
      expect(medium).toContain('height=600');
    });

    it('appends parameters to URLs with existing query params', () => {
      const url = 'https://supabase.co/storage/v1/object/image.jpg?token=123';
      const result = getOptimizedImageUrl(url, { width: 300 });
      
      expect(result).toBe('https://supabase.co/storage/v1/object/image.jpg?token=123&width=300');
    });
  });

  describe('generateResponsiveImageSrcSet', () => {
    it('returns empty values for empty input', () => {
      const result = generateResponsiveImageSrcSet('');
      expect(result.src).toBe('');
      expect(result.srcset).toBe('');
    });

    it('generates srcset with multiple widths', () => {
      const url = 'https://supabase.co/storage/v1/object/image.jpg';
      const result = generateResponsiveImageSrcSet(url);
      
      expect(result.src).toContain(url);
      expect(result.srcset).toContain('300w');
      expect(result.srcset).toContain('600w');
      expect(result.srcset).toContain('900w');
      expect(result.srcset).toContain('1200w');
      expect(result.srcset).toContain('1800w');
    });

    it('applies format and quality options', () => {
      const url = 'https://supabase.co/storage/v1/object/image.jpg';
      const result = generateResponsiveImageSrcSet(url, {
        format: ImageFormat.WEBP,
        quality: 80
      });
      
      expect(result.src).toContain('format=webp');
      expect(result.src).toContain('quality=80');
      expect(result.srcset).toContain('format=webp');
      expect(result.srcset).toContain('quality=80');
    });
  });

  describe('createPlaceholderImage', () => {
    it('creates a placeholder URL with default values', () => {
      const result = createPlaceholderImage();
      expect(result).toBe('https://via.placeholder.com/300x300?text=Image');
    });

    it('creates a placeholder URL with custom dimensions', () => {
      const result = createPlaceholderImage(400, 200);
      expect(result).toBe('https://via.placeholder.com/400x200?text=Image');
    });

    it('creates a placeholder URL with custom text', () => {
      const result = createPlaceholderImage(300, 300, 'Custom Text');
      expect(result).toBe('https://via.placeholder.com/300x300?text=Custom%20Text');
    });
  });
});
