import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface SlideInViewProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  direction?: 'left' | 'right' | 'up' | 'down';
  className?: string;
}

/**
 * A component that slides in its children when they enter the viewport
 */
const SlideInView: React.FC<SlideInViewProps> = ({ 
  children, 
  delay = 0, 
  duration = 0.5,
  direction = 'up',
  className = '' 
}) => {
  // Determine initial position based on direction
  const getInitialPosition = () => {
    switch (direction) {
      case 'left':
        return { x: -50, y: 0 };
      case 'right':
        return { x: 50, y: 0 };
      case 'up':
        return { x: 0, y: -50 };
      case 'down':
        return { x: 0, y: 50 };
      default:
        return { x: 0, y: 50 };
    }
  };

  const initialPosition = getInitialPosition();

  return (
    <motion.div
      initial={{ opacity: 0, ...initialPosition }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ 
        duration: duration,
        delay: delay,
        ease: "easeOut"
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default SlideInView;
