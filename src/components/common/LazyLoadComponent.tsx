import React, { useState, useEffect, Suspense, lazy, ComponentType } from 'react';
import { performanceMonitor } from '../../lib/performanceUtils';

interface LazyLoadComponentProps {
  /** Component to lazy load */
  component: () => Promise<{ default: ComponentType<any> }>;
  /** Props to pass to the component */
  componentProps?: Record<string, any>;
  /** Fallback component to show while loading */
  fallback?: React.ReactNode;
  /** Whether to load the component immediately */
  immediate?: boolean;
  /** Threshold for intersection observer (0-1) */
  threshold?: number;
  /** Root margin for intersection observer */
  rootMargin?: string;
  /** Whether to keep the component mounted after it's no longer visible */
  keepMounted?: boolean;
  /** Callback when component is loaded */
  onLoad?: () => void;
  /** Callback when component is visible */
  onVisible?: () => void;
}

/**
 * Component that lazy loads another component when it becomes visible
 */
const LazyLoadComponent: React.FC<LazyLoadComponentProps> = ({
  component,
  componentProps = {},
  fallback = <div className="h-32 w-full bg-gray-100 animate-pulse rounded"></div>,
  immediate = false,
  threshold = 0.1,
  rootMargin = '200px 0px',
  keepMounted = true,
  onLoad,
  onVisible
}) => {
  const [isVisible, setIsVisible] = useState(immediate);
  const [isLoaded, setIsLoaded] = useState(false);
  const [shouldRender, setShouldRender] = useState(immediate);
  const [LazyComponent, setLazyComponent] = useState<ComponentType<any> | null>(null);
  
  // Load the component when it becomes visible
  useEffect(() => {
    if (!isVisible) {
      // Set up intersection observer
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            setIsVisible(true);
            if (onVisible) onVisible();
            observer.disconnect();
          }
        },
        { threshold, rootMargin }
      );
      
      // Get the current element
      const currentElement = document.getElementById('lazy-load-container');
      if (currentElement) {
        observer.observe(currentElement);
      }
      
      return () => {
        observer.disconnect();
      };
    }
  }, [isVisible, threshold, rootMargin, onVisible]);
  
  // Load the component when it becomes visible
  useEffect(() => {
    if (isVisible && !isLoaded) {
      const loadComponent = async () => {
        try {
          // Measure component load time
          const id = performanceMonitor.start('LazyLoadComponent.load', {
            componentName: component.toString().split('(')[0].split(' ')[1]
          });
          
          // Load the component
          const loadedComponent = await component();
          
          // End performance measurement
          performanceMonitor.end(id);
          
          // Set the component
          setLazyComponent(() => loadedComponent.default);
          setIsLoaded(true);
          setShouldRender(true);
          
          if (onLoad) onLoad();
        } catch (error) {
          console.error('Error loading component:', error);
        }
      };
      
      loadComponent();
    }
  }, [isVisible, isLoaded, component, onLoad]);
  
  // Handle visibility changes
  useEffect(() => {
    if (!keepMounted && !isVisible && shouldRender) {
      setShouldRender(false);
    } else if (isVisible && !shouldRender) {
      setShouldRender(true);
    }
  }, [isVisible, shouldRender, keepMounted]);
  
  // If the component shouldn't render, return null
  if (!shouldRender) {
    return null;
  }
  
  return (
    <div id="lazy-load-container">
      {LazyComponent ? (
        <LazyComponent {...componentProps} />
      ) : (
        fallback
      )}
    </div>
  );
};

export default LazyLoadComponent;
