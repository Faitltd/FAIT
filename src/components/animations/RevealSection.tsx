import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';
import useRevealAnimation from '../../hooks/useRevealAnimation';

interface RevealSectionProps {
  children: ReactNode;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  delay?: number;
  duration?: number;
  threshold?: number;
  className?: string;
  triggerOnce?: boolean;
  distance?: number;
  rootMargin?: string;
  as?: React.ElementType;
  staggerChildren?: boolean;
  staggerDelay?: number;
  testId?: string;
}

/**
 * RevealSection Component
 *
 * A component that reveals its children when they enter the viewport.
 * Uses Framer Motion for smooth animations with configurable direction, duration, and delay.
 *
 * Enhanced with useRevealAnimation hook for better performance and flexibility.
 */
const RevealSection: React.FC<RevealSectionProps> = ({
  children,
  direction = 'up',
  delay = 0,
  duration = 0.6,
  threshold = 0.2,
  className = '',
  triggerOnce = true,
  distance = 20,
  rootMargin = '0px',
  as: Component = motion.div,
  staggerChildren = false,
  staggerDelay = 0.1,
  testId = 'reveal-section'
}) => {
  // Use our custom hook for reveal animations
  const { ref, isInView } = useRevealAnimation({
    threshold,
    rootMargin,
    triggerOnce,
    delay
  });

  // Determine initial transform based on direction
  const getInitialTransform = () => {
    switch (direction) {
      case 'up':
        return { y: distance };
      case 'down':
        return { y: -distance };
      case 'left':
        return { x: distance };
      case 'right':
        return { x: -distance };
      case 'none':
        return {};
      default:
        return { y: distance };
    }
  };

  // Animation variants
  const variants = {
    hidden: {
      opacity: 0,
      ...getInitialTransform()
    },
    visible: {
      opacity: 1,
      y: 0,
      x: 0,
      transition: {
        duration,
        delay,
        ease: [0.25, 0.1, 0.25, 1.0], // Cubic bezier easing
        ...(staggerChildren && {
          staggerChildren: staggerDelay,
          delayChildren: delay
        })
      }
    }
  };

  // Child variants for staggered animations
  const childVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.25, 0.1, 0.25, 1.0]
      }
    }
  };

  return (
    <Component
      ref={ref}
      className={className}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={variants}
      data-testid={testId}
      data-visible={isInView}
    >
      {staggerChildren ? (
        React.Children.map(children, (child, index) => (
          <motion.div key={index} variants={childVariants}>
            {child}
          </motion.div>
        ))
      ) : (
        children
      )}
    </Component>
  );
};

export default RevealSection;
