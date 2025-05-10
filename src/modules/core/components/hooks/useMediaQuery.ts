/**
 * useMediaQuery Hook
 * 
 * This hook provides media query functionality for responsive components.
 */

import { useEffect, useState } from 'react';

/**
 * Predefined breakpoints
 */
export const breakpoints = {
  xs: '(max-width: 575.98px)',
  sm: '(min-width: 576px) and (max-width: 767.98px)',
  md: '(min-width: 768px) and (max-width: 991.98px)',
  lg: '(min-width: 992px) and (max-width: 1199.98px)',
  xl: '(min-width: 1200px)',
  smUp: '(min-width: 576px)',
  mdUp: '(min-width: 768px)',
  lgUp: '(min-width: 992px)',
  xlUp: '(min-width: 1200px)',
  smDown: '(max-width: 767.98px)',
  mdDown: '(max-width: 991.98px)',
  lgDown: '(max-width: 1199.98px)',
};

/**
 * Hook for media queries
 * 
 * @param query - Media query string or predefined breakpoint
 * @returns Whether the media query matches
 * 
 * @example
 * ```tsx
 * // Using a predefined breakpoint
 * const isMobile = useMediaQuery('xs');
 * 
 * // Using a custom media query
 * const isLandscape = useMediaQuery('(orientation: landscape)');
 * 
 * return (
 *   <div>
 *     {isMobile ? 'Mobile View' : 'Desktop View'}
 *     {isLandscape && <div>Landscape Mode</div>}
 *   </div>
 * );
 * ```
 */
export function useMediaQuery(query: string | keyof typeof breakpoints): boolean {
  // Get the actual media query string
  const mediaQuery = breakpoints[query as keyof typeof breakpoints] || query;
  
  // Initialize with the current match state
  const [matches, setMatches] = useState(() => {
    // Check if window is defined (for SSR)
    if (typeof window !== 'undefined') {
      return window.matchMedia(mediaQuery).matches;
    }
    return false;
  });

  useEffect(() => {
    // Check if window is defined (for SSR)
    if (typeof window === 'undefined') {
      return;
    }

    const mediaQueryList = window.matchMedia(mediaQuery);
    
    // Update the state when the media query changes
    const updateMatches = (e: MediaQueryListEvent) => {
      setMatches(e.matches);
    };

    // Add the event listener
    mediaQueryList.addEventListener('change', updateMatches);
    
    // Set the initial value
    setMatches(mediaQueryList.matches);
    
    // Clean up
    return () => {
      mediaQueryList.removeEventListener('change', updateMatches);
    };
  }, [mediaQuery]);

  return matches;
}

export default useMediaQuery;
