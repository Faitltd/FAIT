import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import useSwipe from '../../hooks/useSwipe';

interface SwipeableContainerProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  className?: string;
  threshold?: number;
  velocityThreshold?: number;
  preventDefaultTouchmove?: boolean;
  showIndicators?: boolean;
  disableAnimation?: boolean;
}

/**
 * A container component that detects swipe gestures
 */
const SwipeableContainer: React.FC<SwipeableContainerProps> = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  className = '',
  threshold = 50,
  velocityThreshold = 0.3,
  preventDefaultTouchmove = false,
  showIndicators = false,
  disableAnimation = false,
}) => {
  const { ref, swipeDirection } = useSwipe({
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    threshold,
    velocityThreshold,
    preventDefaultTouchmove,
  });

  // Determine if any swipe direction is active
  const isSwipeActive = 
    swipeDirection.horizontal !== null || 
    swipeDirection.vertical !== null;

  return (
    <div 
      ref={ref as React.RefObject<HTMLDivElement>} 
      className={`relative overflow-hidden ${className}`}
    >
      {disableAnimation ? (
        <div>{children}</div>
      ) : (
        <motion.div
          animate={{
            x: swipeDirection.horizontal === 'left' ? -10 : 
               swipeDirection.horizontal === 'right' ? 10 : 0,
            y: swipeDirection.vertical === 'up' ? -10 : 
               swipeDirection.vertical === 'down' ? 10 : 0,
          }}
          transition={{ 
            type: 'spring', 
            stiffness: 500, 
            damping: 30,
            restDelta: 0.001
          }}
        >
          {children}
        </motion.div>
      )}

      {/* Swipe indicators (optional) */}
      {showIndicators && (
        <div className="absolute inset-0 pointer-events-none">
          {/* Left indicator */}
          {onSwipeLeft && (
            <div 
              className={`absolute left-2 top-1/2 transform -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center transition-opacity duration-300 ${
                swipeDirection.horizontal === 'left' ? 'opacity-70' : 'opacity-20'
              }`}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="w-5 h-5"
              >
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </div>
          )}
          
          {/* Right indicator */}
          {onSwipeRight && (
            <div 
              className={`absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center transition-opacity duration-300 ${
                swipeDirection.horizontal === 'right' ? 'opacity-70' : 'opacity-20'
              }`}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="w-5 h-5"
              >
                <path d="M9 18l6-6-6-6" />
              </svg>
            </div>
          )}
          
          {/* Up indicator */}
          {onSwipeUp && (
            <div 
              className={`absolute top-2 left-1/2 transform -translate-x-1/2 w-8 h-8 rounded-full flex items-center justify-center transition-opacity duration-300 ${
                swipeDirection.vertical === 'up' ? 'opacity-70' : 'opacity-20'
              }`}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="w-5 h-5"
              >
                <path d="M18 15l-6-6-6 6" />
              </svg>
            </div>
          )}
          
          {/* Down indicator */}
          {onSwipeDown && (
            <div 
              className={`absolute bottom-2 left-1/2 transform -translate-x-1/2 w-8 h-8 rounded-full flex items-center justify-center transition-opacity duration-300 ${
                swipeDirection.vertical === 'down' ? 'opacity-70' : 'opacity-20'
              }`}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="w-5 h-5"
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SwipeableContainer;
