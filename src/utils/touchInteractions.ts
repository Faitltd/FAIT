/**
 * Touch interaction utilities for mobile experiences
 */

export interface TouchPosition {
  x: number;
  y: number;
}

export interface SwipeDirection {
  horizontal: 'left' | 'right' | null;
  vertical: 'up' | 'down' | null;
}

export interface SwipeDetails {
  direction: SwipeDirection;
  distance: {
    x: number;
    y: number;
  };
  velocity: {
    x: number;
    y: number;
  };
}

// Minimum distance (in pixels) to consider a gesture a swipe
const SWIPE_THRESHOLD = 50;

// Minimum velocity (in pixels per millisecond) to consider a gesture a swipe
const VELOCITY_THRESHOLD = 0.3;

/**
 * Get touch coordinates from a touch event
 * @param event - Touch event
 * @returns Touch coordinates or null if not available
 */
export const getTouchCoordinates = (event: TouchEvent | React.TouchEvent): TouchPosition | null => {
  const touch = event.changedTouches ? event.changedTouches[0] : null;
  return touch ? { x: touch.clientX, y: touch.clientY } : null;
};

/**
 * Detect swipe direction and details from touch start and end events
 * @param startPosition - Starting touch position
 * @param endPosition - Ending touch position
 * @param duration - Duration of the swipe in milliseconds
 * @returns Swipe details including direction, distance, and velocity
 */
export const detectSwipe = (
  startPosition: TouchPosition,
  endPosition: TouchPosition,
  duration: number
): SwipeDetails => {
  const distanceX = endPosition.x - startPosition.x;
  const distanceY = endPosition.y - startPosition.y;
  
  const velocityX = Math.abs(distanceX) / duration;
  const velocityY = Math.abs(distanceY) / duration;
  
  // Determine horizontal direction if the swipe meets the threshold
  let horizontalDirection: 'left' | 'right' | null = null;
  if (Math.abs(distanceX) > SWIPE_THRESHOLD && velocityX > VELOCITY_THRESHOLD) {
    horizontalDirection = distanceX > 0 ? 'right' : 'left';
  }
  
  // Determine vertical direction if the swipe meets the threshold
  let verticalDirection: 'up' | 'down' | null = null;
  if (Math.abs(distanceY) > SWIPE_THRESHOLD && velocityY > VELOCITY_THRESHOLD) {
    verticalDirection = distanceY > 0 ? 'down' : 'up';
  }
  
  return {
    direction: {
      horizontal: horizontalDirection,
      vertical: verticalDirection,
    },
    distance: {
      x: distanceX,
      y: distanceY,
    },
    velocity: {
      x: velocityX,
      y: velocityY,
    },
  };
};

/**
 * Hook-compatible swipe handler creator
 * @param onSwipe - Callback function to handle swipe events
 * @returns Object with touch event handlers
 */
export const useSwipeHandlers = (onSwipe: (details: SwipeDetails) => void) => {
  let touchStartPosition: TouchPosition | null = null;
  let touchStartTime: number = 0;
  
  const handleTouchStart = (event: React.TouchEvent) => {
    const position = getTouchCoordinates(event);
    if (position) {
      touchStartPosition = position;
      touchStartTime = Date.now();
    }
  };
  
  const handleTouchEnd = (event: React.TouchEvent) => {
    if (!touchStartPosition) return;
    
    const position = getTouchCoordinates(event);
    if (position) {
      const duration = Date.now() - touchStartTime;
      const swipeDetails = detectSwipe(touchStartPosition, position, duration);
      
      // Only trigger the callback if there was a swipe in either direction
      if (swipeDetails.direction.horizontal || swipeDetails.direction.vertical) {
        onSwipe(swipeDetails);
      }
    }
    
    // Reset
    touchStartPosition = null;
  };
  
  return {
    onTouchStart: handleTouchStart,
    onTouchEnd: handleTouchEnd,
  };
};

export default {
  getTouchCoordinates,
  detectSwipe,
  useSwipeHandlers,
};
