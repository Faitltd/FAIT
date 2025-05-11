import React, { ReactNode, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

interface ParallaxLayerProps {
  children: ReactNode;
  speed?: number;
  direction?: 'vertical' | 'horizontal' | 'both';
  className?: string;
  startOffset?: number;
  endOffset?: number;
  zIndex?: number;
  opacity?: [number, number];
  scale?: [number, number];
  rotate?: [number, number];
  translateX?: [number, number];
  translateY?: [number, number];
  transformOrigin?: string;
  position?: 'absolute' | 'relative' | 'fixed';
  as?: React.ElementType;
  testId?: string;
  targetRef?: React.RefObject<HTMLElement>;
  offsetOptions?: {
    start?: string;
    end?: string;
  };
}

/**
 * ParallaxLayer Component
 *
 * Creates a parallax effect layer that moves at a different speed than the scroll.
 * Can be configured for vertical, horizontal, or both directions.
 *
 * Enhanced with additional transform options and better performance.
 */
const ParallaxLayer: React.FC<ParallaxLayerProps> = ({
  children,
  speed = 0.5,
  direction = 'vertical',
  className = '',
  startOffset = 0,
  endOffset = 1,
  zIndex = 0,
  opacity,
  scale,
  rotate,
  translateX,
  translateY,
  transformOrigin = 'center center',
  position = 'absolute',
  as: Component = motion.div,
  testId = 'parallax-layer',
  targetRef,
  offsetOptions = { start: 'start end', end: 'end start' }
}) => {
  // Create a ref if one isn't provided
  const localRef = useRef<HTMLDivElement>(null);
  const ref = targetRef || localRef;

  // Use Framer Motion's scroll hook with target element
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: [offsetOptions.start || 'start end', offsetOptions.end || 'end start']
  });

  // Calculate transform values based on scroll position
  const yTransform = direction === 'vertical' || direction === 'both'
    ? useTransform(
        scrollYProgress,
        [startOffset, endOffset],
        [`${startOffset * 100}%`, `${endOffset * 100 * speed}%`]
      )
    : undefined;

  const xTransform = direction === 'horizontal' || direction === 'both'
    ? useTransform(
        scrollYProgress,
        [startOffset, endOffset],
        [`${startOffset * 100}%`, `${endOffset * 100 * speed}%`]
      )
    : undefined;

  // Optional transforms
  const opacityTransform = opacity
    ? useTransform(scrollYProgress, [startOffset, endOffset], opacity)
    : undefined;

  const scaleTransform = scale
    ? useTransform(scrollYProgress, [startOffset, endOffset], scale)
    : undefined;

  const rotateTransform = rotate
    ? useTransform(scrollYProgress, [startOffset, endOffset], rotate)
    : undefined;

  // Additional transforms
  const translateXTransform = translateX
    ? useTransform(scrollYProgress, [startOffset, endOffset], translateX.map(val => `${val}px`))
    : undefined;

  const translateYTransform = translateY
    ? useTransform(scrollYProgress, [startOffset, endOffset], translateY.map(val => `${val}px`))
    : undefined;

  return (
    <Component
      ref={localRef}
      className={className}
      style={{
        y: yTransform,
        x: xTransform,
        opacity: opacityTransform,
        scale: scaleTransform,
        rotate: rotateTransform,
        translateX: translateXTransform,
        translateY: translateYTransform,
        transformOrigin,
        zIndex,
        position,
        willChange: 'transform, opacity'
      }}
      data-testid={testId}
    >
      {children}
    </Component>
  );
};

export default ParallaxLayer;
