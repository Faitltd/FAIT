import React, { ReactNode, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface FloatingSidebarProps {
  children: ReactNode;
  position?: 'left' | 'right';
}

const FloatingSidebar: React.FC<FloatingSidebarProps> = ({
  children,
  position = 'right'
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Show sidebar after scrolling one viewport height
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const viewportHeight = window.innerHeight;

      if (scrollY > viewportHeight) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={`fixed bottom-8 ${position === 'right' ? 'right-8' : 'left-8'} z-50`}
          initial={{ opacity: 0, y: 20 }}
          animate={{
            opacity: isHovered ? 1 : 0.7,
            y: 0,
            scale: isHovered ? 1 : 0.95
          }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className="bg-white/20 backdrop-blur-md rounded-xl shadow-lg p-4">
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FloatingSidebar;
