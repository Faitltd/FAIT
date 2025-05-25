import React, { ReactNode, Children, cloneElement, isValidElement, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

interface TransformConfig {
  property: 'x' | 'y' | 'rotate' | 'scale' | 'opacity' | 'filter' | 'backgroundColor' | 'color' | 'translateX' | 'translateY' | 'blur';
  inputRange: number[];
  outputRange: number[] | string[];
  ease?: [number, number, number, number];
}

interface ScrollMotionWrapperProps {
  children: ReactNode;
  transforms?: TransformConfig[];
  className?: string;
  as?: React.ElementType;
  staggerChildren?: boolean;
  staggerDelay?: number;
  containerRef?: React.RefObject<HTMLElement>;
  offset?: [string, string];
  testId?: string;
  transformOrigin?: string;
  willChange?: string;
  effects?: {
    opacity?: [number, number];
    scale?: [number, number];
    rotate?: [number, number];
    translateX?: [number, number];
    translateY?: [number, number];
    blur?: [number, number];
    backgroundColor?: [string, string];
    textColor?: [string, string];
  };
  scrollRange?: [number, number];
}

/**
 * ScrollMotionWrapper Component
 *
 * A high-order component that applies scroll-linked animations to its children.
 * Can apply multiple transforms and stagger animations across children.
 *
 * Enhanced with container targeting and improved performance.
 */
const ScrollMotionWrapper: React.FC<ScrollMotionWrapperProps> = ({
  children,
  transforms = [],
  className = '',
  as: Component = motion.div,
  staggerChildren = false,
  staggerDelay = 0.1,
  containerRef: externalRef,
  offset = ['start end', 'end start'],
  testId = 'scroll-motion-wrapper',
  transformOrigin = 'center center',
  willChange = 'transform, opacity, filter, background-color, color',
  effects,
  scrollRange = [0, 1]
}) => {
  // Create a ref if one isn't provided
  const localRef = useRef<HTMLDivElement>(null);
  const containerRef = externalRef || localRef;

  // Use scroll progress with optional container targeting
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset
  });

  // Create transform objects from the transforms array
  const transformPropsFromArray = transforms.reduce((acc, transform) => {
    const { property, inputRange, outputRange, ease } = transform;

    acc[property] = useTransform(
      scrollYProgress,
      inputRange,
      outputRange,
      { ease }
    );

    return acc;
  }, {} as Record<string, any>);

  // Create transform objects from the effects object
  const transformPropsFromEffects: Record<string, any> = {};

  if (effects) {
    if (effects.opacity) {
      transformPropsFromEffects.opacity = useTransform(
        scrollYProgress,
        scrollRange,
        effects.opacity
      );
    }

    if (effects.scale) {
      transformPropsFromEffects.scale = useTransform(
        scrollYProgress,
        scrollRange,
        effects.scale
      );
    }

    if (effects.rotate) {
      transformPropsFromEffects.rotate = useTransform(
        scrollYProgress,
        scrollRange,
        effects.rotate
      );
    }

    if (effects.translateX) {
      transformPropsFromEffects.x = useTransform(
        scrollYProgress,
        scrollRange,
        effects.translateX.map(val => `${val}px`)
      );
    }

    if (effects.translateY) {
      transformPropsFromEffects.y = useTransform(
        scrollYProgress,
        scrollRange,
        effects.translateY.map(val => `${val}px`)
      );
    }

    if (effects.blur) {
      transformPropsFromEffects.filter = useTransform(
        scrollYProgress,
        scrollRange,
        effects.blur.map(val => `blur(${val}px)`)
      );
    }

    if (effects.backgroundColor) {
      transformPropsFromEffects.backgroundColor = useTransform(
        scrollYProgress,
        scrollRange,
        effects.backgroundColor
      );
    }

    if (effects.textColor) {
      transformPropsFromEffects.color = useTransform(
        scrollYProgress,
        scrollRange,
        effects.textColor
      );
    }
  }

  // Combine both transform objects
  const transformProps = {
    ...transformPropsFromArray,
    ...transformPropsFromEffects,
    transformOrigin,
    willChange
  };

  // If not staggering children, apply transforms to the wrapper
  if (!staggerChildren) {
    return (
      <Component
        ref={localRef}
        className={className}
        style={transformProps}
        data-testid={testId}
      >
        {children}
      </Component>
    );
  }

  // If staggering, apply transforms to each child with increasing delay
  return (
    <div className={className} ref={localRef} data-testid={testId}>
      {Children.map(children, (child, index) => {
        if (!isValidElement(child)) return child;

        // Create staggered variants
        const variants = {
          initial: {},
          animate: {
            transition: {
              delay: index * staggerDelay
            }
          }
        };

        // Clone the child element and add motion props
        return cloneElement(child, {
          ...child.props,
          as: motion.div,
          style: {
            ...child.props.style,
            ...transformProps
          },
          variants,
          initial: "initial",
          animate: "animate"
        });
      })}
    </div>
  );
};

export default ScrollMotionWrapper;
