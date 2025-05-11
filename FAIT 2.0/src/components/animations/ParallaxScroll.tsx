import React, { ReactNode } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

interface ParallaxScrollProps {
  children: ReactNode;
  speed?: number; // Positive values move down, negative values move up
  className?: string;
}

/**
 * A component that creates a parallax scrolling effect
 */
const ParallaxScroll: React.FC<ParallaxScrollProps> = ({ 
  children, 
  speed = 0.2,
  className = '' 
}) => {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 1000], [0, 1000 * speed]);

  return (
    <motion.div
      style={{ y }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default ParallaxScroll;
