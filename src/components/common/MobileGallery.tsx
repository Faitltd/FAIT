import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import EnhancedResponsiveImage from './EnhancedResponsiveImage';

interface GalleryImage {
  src: string;
  alt: string;
  thumbnail?: string;
}

interface MobileGalleryProps {
  images: GalleryImage[];
  initialIndex?: number;
  className?: string;
  thumbnailClassName?: string;
  fullscreenMode?: boolean;
  onClose?: () => void;
  aspectRatio?: string;
  showThumbnails?: boolean;
  showArrows?: boolean;
  showDots?: boolean;
  loop?: boolean;
  autoPlay?: boolean;
  autoPlayInterval?: number;
  onIndexChange?: (index: number) => void;
}

/**
 * Mobile-optimized image gallery with touch gestures
 */
const MobileGallery: React.FC<MobileGalleryProps> = ({
  images,
  initialIndex = 0,
  className = '',
  thumbnailClassName = '',
  fullscreenMode = false,
  onClose,
  aspectRatio = '16/9',
  showThumbnails = true,
  showArrows = true,
  showDots = true,
  loop = true,
  autoPlay = false,
  autoPlayInterval = 5000,
  onIndexChange,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [direction, setDirection] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  // Handle auto play
  useEffect(() => {
    if (autoPlay && !isDragging) {
      autoPlayRef.current = setInterval(() => {
        handleNext();
      }, autoPlayInterval);
    }

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [autoPlay, autoPlayInterval, currentIndex, isDragging]);

  // Update parent component when index changes
  useEffect(() => {
    if (onIndexChange) {
      onIndexChange(currentIndex);
    }
  }, [currentIndex, onIndexChange]);

  // Handle next image
  const handleNext = () => {
    if (currentIndex === images.length - 1) {
      if (loop) {
        setDirection(1);
        setCurrentIndex(0);
      }
    } else {
      setDirection(1);
      setCurrentIndex(prev => prev + 1);
    }
  };

  // Handle previous image
  const handlePrev = () => {
    if (currentIndex === 0) {
      if (loop) {
        setDirection(-1);
        setCurrentIndex(images.length - 1);
      }
    } else {
      setDirection(-1);
      setCurrentIndex(prev => prev - 1);
    }
  };

  // Handle drag end
  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    setIsDragging(false);
    
    const threshold = 50; // Minimum distance to trigger a swipe
    
    if (info.offset.x > threshold) {
      handlePrev();
    } else if (info.offset.x < -threshold) {
      handleNext();
    }
  };

  // Variants for slide animations
  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? '100%' : '-100%',
      opacity: 0,
    }),
  };

  // Handle thumbnail click
  const handleThumbnailClick = (index: number) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  };

  // Handle key navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (fullscreenMode) {
        if (e.key === 'ArrowLeft') {
          handlePrev();
        } else if (e.key === 'ArrowRight') {
          handleNext();
        } else if (e.key === 'Escape' && onClose) {
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [fullscreenMode, currentIndex]);

  return (
    <div 
      className={`relative overflow-hidden ${className}`}
      ref={containerRef}
    >
      {/* Main gallery */}
      <div 
        className="relative overflow-hidden"
        style={{ aspectRatio }}
      >
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: 'spring', stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
            }}
            className="absolute inset-0"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.7}
            onDragStart={() => setIsDragging(true)}
            onDragEnd={handleDragEnd}
          >
            <EnhancedResponsiveImage
              src={images[currentIndex].src}
              alt={images[currentIndex].alt}
              objectFit="cover"
              className="w-full h-full"
              animation="none"
            />
          </motion.div>
        </AnimatePresence>

        {/* Navigation arrows */}
        {showArrows && images.length > 1 && (
          <>
            <button
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-30 text-white rounded-full p-2 focus:outline-none"
              onClick={handlePrev}
              aria-label="Previous image"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-30 text-white rounded-full p-2 focus:outline-none"
              onClick={handleNext}
              aria-label="Next image"
            >
              <ChevronRight size={24} />
            </button>
          </>
        )}

        {/* Close button for fullscreen mode */}
        {fullscreenMode && onClose && (
          <button
            className="absolute top-2 right-2 bg-black bg-opacity-30 text-white rounded-full p-2 focus:outline-none"
            onClick={onClose}
            aria-label="Close gallery"
          >
            <X size={24} />
          </button>
        )}
      </div>

      {/* Pagination dots */}
      {showDots && images.length > 1 && (
        <div className="flex justify-center mt-2">
          {images.map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 mx-1 rounded-full focus:outline-none ${
                index === currentIndex ? 'bg-blue-600' : 'bg-gray-300'
              }`}
              onClick={() => handleThumbnailClick(index)}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Thumbnails */}
      {showThumbnails && images.length > 1 && (
        <div className="flex overflow-x-auto mt-2 pb-2 scrollbar-hide">
          {images.map((image, index) => (
            <div
              key={index}
              className={`flex-shrink-0 cursor-pointer mx-1 ${thumbnailClassName}`}
              onClick={() => handleThumbnailClick(index)}
            >
              <div
                className={`w-16 h-16 overflow-hidden rounded ${
                  index === currentIndex ? 'ring-2 ring-blue-600' : ''
                }`}
              >
                <EnhancedResponsiveImage
                  src={image.thumbnail || image.src}
                  alt={`Thumbnail ${index + 1}`}
                  objectFit="cover"
                  className="w-full h-full"
                  animation="none"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MobileGallery;
