import { useState, useEffect } from 'react';

/**
 * Custom hook for responsive design
 * @param query - CSS media query string (e.g. '(max-width: 768px)')
 * @returns boolean indicating if the media query matches
 */
export function useMediaQuery(query: string): boolean {
  // Initialize with the current match state
  const getMatches = (query: string): boolean => {
    // Check if window is available (for SSR)
    if (typeof window !== 'undefined') {
      return window.matchMedia(query).matches;
    }
    return false;
  };

  const [matches, setMatches] = useState<boolean>(getMatches(query));

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    
    // Update the state initially and whenever the media query changes
    const handleChange = (): void => {
      setMatches(mediaQuery.matches);
    };
    
    // Set initial value
    handleChange();
    
    // Add event listener for subsequent changes
    mediaQuery.addEventListener('change', handleChange);
    
    // Clean up
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [query]);

  return matches;
}

/**
 * Predefined breakpoints for common screen sizes
 */
export const breakpoints = {
  xs: '(max-width: 480px)',
  sm: '(max-width: 640px)',
  md: '(max-width: 768px)',
  lg: '(max-width: 1024px)',
  xl: '(max-width: 1280px)',
  '2xl': '(max-width: 1536px)',
};

/**
 * Hook for checking if the current viewport is mobile
 * @returns boolean indicating if the viewport is mobile
 */
export function useMobile(): boolean {
  return useMediaQuery(breakpoints.md);
}

/**
 * Hook for checking if the current viewport is tablet
 * @returns boolean indicating if the viewport is tablet
 */
export function useTablet(): boolean {
  return useMediaQuery(`(min-width: 641px) and ${breakpoints.lg}`);
}

/**
 * Hook for checking if the current viewport is desktop
 * @returns boolean indicating if the viewport is desktop
 */
export function useDesktop(): boolean {
  return useMediaQuery(`(min-width: 1025px)`);
}

export default useMediaQuery;
