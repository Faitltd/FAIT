import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import useRevealAnimation from '../../hooks/useRevealAnimation';

interface SectionDividerProps {
  type?: 'wave' | 'curve' | 'diagonal' | 'triangle' | 'straight';
  color?: string;
  bgColor?: string;
  height?: number;
  className?: string;
  flip?: boolean;
  parallax?: boolean;
  parallaxSpeed?: number;
  gradientColors?: string[];
  animate?: boolean;
  animationDuration?: number;
}

/**
 * SectionDivider Component
 *
 * Creates visually appealing dividers between sections using SVG shapes.
 * Supports different shapes, parallax effects, and animations.
 *
 * Enhanced with scroll-linked animations and gradient support.
 */
const SectionDivider: React.FC<SectionDividerProps> = ({
  type = 'wave',
  color = 'white',
  bgColor = 'transparent',
  height = 80,
  className = '',
  flip = false,
  parallax = true,
  parallaxSpeed = 0.1,
  gradientColors,
  animate = false,
  animationDuration = 20
}) => {
  // Use our custom hook for reveal animations
  const { ref, isInView } = useRevealAnimation({
    threshold: 0.1,
    triggerOnce: true
  });

  // Use scroll progress for parallax effect if enabled
  const { scrollYProgress } = useScroll();

  // Generate a unique ID for the gradient
  const gradientId = `section-divider-gradient-${Math.random().toString(36).substr(2, 9)}`;

  // Create parallax effect
  const yOffset = parallax
    ? useTransform(
        scrollYProgress,
        [0, 1],
        [0, height * parallaxSpeed * (flip ? -1 : 1)]
      )
    : 0;

  // Generate SVG path based on type
  const getPath = () => {
    const width = 1440; // Standard width for SVG

    switch (type) {
      case 'wave':
        return `M0,${height} C320,${height * 0.3} 480,${height * 1.4} 720,${height * 0.7} C960,0 1200,${height * 1.2} 1440,${height * 0.5} V${height * 2} H0 Z`;
      case 'curve':
        return `M0,${height} C480,0 960,0 1440,${height} V${height * 2} H0 Z`;
      case 'diagonal':
        return `M0,0 L1440,${height} V${height * 2} H0 Z`;
      case 'straight':
        return `M0,${height} L1440,${height} V${height * 2} H0 Z`;
      case 'triangle':
        return `M0,${height} L720,0 L1440,${height} V${height * 2} H0 Z`;
      default:
        return `M0,${height} C320,${height * 0.3} 480,${height * 1.4} 720,${height * 0.7} C960,0 1200,${height * 1.2} 1440,${height * 0.5} V${height * 2} H0 Z`;
    }
  };

  // SVG properties
  const svgProps = {
    viewBox: `0 0 1440 ${height * 2}`,
    preserveAspectRatio: 'none',
    style: {
      display: 'block',
      width: '100%',
      height: `${height}px`,
      transform: flip ? 'rotate(180deg)' : 'none',
      backgroundColor: bgColor
    }
  };

  // Animation variants
  const variants = {
    hidden: {
      opacity: 0,
      y: flip ? -20 : 20
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    },
    animate: {
      x: [0, 100, 0],
      transition: {
        duration: animationDuration,
        repeat: Infinity,
        ease: "linear"
      }
    }
  };

  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`} style={{ height: `${height}px` }}>
      <motion.svg
        {...svgProps}
        initial="hidden"
        animate={isInView ? (animate ? ["visible", "animate"] : "visible") : "hidden"}
        variants={variants}
        style={{
          ...svgProps.style,
          position: 'absolute',
          top: 0,
          left: 0,
          y: yOffset
        }}
      >
        {gradientColors ? (
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
              {gradientColors.map((color, index) => (
                <stop
                  key={index}
                  offset={`${(index / (gradientColors.length - 1)) * 100}%`}
                  stopColor={color}
                />
              ))}
            </linearGradient>
          </defs>
        ) : null}

        <path
          d={getPath()}
          fill={gradientColors ? `url(#${gradientId})` : color}
        />
      </motion.svg>
    </div>
  );
};

export default SectionDivider;
