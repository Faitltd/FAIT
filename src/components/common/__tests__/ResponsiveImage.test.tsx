import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import ResponsiveImage from '../ResponsiveImage';
import { ImageFormat } from '../../../lib/imageUtils';

// Mock the imageUtils functions
jest.mock('../../../lib/imageUtils', () => ({
  ...jest.requireActual('../../../lib/imageUtils'),
  getOptimizedImageUrl: jest.fn((url) => `optimized-${url}`),
  generateResponsiveImageSrcSet: jest.fn((url) => ({
    src: `optimized-${url}`,
    srcset: `optimized-${url} 300w, optimized-${url} 600w`
  })),
  isImageUrlValid: jest.fn().mockImplementation((url) => {
    return Promise.resolve(url !== 'invalid-image.jpg');
  }),
  createPlaceholderImage: jest.fn((width, height, text) => 
    `https://via.placeholder.com/${width || 300}x${height || 300}?text=${text || 'Image'}`
  ),
  ImageSize: {
    THUMBNAIL: 'thumbnail',
    SMALL: 'small',
    MEDIUM: 'medium',
    LARGE: 'large',
    ORIGINAL: 'original'
  },
  ImageFormat: {
    JPEG: 'jpeg',
    PNG: 'png',
    WEBP: 'webp',
    AVIF: 'avif'
  }
}));

describe('ResponsiveImage', () => {
  it('renders with loading state initially', () => {
    render(
      <ResponsiveImage
        src="test-image.jpg"
        alt="Test image"
      />
    );
    
    const image = screen.getByAltText('Test image');
    expect(image).toHaveClass('opacity-0');
  });
  
  it('shows the image after loading', async () => {
    render(
      <ResponsiveImage
        src="test-image.jpg"
        alt="Test image"
      />
    );
    
    const image = screen.getByAltText('Test image');
    
    // Simulate image load
    image.dispatchEvent(new Event('load'));
    
    await waitFor(() => {
      expect(image).toHaveClass('opacity-100');
    });
  });
  
  it('uses srcset for responsive images', () => {
    render(
      <ResponsiveImage
        src="test-image.jpg"
        alt="Test image"
      />
    );
    
    const image = screen.getByAltText('Test image');
    expect(image).toHaveAttribute('srcset', 'optimized-test-image.jpg 300w, optimized-test-image.jpg 600w');
  });
  
  it('uses placeholder for invalid images', async () => {
    render(
      <ResponsiveImage
        src="invalid-image.jpg"
        alt="Invalid image"
        width={400}
        height={300}
      />
    );
    
    // Wait for image validation to complete
    await waitFor(() => {
      const image = screen.getByAltText('Invalid image');
      expect(image).toHaveAttribute('src', 'https://via.placeholder.com/400x300?text=Invalid%20image');
    });
  });
  
  it('handles image load error', async () => {
    render(
      <ResponsiveImage
        src="test-image.jpg"
        alt="Test image"
      />
    );
    
    const image = screen.getByAltText('Test image');
    
    // Simulate image error
    image.dispatchEvent(new Event('error'));
    
    await waitFor(() => {
      expect(image).toHaveAttribute('src', expect.stringContaining('placeholder'));
    });
  });
  
  it('applies custom className', () => {
    render(
      <ResponsiveImage
        src="test-image.jpg"
        alt="Test image"
        className="custom-class"
      />
    );
    
    const image = screen.getByAltText('Test image');
    expect(image).toHaveClass('custom-class');
  });
  
  it('passes width and height props to image', () => {
    render(
      <ResponsiveImage
        src="test-image.jpg"
        alt="Test image"
        width={400}
        height={300}
      />
    );
    
    const image = screen.getByAltText('Test image');
    expect(image).toHaveAttribute('width', '400');
    expect(image).toHaveAttribute('height', '300');
  });
  
  it('uses lazy loading by default', () => {
    render(
      <ResponsiveImage
        src="test-image.jpg"
        alt="Test image"
      />
    );
    
    const image = screen.getByAltText('Test image');
    expect(image).toHaveAttribute('loading', 'lazy');
  });
  
  it('disables lazy loading when specified', () => {
    render(
      <ResponsiveImage
        src="test-image.jpg"
        alt="Test image"
        lazy={false}
      />
    );
    
    const image = screen.getByAltText('Test image');
    expect(image).not.toHaveAttribute('loading');
  });
});
