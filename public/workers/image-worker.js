/**
 * Web Worker for Image Processing
 * 
 * This worker handles computationally intensive image processing tasks to keep
 * the main thread responsive, including:
 * - Image resizing
 * - Format conversion
 * - Compression
 * - Filters and effects
 */

// Handle messages from the main thread
self.onmessage = function(e) {
  const { id, action, data } = e.data;
  
  try {
    let result;
    
    switch (action) {
      case 'resize':
        result = resizeImage(data.imageData, data.width, data.height, data.options);
        break;
      case 'compress':
        result = compressImage(data.imageData, data.quality, data.format);
        break;
      case 'convert-format':
        result = convertFormat(data.imageData, data.format, data.options);
        break;
      case 'apply-filter':
        result = applyFilter(data.imageData, data.filter, data.options);
        break;
      case 'create-thumbnail':
        result = createThumbnail(data.imageData, data.size, data.options);
        break;
      case 'blur':
        result = blurImage(data.imageData, data.amount);
        break;
      case 'sharpen':
        result = sharpenImage(data.imageData, data.amount);
        break;
      case 'grayscale':
        result = grayscaleImage(data.imageData);
        break;
      case 'optimize-batch':
        result = optimizeBatch(data.images, data.options);
        break;
      default:
        throw new Error(`Unknown action: ${action}`);
    }
    
    // Send the result back to the main thread
    self.postMessage({
      id,
      success: true,
      result
    });
  } catch (error) {
    // Send error back to the main thread
    self.postMessage({
      id,
      success: false,
      error: {
        message: error.message,
        stack: error.stack
      }
    });
  }
};

/**
 * Resize an image
 * @param {ImageData} imageData - The image data to resize
 * @param {number} width - The target width
 * @param {number} height - The target height
 * @param {Object} options - Resize options
 * @returns {ImageData} - The resized image data
 */
function resizeImage(imageData, width, height, options = {}) {
  const { quality = 0.8, preserveAspectRatio = true } = options;
  
  // Create a canvas to draw the resized image
  const canvas = new OffscreenCanvas(width, height);
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    throw new Error('Could not get canvas context');
  }
  
  // Create a temporary canvas with the original image data
  const tempCanvas = new OffscreenCanvas(imageData.width, imageData.height);
  const tempCtx = tempCanvas.getContext('2d');
  
  if (!tempCtx) {
    throw new Error('Could not get temporary canvas context');
  }
  
  tempCtx.putImageData(imageData, 0, 0);
  
  // Calculate dimensions if preserving aspect ratio
  let targetWidth = width;
  let targetHeight = height;
  
  if (preserveAspectRatio) {
    const aspectRatio = imageData.width / imageData.height;
    
    if (width / height > aspectRatio) {
      targetWidth = height * aspectRatio;
    } else {
      targetHeight = width / aspectRatio;
    }
  }
  
  // Draw the resized image
  ctx.drawImage(
    tempCanvas,
    0, 0, imageData.width, imageData.height,
    0, 0, targetWidth, targetHeight
  );
  
  // Return the resized image data
  return ctx.getImageData(0, 0, width, height);
}

/**
 * Compress an image
 * @param {ImageData} imageData - The image data to compress
 * @param {number} quality - The compression quality (0-1)
 * @param {string} format - The output format (jpeg, png, webp)
 * @returns {Blob} - The compressed image as a Blob
 */
async function compressImage(imageData, quality = 0.8, format = 'image/jpeg') {
  // Create a canvas with the image data
  const canvas = new OffscreenCanvas(imageData.width, imageData.height);
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    throw new Error('Could not get canvas context');
  }
  
  ctx.putImageData(imageData, 0, 0);
  
  // Convert to blob with the specified format and quality
  return canvas.convertToBlob({
    type: format,
    quality
  });
}

/**
 * Apply a filter to an image
 * @param {ImageData} imageData - The image data to filter
 * @param {string} filter - The filter to apply
 * @param {Object} options - Filter options
 * @returns {ImageData} - The filtered image data
 */
function applyFilter(imageData, filter, options = {}) {
  const { amount = 1 } = options;
  
  // Create a copy of the image data
  const result = new ImageData(
    new Uint8ClampedArray(imageData.data),
    imageData.width,
    imageData.height
  );
  
  // Apply the filter
  switch (filter) {
    case 'grayscale':
      return grayscaleImage(imageData);
    case 'sepia':
      return sepiaFilter(imageData, amount);
    case 'invert':
      return invertFilter(imageData);
    case 'brightness':
      return brightnessFilter(imageData, amount);
    case 'contrast':
      return contrastFilter(imageData, amount);
    case 'blur':
      return blurImage(imageData, amount);
    case 'sharpen':
      return sharpenImage(imageData, amount);
    default:
      throw new Error(`Unknown filter: ${filter}`);
  }
}

/**
 * Convert an image to grayscale
 * @param {ImageData} imageData - The image data to convert
 * @returns {ImageData} - The grayscale image data
 */
function grayscaleImage(imageData) {
  const data = imageData.data;
  const result = new Uint8ClampedArray(data.length);
  
  for (let i = 0; i < data.length; i += 4) {
    const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    result[i] = gray;
    result[i + 1] = gray;
    result[i + 2] = gray;
    result[i + 3] = data[i + 3]; // Alpha channel
  }
  
  return new ImageData(result, imageData.width, imageData.height);
}
