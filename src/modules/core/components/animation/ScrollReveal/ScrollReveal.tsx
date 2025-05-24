/**
 * ScrollReveal Component
 * 
 * A component that reveals its children when scrolled into view.
 */

import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';
import {
  BaseComponentProps,
  WithChildrenProps,
  ScrollRevealProps as ScrollRevealStyleProps
} from '../../types';
import { useScrollReveal } from '../../hooks';
import { composeClasses } from '../../utils';

export interface ScrollRevealProps extends 
  BaseComponentProps,
  WithChildrenProps,
  ScrollRevealStyleProps {
  /** Component tag */
  as?: keyof JSX.IntrinsicElements;
  /** Direction for slide animation */
  direction?: 'up' | 'down' | 'left' | 'right';
  /** Distance to slide (in pixels) */
  distance?: number;
  /** Whether to stagger children animations */
  stagger?: boolean;
  /** Stagger delay between children (in seconds) */
  staggerDelay?: number;
}

/**
 * ScrollReveal component
 * 
 * @example
 * ```tsx
 * <ScrollReveal>
 *   <p>This content will be revealed when scrolled into view</p>
 * </ScrollReveal>
 * ```
 */
export const ScrollReveal = forwardRef<HTMLElement, ScrollRevealProps>(({
  className,
  style,
  children,
  as: Component = motion.div,
  revealOnScroll = true,
  threshold = 0.2,
  revealAnimation = 'fade',
  revealDuration = 0.6,
  revealDelay = 0,
  direction = 'up',
  distance = 20,
  stagger = false,
  staggerDelay = 0.1,
  ...props
}, ref) => {
  // Use scroll reveal hook
  const { ref: scrollRef, isRevealed } = useScrollReveal({
    threshold,
    delay: revealDelay,
    triggerOnce: true
  });
  
  // Combine refs
  const combinedRef = (node: HTMLElement) => {
    if (typeof ref === 'function') {
      ref(node);
    } else if (ref) {
      ref.current = node;
    }
    scrollRef.current = node;
  };
  
  // Determine animation variants
  const getAnimationVariants = () => {
    const variants: any = {
      hidden: {},
      visible: {
        transition: {
          duration: revealDuration,
          delay: revealDelay
        }
      }
    };
    
    // Add fade animation
    if (revealAnimation === 'fade' || revealAnimation === 'slide') {
      variants.hidden.opacity = 0;
      variants.visible.opacity = 1;
    }
    
    // Add slide animation
    if (revealAnimation === 'slide') {
      switch (direction) {
        case 'up':
          variants.hidden.y = distance;
          variants.visible.y = 0;
          break;
        case 'down':
          variants.hidden.y = -distance;
          variants.visible.y = 0;
          break;
        case 'left':
          variants.hidden.x = distance;
          variants.visible.x = 0;
          break;
        case 'right':
          variants.hidden.x = -distance;
          variants.visible.x = 0;
          break;
      }
    }
    
    // Add scale animation
    if (revealAnimation === 'scale') {
      variants.hidden.scale = 0.8;
      variants.visible.scale = 1;
    }
    
    // Add rotate animation
    if (revealAnimation === 'rotate') {
      variants.hidden.rotate = -5;
      variants.visible.rotate = 0;
    }
    
    // Add stagger for children
    if (stagger) {
      variants.visible.transition.staggerChildren = staggerDelay;
    }
    
    return variants;
  };
  
  // Get animation variants
  const variants = getAnimationVariants();
  
  // Compose classes
  const revealClasses = composeClasses(
    'scroll-reveal',
    className
  );

  // If not using scroll reveal, render children directly
  if (!revealOnScroll) {
    return (
      <Component
        ref={ref as any}
        className={revealClasses}
        style={style}
        {...props}
      >
        {children}
      </Component>
    );
  }

  return (
    <Component
      ref={combinedRef as any}
      className={revealClasses}
      style={style}
      initial="hidden"
      animate={isRevealed ? 'visible' : 'hidden'}
      variants={variants}
      {...props}
    >
      {stagger ? (
        React.Children.map(children, child => (
          <motion.div variants={variants}>
            {child}
          </motion.div>
        ))
      ) : (
        children
      )}
    </Component>
  );
});

ScrollReveal.displayName = 'ScrollReveal';

export default ScrollReveal;
