import React, { ReactNode } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

interface ParallaxSectionProps {
  children: ReactNode;
  backgroundImage?: string;
  overlayColor?: string;
  speed?: number;
  className?: string;
  contentClassName?: string;
  minHeight?: string;
}

/**
 * A component that creates a parallax section with background image and content
 */
const ParallaxSection: React.FC<ParallaxSectionProps> = ({
  children,
  backgroundImage,
  overlayColor = 'rgba(0, 0, 0, 0.4)',
  speed = 0.2,
  className = '',
  contentClassName = '',
  minHeight = '60vh'
}) => {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 1000], [0, 1000 * speed]);

  return (
    <div 
      className={`relative overflow-hidden ${className}`}
      style={{ minHeight }}
    >
      {backgroundImage && (
        <motion.div
          className="absolute inset-0 w-full h-full"
          style={{
            y,
            backgroundImage: `url(${backgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
      )}
      
      {/* Overlay */}
      {overlayColor && (
        <div 
          className="absolute inset-0 w-full h-full" 
          style={{ backgroundColor: overlayColor }}
        />
      )}
      
      {/* Content */}
      <div className={`relative z-10 h-full ${contentClassName}`}>
        {children}
      </div>
    </div>
  );
};

export default ParallaxSection;
