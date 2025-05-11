import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface InteractiveCardProps {
  children: ReactNode;
  className?: string;
  index?: number;
}

const InteractiveCard: React.FC<InteractiveCardProps> = ({ children, className = '', index = 0 }) => {
  return (
    <motion.div
      className={`rounded-lg overflow-hidden ${className}`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
    >
      {children}
    </motion.div>
  );
};

export default InteractiveCard;
