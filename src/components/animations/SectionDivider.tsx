import React from 'react';
import { motion } from 'framer-motion';

interface SectionDividerProps {
  type?: 'wave' | 'curve' | 'triangle' | 'zigzag' | 'straight';
  position?: 'top' | 'bottom';
  color?: string;
  height?: number;
  width?: string;
  className?: string;
  inverted?: boolean;
  animate?: boolean;
  animationDuration?: number;
  gradientColors?: string[];
  testId?: string;
}

/**
 * SectionDivider Component
 * 
 * Creates a visually appealing divider between sections with various shapes and animation options.
 * 
 * @param type - Shape of the divider (default: 'wave')
 * @param position - Position of the divider (default: 'bottom')
 * @param color - Color of the divider (default: 'currentColor')
 * @param height - Height of the divider in pixels (default: 50)
 * @param width - Width of the divider (default: '100%')
 * @param className - Additional CSS classes
 * @param inverted - Whether to invert the divider (default: false)
 * @param animate - Whether to animate the divider (default: true)
 * @param animationDuration - Duration of the animation in seconds (default: 20)
 * @param gradientColors - Array of colors for gradient (default: undefined)
 * @param testId - Test ID for testing
 */
const SectionDivider: React.FC<SectionDividerProps> = ({
  type = 'wave',
  position = 'bottom',
  color = 'currentColor',
  height = 50,
  width = '100%',
  className = '',
  inverted = false,
  animate = true,
  animationDuration = 20,
  gradientColors,
  testId = 'section-divider'
}) => {
  // Determine the SVG path based on the type
  const getPath = () => {
    const flip = (position === 'top' && !inverted) || (position === 'bottom' && inverted);
    
    switch (type) {
      case 'wave':
        return flip
          ? 'M0,0 C150,40 350,0 500,20 C650,40 850,0 1000,30 L1000,100 L0,100 Z'
          : 'M0,100 C150,60 350,100 500,80 C650,60 850,100 1000,70 L1000,0 L0,0 Z';
      case 'curve':
        return flip
          ? 'M0,0 C500,50 500,50 1000,0 L1000,100 L0,100 Z'
          : 'M0,100 C500,50 500,50 1000,100 L1000,0 L0,0 Z';
      case 'triangle':
        return flip
          ? 'M0,0 L500,50 L1000,0 L1000,100 L0,100 Z'
          : 'M0,100 L500,50 L1000,100 L1000,0 L0,0 Z';
      case 'zigzag':
        return flip
          ? 'M0,0 L250,30 L500,0 L750,30 L1000,0 L1000,100 L0,100 Z'
          : 'M0,100 L250,70 L500,100 L750,70 L1000,100 L1000,0 L0,0 Z';
      case 'straight':
        return flip
          ? 'M0,0 L1000,0 L1000,100 L0,100 Z'
          : 'M0,100 L1000,100 L1000,0 L0,0 Z';
      default:
        return 'M0,100 C150,60 350,100 500,80 C650,60 850,100 1000,70 L1000,0 L0,0 Z';
    }
  };

  // Animation variants
  const variants = {
    animate: {
      x: [0, -1000, 0],
      transition: {
        duration: animationDuration,
        repeat: Infinity,
        repeatType: 'loop',
        ease: 'linear'
      }
    }
  };

  // Create gradient if colors are provided
  const createGradient = () => {
    if (!gradientColors || gradientColors.length < 2) return null;

    const id = `section-divider-gradient-${Math.random().toString(36).substring(2, 9)}`;
    
    return (
      <defs>
        <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="0%">
          {gradientColors.map((color, index) => (
            <stop
              key={index}
              offset={`${(index / (gradientColors.length - 1)) * 100}%`}
              stopColor={color}
            />
          ))}
        </linearGradient>
      </defs>
    );
  };

  return (
    <div
      className={className}
      style={{
        position: 'relative',
        width,
        height: `${height}px`,
        overflow: 'hidden',
        [position]: 0,
        zIndex: 1
      }}
      data-testid={testId}
    >
      <svg
        viewBox="0 0 1000 100"
        preserveAspectRatio="none"
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          [position]: 0,
          transform: position === 'top' ? 'rotate(180deg)' : 'none'
        }}
      >
        {gradientColors && createGradient()}
        <motion.path
          d={getPath()}
          fill={gradientColors ? `url(#${createGradient()?.props.children.props.id})` : color}
          variants={animate ? variants : undefined}
          animate={animate ? 'animate' : undefined}
        />
      </svg>
    </div>
  );
};

export default SectionDivider;
