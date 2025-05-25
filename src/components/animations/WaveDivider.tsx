import React from 'react';
import { motion } from 'framer-motion';

interface WaveDividerProps {
  position?: 'top' | 'bottom';
  height?: number;
  width?: string;
  className?: string;
  inverted?: boolean;
  animate?: boolean;
  animationDuration?: number;
  fill?: string;
  preserveAspectRatio?: string;
  wavePattern?: 'wave1' | 'wave2' | 'wave3' | 'wave4' | 'wave5';
  gradient?: {
    colors: string[];
    direction?: 'horizontal' | 'vertical' | 'diagonal';
  };
  testId?: string;
}

/**
 * WaveDivider Component
 * 
 * Creates a wave-like divider between sections with various patterns and animation options.
 * 
 * @param position - Position of the divider (default: 'bottom')
 * @param height - Height of the divider in pixels (default: 60)
 * @param width - Width of the divider (default: '100%')
 * @param className - Additional CSS classes
 * @param inverted - Whether to invert the divider (default: false)
 * @param animate - Whether to animate the divider (default: true)
 * @param animationDuration - Duration of the animation in seconds (default: 20)
 * @param fill - Color of the divider (default: 'currentColor')
 * @param preserveAspectRatio - SVG preserveAspectRatio attribute (default: 'none')
 * @param wavePattern - Pattern of the wave (default: 'wave1')
 * @param gradient - Gradient configuration
 * @param testId - Test ID for testing
 */
const WaveDivider: React.FC<WaveDividerProps> = ({
  position = 'bottom',
  height = 60,
  width = '100%',
  className = '',
  inverted = false,
  animate = true,
  animationDuration = 20,
  fill = 'currentColor',
  preserveAspectRatio = 'none',
  wavePattern = 'wave1',
  gradient,
  testId = 'wave-divider'
}) => {
  // Generate a unique ID for the gradient
  const gradientId = React.useMemo(
    () => `wave-gradient-${Math.random().toString(36).substring(2, 9)}`,
    []
  );

  // Define wave patterns
  const getPath = () => {
    const flip = (position === 'top' && !inverted) || (position === 'bottom' && inverted);
    
    switch (wavePattern) {
      case 'wave1':
        return flip
          ? 'M0,0 C150,40 350,0 500,20 C650,40 850,0 1000,30 L1000,100 L0,100 Z'
          : 'M0,100 C150,60 350,100 500,80 C650,60 850,100 1000,70 L1000,0 L0,0 Z';
      case 'wave2':
        return flip
          ? 'M0,0 C200,50 400,20 600,50 C800,80 1000,50 1200,20 L1200,100 L0,100 Z'
          : 'M0,100 C200,50 400,80 600,50 C800,20 1000,50 1200,80 L1200,0 L0,0 Z';
      case 'wave3':
        return flip
          ? 'M0,0 C300,80 600,20 900,80 C1200,20 1500,80 1800,20 L1800,100 L0,100 Z'
          : 'M0,100 C300,20 600,80 900,20 C1200,80 1500,20 1800,80 L1800,0 L0,0 Z';
      case 'wave4':
        return flip
          ? 'M0,0 C80,40 160,0 240,40 C320,80 400,40 480,0 C560,40 640,80 720,40 C800,0 880,40 960,80 L960,100 L0,100 Z'
          : 'M0,100 C80,60 160,100 240,60 C320,20 400,60 480,100 C560,60 640,20 720,60 C800,100 880,60 960,20 L960,0 L0,0 Z';
      case 'wave5':
        return flip
          ? 'M0,0 C50,20 100,40 150,20 C200,0 250,20 300,40 C350,60 400,40 450,20 C500,0 550,20 600,40 C650,60 700,40 750,20 C800,0 850,20 900,40 C950,60 1000,40 1050,20 L1050,100 L0,100 Z'
          : 'M0,100 C50,80 100,60 150,80 C200,100 250,80 300,60 C350,40 400,60 450,80 C500,100 550,80 600,60 C650,40 700,60 750,80 C800,100 850,80 900,60 C950,40 1000,60 1050,80 L1050,0 L0,0 Z';
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

  // Create gradient if provided
  const renderGradient = () => {
    if (!gradient || !gradient.colors || gradient.colors.length < 2) return null;
    
    const { colors, direction = 'horizontal' } = gradient;
    
    // Set gradient coordinates based on direction
    const gradientProps = {
      horizontal: { x1: '0%', y1: '0%', x2: '100%', y2: '0%' },
      vertical: { x1: '0%', y1: '0%', x2: '0%', y2: '100%' },
      diagonal: { x1: '0%', y1: '0%', x2: '100%', y2: '100%' }
    }[direction];
    
    return (
      <defs>
        <linearGradient id={gradientId} {...gradientProps}>
          {colors.map((color, index) => (
            <stop
              key={index}
              offset={`${(index / (colors.length - 1)) * 100}%`}
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
        viewBox="0 0 1200 100"
        preserveAspectRatio={preserveAspectRatio}
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          [position]: 0,
          transform: position === 'top' ? 'rotate(180deg)' : 'none'
        }}
      >
        {gradient && renderGradient()}
        <motion.path
          d={getPath()}
          fill={gradient ? `url(#${gradientId})` : fill}
          variants={animate ? variants : undefined}
          animate={animate ? 'animate' : undefined}
        />
      </svg>
    </div>
  );
};

export default WaveDivider;
