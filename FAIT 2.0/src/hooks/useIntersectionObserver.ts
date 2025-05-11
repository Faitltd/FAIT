import { useEffect, useState, useRef, RefObject } from 'react';

interface IntersectionObserverOptions {
  root?: Element | null;
  rootMargin?: string;
  threshold?: number | number[];
}

/**
 * Custom hook for detecting when an element enters the viewport
 * @param options - IntersectionObserver options
 * @returns [ref, isVisible] - Ref to attach to the element and boolean indicating if element is visible
 */
export function useIntersectionObserver<T extends Element>(
  options: IntersectionObserverOptions = {}
): [RefObject<T>, boolean] {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<T>(null);
  
  const { root = null, rootMargin = '0px', threshold = 0.1 } = options;
  
  useEffect(() => {
    if (!ref.current) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Update state when observer callback fires
        setIsVisible(entry.isIntersecting);
      },
      { root, rootMargin, threshold }
    );
    
    const currentRef = ref.current;
    observer.observe(currentRef);
    
    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [root, rootMargin, threshold]);
  
  return [ref, isVisible];
}

export default useIntersectionObserver;
