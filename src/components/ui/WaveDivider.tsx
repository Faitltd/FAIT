import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import useRevealAnimation from '../../hooks/useRevealAnimation';

interface WaveDividerProps {
  height?: number;
  color?: string;
  bgColor?: string;
  className?: string;
  waveCount?: number;
  amplitude?: number;
  flip?: boolean;
  parallax?: boolean;
  parallaxSpeed?: number;
  gradientFrom?: string;
  gradientTo?: string;
  gradientColors?: string[];
  animate?: boolean;
  animationDuration?: number;
}

/**
 * WaveDivider Component
 *
 * A specialized section divider that creates a wave pattern.
 * Supports customization of wave properties, parallax effects, and animations.
 *
 * Enhanced with scroll-linked animations and improved gradient support.
 */
const WaveDivider: React.FC<WaveDividerProps> = ({
  height = 80,
  color = 'white',
  bgColor = 'transparent',
  className = '',
  waveCount = 3,
  amplitude = 20,
  flip = false,
  parallax = true,
  parallaxSpeed = 0.1,
  gradientFrom,
  gradientTo,
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

  // Create parallax effect
  const yOffset = parallax
    ? useTransform(
        scrollYProgress,
        [0, 1],
        [0, height * parallaxSpeed * (flip ? -1 : 1)]
      )
    : 0;

  // Generate a unique ID for the gradient
  const gradientId = `wave-gradient-${Math.random().toString(36).substr(2, 9)}`;

  // Generate the wave path
  const generateWavePath = () => {
    const width = 1440; // Standard width for SVG
    const segmentWidth = width / waveCount;

    let path = `M0,${height + amplitude}`;

    // Generate sine wave pattern
    for (let i = 0; i <= waveCount; i++) {
      const x1 = i * segmentWidth / 2;
      const y1 = height - amplitude;
      const x2 = i * segmentWidth;
      const y2 = height + amplitude;

      path += ` C${x1},${y1} ${x1},${y1} ${x2},${y2}`;
    }

    // Close the path
    path += ` V${height * 2} H0 Z`;

    return path;
  };

  // Determine fill based on whether gradient is specified
  const getFill = () => {
    if (gradientFrom && gradientTo) {
      return `url(#${gradientId})`;
    }
    return color;
  };

  const svgProps = {
    viewBox: `0 0 1440 ${height * 2}`,
    fill: getFill(),
    preserveAspectRatio: 'none',
    style: {
      display: 'block',
      width: '100%',
      height: `${height}px`,
      transform: flip ? 'rotate(180deg)' : 'none',
      backgroundColor: bgColor
    }
  };

  // Enhanced animation variants
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
    }
  };

  // Wave animation
  const waveAnimation = {
    x: [0, -500, 0],
    transition: {
      duration: animationDuration,
      repeat: Infinity,
      ease: "linear"
    }
  };

  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`} style={{ height: `${height}px` }}>
      <motion.svg
        viewBox={`0 0 1440 ${height * 2}`}
        preserveAspectRatio="none"
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        variants={variants}
        style={{
          display: 'block',
          width: '100%',
          height: `${height}px`,
          position: 'absolute',
          top: 0,
          left: 0,
          transform: flip ? 'rotate(180deg)' : 'none',
          backgroundColor: bgColor,
          y: yOffset
        }}
      >
        <defs>
          {/* Support both gradient styles */}
          {gradientFrom && gradientTo && (
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={gradientFrom} />
              <stop offset="100%" stopColor={gradientTo} />
            </linearGradient>
          )}

          {gradientColors && gradientColors.length >= 2 && (
            <linearGradient id={`${gradientId}-multi`} x1="0%" y1="0%" x2="100%" y2="0%">
              {gradientColors.map((color, index) => (
                <stop
                  key={index}
                  offset={`${(index / (gradientColors.length - 1)) * 100}%`}
                  stopColor={color}
                />
              ))}
            </linearGradient>
          )}
        </defs>

        <motion.path
          d={generateWavePath()}
          fill={
            gradientColors && gradientColors.length >= 2
              ? `url(#${gradientId}-multi)`
              : gradientFrom && gradientTo
                ? `url(#${gradientId})`
                : color
          }
          animate={animate ? waveAnimation : undefined}
        />
      </motion.svg>
    </div>
  );
};

export default WaveDivider;
