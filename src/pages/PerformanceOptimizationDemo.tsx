import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Activity, 
  Zap, 
  Code, 
  Database, 
  Image as ImageIcon, 
  RefreshCw, 
  Clock, 
  Cpu, 
  BarChart 
} from 'lucide-react';

import performanceMonitor from '../utils/performanceMonitor';
import { lazyLoad, lazyLoadOnVisible } from '../utils/codeSplitting';
import usePerformanceMonitor from '../hooks/usePerformanceMonitor';
import usePrefetch from '../hooks/usePrefetch';
import { stableCallback, useDebounced, useThrottled } from '../utils/memoization';

// Lazy loaded components
const HeavyComponent = lazyLoad(
  () => import('../components/demo/HeavyComponent'),
  { 
    name: 'HeavyComponent',
    preload: false,
    fallback: (
      <div className="p-6 bg-gray-100 animate-pulse rounded-lg">
        <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
      </div>
    )
  }
);

const LazyImage = lazyLoadOnVisible(
  () => import('../components/demo/LazyImage'),
  { 
    name: 'LazyImage',
    threshold: 0.1
  }
);

// Performance demo component
const PerformanceOptimizationDemo: React.FC = () => {
  const [count, setCount] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const [heavyComponentVisible, setHeavyComponentVisible] = useState(false);
  const [performanceMetrics, setPerformanceMetrics] = useState<any>({});
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Performance monitoring
  const { 
    trackInteractionStart, 
    trackInteractionEnd, 
    withTracking 
  } = usePerformanceMonitor({
    componentName: 'PerformanceOptimizationDemo',
    trackRender: true,
    trackMount: true,
    trackInteractions: true
  });
  
  // Resource prefetching
  const { prefetch, isPrefetching } = usePrefetch({
    prefetchOnMount: true,
    prefetchLikelyRoutes: true
  });
  
  // Debounced and throttled values
  const debouncedValue = useDebounced(inputValue, 500);
  const throttledCount = useThrottled(count, 1000);
  
  // Stable callback
  const incrementCounter = stableCallback(() => {
    trackInteractionStart('incrementCounter');
    setCount(prev => prev + 1);
    trackInteractionEnd('incrementCounter');
  }, [], 'incrementCounter');
  
  // Load performance metrics
  const loadPerformanceMetrics = useCallback(async () => {
    trackInteractionStart('loadMetrics');
    setIsRefreshing(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Get metrics from performance monitor
    performanceMonitor.logMetrics();
    
    // Get navigation timing
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const paintEntries = performance.getEntriesByType('paint');
    
    const firstPaint = paintEntries.find(entry => entry.name === 'first-paint');
    const firstContentfulPaint = paintEntries.find(entry => entry.name === 'first-contentful-paint');
    
    setPerformanceMetrics({
      pageLoad: navigation ? Math.round(navigation.loadEventEnd - navigation.startTime) : 'N/A',
      domContentLoaded: navigation ? Math.round(navigation.domContentLoadedEventEnd - navigation.startTime) : 'N/A',
      firstPaint: firstPaint ? Math.round(firstPaint.startTime) : 'N/A',
      firstContentfulPaint: firstContentfulPaint ? Math.round(firstContentfulPaint.startTime) : 'N/A',
      memoryUsage: (performance as any).memory ? 
        Math.round((performance as any).memory.usedJSHeapSize / 1048576) : 'N/A',
      resourceCount: performance.getEntriesByType('resource').length
    });
    
    setIsRefreshing(false);
    trackInteractionEnd('loadMetrics');
  }, [trackInteractionStart, trackInteractionEnd]);
  
  // Load metrics on mount
  useEffect(() => {
    loadPerformanceMetrics();
  }, [loadPerformanceMetrics]);
  
  // Prefetch heavy component when user scrolls down
  const prefetchHeavyComponent = useCallback(() => {
    prefetch('/static/js/HeavyComponent.chunk.js', 'script');
  }, [prefetch]);
  
  return (
    <div className="py-6">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Performance Optimizations</h1>
          <p className="mt-2 text-lg text-gray-600">
            Explore performance optimization techniques for mobile and desktop
          </p>
        </div>
        
        {/* Performance Metrics Card */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <Activity className="mr-2 text-blue-500" />
                Performance Metrics
              </h2>
              
              <button
                onClick={withTracking(loadPerformanceMetrics, 'refreshMetrics')}
                className="flex items-center px-3 py-1.5 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors"
                disabled={isRefreshing}
              >
                <RefreshCw size={16} className={`mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center text-gray-500 mb-1">
                  <Clock size={16} className="mr-1" />
                  <span className="text-sm">Page Load</span>
                </div>
                <div className="text-lg font-semibold">
                  {typeof performanceMetrics.pageLoad === 'number' ? 
                    `${performanceMetrics.pageLoad}ms` : performanceMetrics.pageLoad}
                </div>
              </div>
              
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center text-gray-500 mb-1">
                  <Zap size={16} className="mr-1" />
                  <span className="text-sm">First Paint</span>
                </div>
                <div className="text-lg font-semibold">
                  {typeof performanceMetrics.firstPaint === 'number' ? 
                    `${performanceMetrics.firstPaint}ms` : performanceMetrics.firstPaint}
                </div>
              </div>
              
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center text-gray-500 mb-1">
                  <ImageIcon size={16} className="mr-1" />
                  <span className="text-sm">First Contentful Paint</span>
                </div>
                <div className="text-lg font-semibold">
                  {typeof performanceMetrics.firstContentfulPaint === 'number' ? 
                    `${performanceMetrics.firstContentfulPaint}ms` : performanceMetrics.firstContentfulPaint}
                </div>
              </div>
              
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center text-gray-500 mb-1">
                  <Database size={16} className="mr-1" />
                  <span className="text-sm">Resources</span>
                </div>
                <div className="text-lg font-semibold">
                  {performanceMetrics.resourceCount || 'N/A'}
                </div>
              </div>
              
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center text-gray-500 mb-1">
                  <Cpu size={16} className="mr-1" />
                  <span className="text-sm">Memory Usage</span>
                </div>
                <div className="text-lg font-semibold">
                  {typeof performanceMetrics.memoryUsage === 'number' ? 
                    `${performanceMetrics.memoryUsage}MB` : performanceMetrics.memoryUsage}
                </div>
              </div>
              
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center text-gray-500 mb-1">
                  <Code size={16} className="mr-1" />
                  <span className="text-sm">DOM Content Loaded</span>
                </div>
                <div className="text-lg font-semibold">
                  {typeof performanceMetrics.domContentLoaded === 'number' ? 
                    `${performanceMetrics.domContentLoaded}ms` : performanceMetrics.domContentLoaded}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Optimization Demos */}
        <div className="space-y-8">
          {/* Memoization Demo */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <BarChart className="mr-2 text-purple-500" />
                Memoization & Stable Callbacks
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={incrementCounter}
                    className="px-4 py-2 bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 transition-colors"
                  >
                    Increment ({count})
                  </button>
                  
                  <div className="text-gray-600">
                    Throttled: {throttledCount}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Debounced Input
                  </label>
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Type something..."
                  />
                  <div className="text-sm text-gray-600">
                    Debounced value (500ms): <span className="font-medium">{debouncedValue}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Code Splitting Demo */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Code className="mr-2 text-green-500" />
                Code Splitting & Lazy Loading
              </h2>
              
              <div className="space-y-4">
                <div className="flex flex-wrap gap-4">
                  <button
                    onClick={() => setHeavyComponentVisible(prev => !prev)}
                    className="px-4 py-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors"
                  >
                    {heavyComponentVisible ? 'Hide' : 'Show'} Heavy Component
                  </button>
                  
                  <button
                    onClick={prefetchHeavyComponent}
                    className="px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                    disabled={isPrefetching}
                  >
                    {isPrefetching ? 'Prefetching...' : 'Prefetch Component'}
                  </button>
                </div>
                
                {heavyComponentVisible && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <HeavyComponent />
                  </motion.div>
                )}
              </div>
            </div>
          </div>
          
          {/* Lazy Image Loading Demo */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <ImageIcon className="mr-2 text-blue-500" />
                Lazy Image Loading
              </h2>
              
              <div className="space-y-4">
                <p className="text-gray-600">
                  Scroll down to see images load only when they enter the viewport
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map((index) => (
                    <LazyImage
                      key={index}
                      src={`https://images.unsplash.com/photo-${1580000000000 + index * 10000}?w=600&h=400&auto=format&fit=crop`}
                      alt={`Lazy loaded image ${index}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceOptimizationDemo;
