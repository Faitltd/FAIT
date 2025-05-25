import React, { useState, useRef, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { RefreshCw } from 'lucide-react';

interface PullToRefreshProps {
  children: React.ReactNode;
  onRefresh: () => Promise<void>;
  pullDownThreshold?: number;
  maxPullDownDistance?: number;
  refreshingContent?: React.ReactNode;
  pullingContent?: React.ReactNode;
  className?: string;
  backgroundColor?: string;
  pullingColor?: string;
  refreshingColor?: string;
  disabled?: boolean;
}

/**
 * Pull-to-refresh component for mobile interactions
 */
const PullToRefresh: React.FC<PullToRefreshProps> = ({
  children,
  onRefresh,
  pullDownThreshold = 80,
  maxPullDownDistance = 120,
  refreshingContent,
  pullingContent,
  className = '',
  backgroundColor = 'white',
  pullingColor = '#3b82f6',
  refreshingColor = '#3b82f6',
  disabled = false,
}) => {
  const [refreshing, setRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [startY, setStartY] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const pullControls = useAnimation();
  const contentControls = useAnimation();

  // Handle touch start
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (disabled || refreshing) return;
    
    // Only trigger pull-to-refresh when at the top of the container
    if (containerRef.current && containerRef.current.scrollTop <= 0) {
      setStartY(e.touches[0].clientY);
    }
  };

  // Handle touch move
  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (disabled || refreshing || startY === 0) return;
    
    // Calculate pull distance
    const currentY = e.touches[0].clientY;
    const newPullDistance = Math.max(0, Math.min(currentY - startY, maxPullDownDistance));
    
    // Update pull distance
    setPullDistance(newPullDistance);
    
    // Animate pull indicator
    pullControls.set({
      y: newPullDistance,
      opacity: newPullDistance / maxPullDownDistance,
      rotate: (newPullDistance / maxPullDownDistance) * 360,
    });
    
    // Move content down
    contentControls.set({
      y: newPullDistance * 0.4, // Reduce the movement of the content
    });
    
    // Prevent default scrolling behavior when pulling
    if (newPullDistance > 0) {
      e.preventDefault();
    }
  };

  // Handle touch end
  const handleTouchEnd = async () => {
    if (disabled || refreshing || startY === 0) return;
    
    // Reset start position
    setStartY(0);
    
    // Check if pull distance exceeds threshold
    if (pullDistance >= pullDownThreshold) {
      // Trigger refresh
      setRefreshing(true);
      
      // Animate pull indicator to refreshing state
      pullControls.start({
        y: pullDownThreshold,
        opacity: 1,
        rotate: 360,
        transition: { duration: 0.2 },
      });
      
      // Animate content back to original position
      contentControls.start({
        y: 0,
        transition: { duration: 0.2 },
      });
      
      try {
        // Call onRefresh callback
        await onRefresh();
      } catch (error) {
        console.error('Error during refresh:', error);
      } finally {
        // Reset refreshing state
        setRefreshing(false);
        
        // Reset pull distance
        setPullDistance(0);
        
        // Animate pull indicator back to hidden state
        pullControls.start({
          y: 0,
          opacity: 0,
          transition: { duration: 0.2 },
        });
      }
    } else {
      // Reset pull distance
      setPullDistance(0);
      
      // Animate pull indicator back to hidden state
      pullControls.start({
        y: 0,
        opacity: 0,
        transition: { duration: 0.2 },
      });
      
      // Animate content back to original position
      contentControls.start({
        y: 0,
        transition: { duration: 0.2 },
      });
    }
  };

  // Default refreshing content
  const defaultRefreshingContent = (
    <div className="flex items-center justify-center">
      <RefreshCw
        className="animate-spin"
        size={24}
        color={refreshingColor}
      />
    </div>
  );

  // Default pulling content
  const defaultPullingContent = (
    <div className="flex items-center justify-center">
      <RefreshCw
        size={24}
        color={pullingColor}
        style={{
          transform: `rotate(${(pullDistance / pullDownThreshold) * 360}deg)`,
          opacity: Math.min(pullDistance / pullDownThreshold, 1),
        }}
      />
    </div>
  );

  return (
    <div
      ref={containerRef}
      className={`overflow-auto ${className}`}
      style={{ backgroundColor, touchAction: 'pan-y' }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull indicator */}
      <motion.div
        className="absolute left-0 right-0 flex justify-center items-center h-16 pointer-events-none"
        initial={{ y: 0, opacity: 0 }}
        animate={pullControls}
      >
        {refreshing
          ? refreshingContent || defaultRefreshingContent
          : pullDistance > 0
          ? pullingContent || defaultPullingContent
          : null}
      </motion.div>

      {/* Content */}
      <motion.div animate={contentControls}>
        {children}
      </motion.div>
    </div>
  );
};

export default PullToRefresh;
