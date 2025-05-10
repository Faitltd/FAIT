import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface ScaleInViewProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
}

/**
 * A component that scales in its children when they enter the viewport
 */
const ScaleInView: React.FC<ScaleInViewProps> = ({ 
  children, 
  delay = 0, 
  duration = 0.5,
  className = '' 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
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

export default ScaleInView;
