import React, { useState } from 'react';
import { motion } from 'framer-motion';

/**
 * FAIT Co-op Logo Animation Component
 *
 * A component that animates the FAIT Co-op logo.
 */
const SimpleMotionTest: React.FC = () => {
  const [isAnimating, setIsAnimating] = useState(false);

  return (
    <div className="p-8 bg-white rounded-lg shadow-md">
      <h3 className="text-xl font-semibold mb-4">FAIT Co-op Interactive Logo</h3>

      <div className="flex items-center justify-center mb-4">
        <motion.div
          className="w-32 h-32 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-2xl"
          animate={{
            x: isAnimating ? 50 : 0,
            rotate: isAnimating ? 360 : 0,
            scale: isAnimating ? 1.2 : 1,
            backgroundColor: isAnimating ? "#4f46e5" : "#2563eb"
          }}
          transition={{
            duration: 0.8,
            ease: "easeInOut"
          }}
        >
          FAIT
        </motion.div>
      </div>

      <button
        onClick={() => setIsAnimating(!isAnimating)}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 w-full"
      >
        {isAnimating ? 'Reset Logo' : 'Animate Logo'}
      </button>

      <p className="mt-4 text-sm text-gray-600">
        Click the button to see our interactive FAIT Co-op logo animation.
      </p>
    </div>
  );
};

export default SimpleMotionTest;
