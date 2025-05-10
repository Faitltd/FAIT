import { useRef, useEffect, useState } from 'react';
import { SwipeDetails, SwipeDirection } from '../utils/touchInteractions';

interface UseSwipeOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  threshold?: number;
  velocityThreshold?: number;
  preventDefaultTouchmove?: boolean;
}

/**
 * Custom hook for handling swipe gestures
 * @param options - Configuration options and callbacks
 * @returns Ref to attach to the element that should detect swipes
 */
export function useSwipe<T extends HTMLElement = HTMLDivElement>({
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  threshold = 50,
  velocityThreshold = 0.3,
  preventDefaultTouchmove = false,
}: UseSwipeOptions = {}) {
  const elementRef = useRef<T>(null);
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const [swipeDirection, setSwipeDirection] = useState<SwipeDirection>({ horizontal: null, vertical: null });

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      touchStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now(),
      };
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (preventDefaultTouchmove) {
        e.preventDefault();
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStartRef.current) return;

      const touch = e.changedTouches[0];
      const endX = touch.clientX;
      const endY = touch.clientY;
      const endTime = Date.now();
      
      const { x: startX, y: startY, time: startTime } = touchStartRef.current;
      
      const distanceX = endX - startX;
      const distanceY = endY - startY;
      const duration = endTime - startTime;
      
      const velocityX = Math.abs(distanceX) / duration;
      const velocityY = Math.abs(distanceY) / duration;
      
      // Determine horizontal direction if the swipe meets the threshold
      let horizontalDirection: 'left' | 'right' | null = null;
      if (Math.abs(distanceX) > threshold && velocityX > velocityThreshold) {
        horizontalDirection = distanceX > 0 ? 'right' : 'left';
      }
      
      // Determine vertical direction if the swipe meets the threshold
      let verticalDirection: 'up' | 'down' | null = null;
      if (Math.abs(distanceY) > threshold && velocityY > velocityThreshold) {
        verticalDirection = distanceY > 0 ? 'down' : 'up';
      }
      
      const newDirection = {
        horizontal: horizontalDirection,
        vertical: verticalDirection,
      };
      
      setSwipeDirection(newDirection);
      
      // Trigger the appropriate callback
      if (horizontalDirection === 'left' && onSwipeLeft) {
        onSwipeLeft();
      } else if (horizontalDirection === 'right' && onSwipeRight) {
        onSwipeRight();
      }
      
      if (verticalDirection === 'up' && onSwipeUp) {
        onSwipeUp();
      } else if (verticalDirection === 'down' && onSwipeDown) {
        onSwipeDown();
      }
      
      // Reset
      touchStartRef.current = null;
    };

    element.addEventListener('touchstart', handleTouchStart);
    element.addEventListener('touchmove', handleTouchMove, { passive: !preventDefaultTouchmove });
    element.addEventListener('touchend', handleTouchEnd);

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, threshold, velocityThreshold, preventDefaultTouchmove]);

  return { ref: elementRef, swipeDirection };
}

export default useSwipe;
