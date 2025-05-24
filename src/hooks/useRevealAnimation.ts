import { useRef, useState, useEffect } from 'react';
import { useInView } from 'framer-motion';

interface UseRevealAnimationOptions {
  triggerOnce?: boolean;
  threshold?: number;
  rootMargin?: string;
  delay?: number;
}

/**
 * Custom hook for reveal animations
 *
 * Uses Framer Motion's useInView hook to detect when an element enters the viewport.
 * Provides a ref to attach to the element and a boolean indicating if it's in view.
 */
export function useRevealAnimation({
  triggerOnce = true,
  threshold = 0.2,
  rootMargin = '0px',
  delay = 0
}: UseRevealAnimationOptions = {}) {
  const ref = useRef(null);
  const isInView = useInView(ref, {
    once: triggerOnce,
    amount: threshold,
    margin: rootMargin
  });

  // Add delayed reveal if needed
  const [isRevealed, setIsRevealed] = useState(false);

  useEffect(() => {
    if (isInView && !isRevealed && delay > 0) {
      const timer = setTimeout(() => {
        setIsRevealed(true);
      }, delay * 1000);

      return () => clearTimeout(timer);
    } else if (isInView && !isRevealed) {
      setIsRevealed(true);
    }
  }, [isInView, isRevealed, delay]);

  return { ref, isInView: delay > 0 ? isRevealed : isInView };
}

/**
 * Alternative implementation using IntersectionObserver directly
 * This can be used if you prefer not to use Framer Motion
 */
export function useRevealAnimationWithIntersectionObserver({
  triggerOnce = true,
  threshold = 0.2,
  rootMargin = '0px',
  delay = 0
}: UseRevealAnimationOptions = {}) {
  const ref = useRef<HTMLElement | null>(null);
  const [isInView, setIsInView] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);

  useEffect(() => {
    const currentRef = ref.current;
    if (!currentRef) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        setIsInView(entry.isIntersecting);

        // If triggerOnce is true and the element is in view, disconnect the observer
        if (triggerOnce && entry.isIntersecting) {
          observer.disconnect();
        }
      },
      {
        threshold,
        rootMargin
      }
    );

    observer.observe(currentRef);

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [triggerOnce, threshold, rootMargin]);

  // Handle delayed reveal
  useEffect(() => {
    if (isInView && !isRevealed && delay > 0) {
      const timer = setTimeout(() => {
        setIsRevealed(true);
      }, delay * 1000);

      return () => clearTimeout(timer);
    } else if (isInView && !isRevealed) {
      setIsRevealed(true);
    }
  }, [isInView, isRevealed, delay]);

  return { ref, isInView: delay > 0 ? isRevealed : isInView };
}

export default useRevealAnimation;
