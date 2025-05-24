/**
 * useScrollReveal Hook
 * 
 * This hook provides scroll reveal functionality for components.
 */

import { useEffect, useRef, useState } from 'react';

export interface UseScrollRevealOptions {
  /** Threshold for revealing (0-1) */
  threshold?: number;
  /** Root margin for the intersection observer */
  rootMargin?: string;
  /** Whether to trigger only once */
  triggerOnce?: boolean;
  /** Delay before revealing in seconds */
  delay?: number;
}

/**
 * Hook for scroll reveal animations
 * 
 * @param options - Scroll reveal options
 * @returns Object with ref and isRevealed state
 * 
 * @example
 * ```tsx
 * const { ref, isRevealed } = useScrollReveal({ threshold: 0.2 });
 * 
 * return (
 *   <div
 *     ref={ref}
 *     style={{
 *       opacity: isRevealed ? 1 : 0,
 *       transform: isRevealed ? 'translateY(0)' : 'translateY(20px)',
 *       transition: 'opacity 0.6s ease, transform 0.6s ease'
 *     }}
 *   >
 *     Content to reveal on scroll
 *   </div>
 * );
 * ```
 */
export function useScrollReveal({
  threshold = 0.2,
  rootMargin = '0px',
  triggerOnce = true,
  delay = 0
}: UseScrollRevealOptions = {}) {
  const ref = useRef<HTMLElement | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const currentRef = ref.current;
    if (!currentRef) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        setIsInView(entry.isIntersecting);
      },
      { threshold, rootMargin }
    );

    observer.observe(currentRef);

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [threshold, rootMargin]);

  useEffect(() => {
    if (isInView) {
      const timer = setTimeout(() => {
        setIsRevealed(true);
      }, delay * 1000);

      return () => clearTimeout(timer);
    } else if (!triggerOnce) {
      setIsRevealed(false);
    }
  }, [isInView, delay, triggerOnce]);

  return { ref, isRevealed };
}

export default useScrollReveal;
