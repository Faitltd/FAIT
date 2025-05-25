import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';

interface LazyLoadSectionProps {
  children: React.ReactNode;
  placeholder?: React.ReactNode;
  threshold?: number;
  rootMargin?: string;
  className?: string;
  style?: React.CSSProperties;
  animation?: 'fade' | 'slide-up' | 'slide-down' | 'slide-left' | 'slide-right' | 'zoom' | 'none';
  delay?: number;
  duration?: number;
  once?: boolean;
  disabled?: boolean;
  onVisible?: () => void;
  fallback?: React.ReactNode;
  minHeight?: string | number;
}

/**
 * Component that lazily loads its children when they enter the viewport
 */
const LazyLoadSection: React.FC<LazyLoadSectionProps> = ({
  children,
  placeholder,
  threshold = 0.1,
  rootMargin = '0px',
  className = '',
  style = {},
  animation = 'fade',
  delay = 0,
  duration = 0.5,
  once = true,
  disabled = false,
  onVisible,
  fallback,
  minHeight = '100px',
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, {
    once,
    amount: threshold,
    margin: rootMargin,
  });

  // Load content when in view
  useEffect(() => {
    if (isInView && !isLoaded && !disabled) {
      try {
        setIsLoaded(true);
        if (onVisible) onVisible();
      } catch (error) {
        console.error('Error loading lazy section:', error);
        setHasError(true);
      }
    }
  }, [isInView, isLoaded, disabled, onVisible]);

  // Animation variants based on the selected animation type
  const getVariants = () => {
    switch (animation) {
      case 'fade':
        return {
          hidden: { opacity: 0 },
          visible: { opacity: 1 },
        };
      case 'slide-up':
        return {
          hidden: { opacity: 0, y: 50 },
          visible: { opacity: 1, y: 0 },
        };
      case 'slide-down':
        return {
          hidden: { opacity: 0, y: -50 },
          visible: { opacity: 1, y: 0 },
        };
      case 'slide-left':
        return {
          hidden: { opacity: 0, x: 50 },
          visible: { opacity: 1, x: 0 },
        };
      case 'slide-right':
        return {
          hidden: { opacity: 0, x: -50 },
          visible: { opacity: 1, x: 0 },
        };
      case 'zoom':
        return {
          hidden: { opacity: 0, scale: 0.9 },
          visible: { opacity: 1, scale: 1 },
        };
      case 'none':
      default:
        return {
          hidden: {},
          visible: {},
        };
    }
  };

  const variants = getVariants();

  // Default placeholder if none provided
  const defaultPlaceholder = (
    <div className="flex items-center justify-center w-full h-full bg-gray-100 animate-pulse rounded">
      <svg
        className="w-12 h-12 text-gray-300"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
    </div>
  );

  // Error fallback if none provided
  const defaultFallback = (
    <div className="flex flex-col items-center justify-center w-full h-full bg-gray-50 rounded p-4">
      <svg
        className="w-12 h-12 text-gray-400 mb-2"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      </svg>
      <p className="text-gray-600 text-center">Failed to load content</p>
    </div>
  );

  return (
    <div
      ref={ref}
      className={className}
      style={{
        ...style,
        minHeight: !isLoaded ? minHeight : undefined,
      }}
    >
      {hasError ? (
        fallback || defaultFallback
      ) : isLoaded ? (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={variants}
          transition={{
            duration,
            delay,
            ease: 'easeOut',
          }}
        >
          {children}
        </motion.div>
      ) : (
        placeholder || defaultPlaceholder
      )}
    </div>
  );
};

export default LazyLoadSection;
