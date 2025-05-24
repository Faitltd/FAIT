/**
 * Advanced Lazy Loading Utilities
 * 
 * This module provides enhanced lazy loading capabilities with:
 * - Preloading: Load components before they're needed
 * - Prefetching: Load components during idle time
 * - Chunk naming: Better debugging and monitoring
 * - Error boundaries: Graceful failure handling
 * - Loading indicators: Better user experience
 */

import React, { lazy, ComponentType } from 'react';

interface LazyLoadOptions {
  /** Component name for better debugging */
  name?: string;
  /** Preload the component immediately */
  preload?: boolean;
  /** Prefetch the component during browser idle time */
  prefetch?: boolean;
  /** Retry loading on failure */
  retry?: boolean;
  /** Number of retry attempts */
  retryAttempts?: number;
  /** Delay between retry attempts (ms) */
  retryDelay?: number;
  /** Fallback component to show while loading */
  fallback?: React.ReactNode;
  /** Callback when component is loaded */
  onLoad?: () => void;
  /** Callback when component fails to load */
  onError?: (error: Error) => void;
}

// Track loaded and loading chunks
const loadedChunks = new Set<string>();
const loadingChunks = new Map<string, Promise<any>>();

/**
 * Enhanced lazy loading with preloading, prefetching, and better error handling
 */
export function lazyLoad<T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>,
  options: LazyLoadOptions = {}
): React.LazyExoticComponent<T> {
  const {
    name = 'UnnamedComponent',
    preload = false,
    prefetch = true,
    retry = true,
    retryAttempts = 3,
    retryDelay = 1000,
    onLoad,
    onError
  } = options;

  // Create enhanced factory function with retry logic
  const enhancedFactory = () => {
    const load = async (attempt = 0): Promise<{ default: T }> => {
      try {
        const result = await factory();
        
        // Track successful load
        loadedChunks.add(name);
        loadingChunks.delete(name);
        
        // Call onLoad callback
        if (onLoad) {
          onLoad();
        }
        
        return result;
      } catch (error) {
        // Retry logic
        if (retry && attempt < retryAttempts) {
          console.warn(`Failed to load component "${name}", retrying (${attempt + 1}/${retryAttempts})...`);
          
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          
          return load(attempt + 1);
        }
        
        // Call onError callback
        if (onError && error instanceof Error) {
          onError(error);
        }
        
        // Remove from loading chunks
        loadingChunks.delete(name);
        
        throw error;
      }
    };

    // Return or create promise
    if (loadingChunks.has(name)) {
      return loadingChunks.get(name);
    }
    
    const promise = load();
    loadingChunks.set(name, promise);
    return promise;
  };

  // Preload if requested
  if (preload) {
    preloadComponent(name, enhancedFactory);
  } 
  // Prefetch if requested
  else if (prefetch) {
    prefetchComponent(name, enhancedFactory);
  }

  return lazy(enhancedFactory);
}

/**
 * Preload a component immediately
 */
export function preloadComponent(name: string, factory: () => Promise<any>): void {
  if (loadedChunks.has(name) || loadingChunks.has(name)) {
    return;
  }
  
  const promise = factory();
  loadingChunks.set(name, promise);
}

/**
 * Prefetch a component during browser idle time
 */
export function prefetchComponent(name: string, factory: () => Promise<any>): void {
  if (loadedChunks.has(name) || loadingChunks.has(name)) {
    return;
  }
  
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(() => {
      const promise = factory();
      loadingChunks.set(name, promise);
    });
  } else {
    // Fallback for browsers that don't support requestIdleCallback
    setTimeout(() => {
      const promise = factory();
      loadingChunks.set(name, promise);
    }, 1000);
  }
}

/**
 * Preload components based on route
 */
export function preloadRouteComponents(route: string): void {
  // Map routes to components that should be preloaded
  const routeComponentMap: Record<string, (() => Promise<any>)[]> = {
    '/': [
      () => import('../pages/auth/LoginPage'),
      () => import('../pages/auth/SignupPage')
    ],
    '/dashboard': [
      () => import('../pages/dashboard/ClientDashboard'),
      () => import('../pages/dashboard/ServiceAgentDashboard'),
      () => import('../pages/dashboard/AdminDashboard')
    ],
    '/services': [
      () => import('../pages/services/ServiceSearchPage')
    ]
    // Add more routes as needed
  };
  
  const componentsToPreload = routeComponentMap[route];
  
  if (componentsToPreload) {
    componentsToPreload.forEach((factory, index) => {
      preloadComponent(`RouteComponent_${route}_${index}`, factory);
    });
  }
}
