import React, { ReactNode } from 'react';
import { motion, useScroll, useTransform, MotionValue } from 'framer-motion';

interface ParallaxBackgroundProps {
  children?: ReactNode;
  image: string;
  overlayColor?: string;
  overlayOpacity?: number;
  speed?: number;
  className?: string;
  height?: string;
  topOffset?: string;
  customY?: MotionValue<number>;
  zIndex?: number;
  blur?: number;
}

/**
 * A component that creates a parallax background with optional overlay
 * 
 * @param image - URL of the background image
 * @param overlayColor - Color of the overlay (default: 'rgba(0, 0, 0, 0.4)')
 * @param overlayOpacity - Opacity of the overlay (default: 0.6)
 * @param speed - Speed of the parallax effect (default: 0.2)
 * @param className - Additional CSS classes
 * @param height - Height of the background (default: '120%')
 * @param topOffset - Top offset of the background (default: '-10%')
 * @param customY - Custom motion value for y position (overrides default parallax)
 * @param zIndex - Z-index of the background (default: 0)
 * @param blur - Blur amount in pixels (default: 0)
 */
const ParallaxBackground: React.FC<ParallaxBackgroundProps> = ({
  children,
  image,
  overlayColor = 'rgba(0, 0, 0, 0.4)',
  overlayOpacity = 0.6,
  speed = 0.2,
  className = '',
  height = '120%',
  topOffset = '-10%',
  customY,
  zIndex = 0,
  blur = 0
}) => {
  const { scrollY } = useScroll();
  const y = customY || useTransform(scrollY, [0, 1000], [0, 1000 * speed]);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Parallax Background */}
      <motion.div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${image})`,
          y,
          height,
          top: topOffset,
          zIndex,
          filter: blur > 0 ? `blur(${blur}px)` : undefined
        }}
      />
      
      {/* Overlay */}
      {overlayColor && (
        <div 
          className="absolute inset-0 w-full h-full" 
          style={{ 
            backgroundColor: overlayColor,
            opacity: overlayOpacity,
            zIndex: zIndex + 1
          }}
        />
      )}
      
      {/* Content */}
      {children && (
        <div className="relative z-10">
          {children}
        </div>
      )}
    </div>
  );
};

export default ParallaxBackground;
