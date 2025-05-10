import React, { ReactNode } from 'react';
import useIntersectionObserver from '../../hooks/useIntersectionObserver';

interface RevealOnScrollProps {
  children: ReactNode;
  className?: string;
  threshold?: number;
  rootMargin?: string;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  duration?: number;
  delay?: number;
}

/**
 * A component that reveals its children when they enter the viewport
 */
const RevealOnScroll: React.FC<RevealOnScrollProps> = ({
  children,
  className = '',
  threshold = 0.1,
  rootMargin = '0px',
  direction = 'up',
  duration = 0.5,
  delay = 0
}) => {
  const [ref, isVisible] = useIntersectionObserver<HTMLDivElement>({
    threshold,
    rootMargin
  });

  // Determine initial transform based on direction
  const getInitialTransform = () => {
    switch (direction) {
      case 'up':
        return 'translateY(40px)';
      case 'down':
        return 'translateY(-40px)';
      case 'left':
        return 'translateX(40px)';
      case 'right':
        return 'translateX(-40px)';
      case 'none':
        return 'none';
      default:
        return 'translateY(40px)';
    }
  };

  return (
    <div
      ref={ref}
      className={`transition-all ${className}`}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'none' : getInitialTransform(),
        transitionDuration: `${duration}s`,
        transitionDelay: `${delay}s`,
        transitionProperty: 'opacity, transform',
        transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)'
      }}
    >
      {children}
    </div>
  );
};

export default RevealOnScroll;
