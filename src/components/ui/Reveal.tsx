import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';

type Direction = 'left' | 'right' | 'up' | 'down';

interface RevealProps {
  children: ReactNode;
  direction?: Direction;
  delay?: number;
  className?: string;
}

const Reveal: React.FC<RevealProps> = ({
  children,
  direction = 'up',
  delay = 0,
  className = '',
}) => {
  // Define initial and animate states based on direction
  const getInitialState = (dir: Direction) => {
    switch (dir) {
      case 'left':
        return { x: -50, opacity: 0 };
      case 'right':
        return { x: 50, opacity: 0 };
      case 'up':
        return { y: 50, opacity: 0 };
      case 'down':
        return { y: -50, opacity: 0 };
      default:
        return { y: 50, opacity: 0 };
    }
  };

  return (
    <motion.div
      initial={getInitialState(direction)}
      whileInView={{ x: 0, y: 0, opacity: 1 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{
        duration: 0.6,
        delay,
        ease: [0.25, 0.1, 0.25, 1.0], // Smooth easing
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default Reveal;
