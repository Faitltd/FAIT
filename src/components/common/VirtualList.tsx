import React, { useState, useEffect, useRef, useCallback } from 'react';
import { performanceMonitor } from '../../lib/performanceUtils';

interface VirtualListProps<T> {
  /** Items to render */
  items: T[];
  /** Function to render an item */
  renderItem: (item: T, index: number) => React.ReactNode;
  /** Height of each item in pixels */
  itemHeight: number;
  /** Height of the container in pixels */
  height: number;
  /** Width of the container (default: 100%) */
  width?: string | number;
  /** Number of items to render above/below the visible area */
  overscan?: number;
  /** Class name for the container */
  className?: string;
  /** Whether to measure actual item heights */
  dynamicHeight?: boolean;
  /** Key function for items */
  keyExtractor?: (item: T, index: number) => string | number;
  /** Callback when visible items change */
  onVisibleItemsChange?: (startIndex: number, endIndex: number) => void;
}

/**
 * A virtualized list component that only renders items that are visible
 */
function VirtualList<T>({
  items,
  renderItem,
  itemHeight,
  height,
  width = '100%',
  overscan = 3,
  className = '',
  dynamicHeight = false,
  keyExtractor = (_, index) => index,
  onVisibleItemsChange
}: VirtualListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const [itemHeights, setItemHeights] = useState<number[]>([]);
  const [measuredItems, setMeasuredItems] = useState<Set<number>>(new Set());
  const containerRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<Record<string, HTMLDivElement>>({});
  
  // Calculate item positions and total height
  const getItemPositions = useCallback(() => {
    if (!dynamicHeight) {
      return {
        positions: items.map((_, i) => i * itemHeight),
        totalHeight: items.length * itemHeight
      };
    }
    
    const positions: number[] = [];
    let currentPosition = 0;
    
    for (let i = 0; i < items.length; i++) {
      positions.push(currentPosition);
      currentPosition += itemHeights[i] || itemHeight;
    }
    
    return {
      positions,
      totalHeight: currentPosition
    };
  }, [items.length, itemHeight, itemHeights, dynamicHeight]);
  
  const { positions, totalHeight } = getItemPositions();
  
  // Calculate visible items
  const getVisibleRange = useCallback(() => {
    const start = Math.max(0, scrollTop);
    const end = scrollTop + height;
    
    let startIndex = 0;
    while (startIndex < positions.length && positions[startIndex] < start) {
      startIndex++;
    }
    startIndex = Math.max(0, startIndex - 1);
    
    let endIndex = startIndex;
    while (endIndex < positions.length && positions[endIndex] < end) {
      endIndex++;
    }
    
    // Add overscan
    startIndex = Math.max(0, startIndex - overscan);
    endIndex = Math.min(items.length - 1, endIndex + overscan);
    
    return { startIndex, endIndex };
  }, [scrollTop, height, positions, items.length, overscan]);
  
  const { startIndex, endIndex } = getVisibleRange();
  
  // Notify when visible items change
  useEffect(() => {
    if (onVisibleItemsChange) {
      onVisibleItemsChange(startIndex, endIndex);
    }
  }, [startIndex, endIndex, onVisibleItemsChange]);
  
  // Handle scroll events
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop } = e.currentTarget;
    setScrollTop(scrollTop);
    
    // Measure items that are now visible
    if (dynamicHeight) {
      const { startIndex, endIndex } = getVisibleRange();
      const newMeasuredItems = new Set(measuredItems);
      let hasNewMeasurements = false;
      
      for (let i = startIndex; i <= endIndex; i++) {
        if (!newMeasuredItems.has(i)) {
          const key = keyExtractor(items[i], i);
          const itemElement = itemsRef.current[key];
          
          if (itemElement) {
            const height = itemElement.offsetHeight;
            setItemHeights(prev => {
              const newHeights = [...prev];
              newHeights[i] = height;
              return newHeights;
            });
            
            newMeasuredItems.add(i);
            hasNewMeasurements = true;
          }
        }
      }
      
      if (hasNewMeasurements) {
        setMeasuredItems(newMeasuredItems);
      }
    }
  }, [items, getVisibleRange, dynamicHeight, measuredItems, keyExtractor]);
  
  // Measure performance
  useEffect(() => {
    const id = performanceMonitor.start('VirtualList.render', {
      itemCount: items.length,
      visibleItems: endIndex - startIndex + 1
    });
    
    return () => {
      performanceMonitor.end(id);
    };
  }, [items.length, startIndex, endIndex]);
  
  // Render visible items
  const visibleItems = [];
  for (let i = startIndex; i <= endIndex; i++) {
    const item = items[i];
    const key = keyExtractor(item, i);
    const top = positions[i];
    
    visibleItems.push(
      <div
        key={key}
        ref={el => {
          if (el) itemsRef.current[key] = el;
        }}
        style={{
          position: 'absolute',
          top: `${top}px`,
          width: '100%',
          height: dynamicHeight ? 'auto' : `${itemHeight}px`
        }}
      >
        {renderItem(item, i)}
      </div>
    );
  }
  
  return (
    <div
      ref={containerRef}
      className={`virtual-list-container overflow-auto ${className}`}
      style={{ height, width }}
      onScroll={handleScroll}
    >
      <div
        className="virtual-list-content relative"
        style={{ height: `${totalHeight}px` }}
      >
        {visibleItems}
      </div>
    </div>
  );
}

export default VirtualList;
