import React, { useEffect, useState } from 'react';
import { motion, useAnimation } from 'framer-motion';

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}

/**
 * A component that animates counting up to a value
 */
const AnimatedCounter: React.FC<AnimatedCounterProps> = ({ 
  value, 
  duration = 1.5,
  className = '',
  prefix = '',
  suffix = '',
  decimals = 0
}) => {
  const [displayValue, setDisplayValue] = useState(0);
  const controls = useAnimation();

  useEffect(() => {
    let startTimestamp: number | null = null;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / (duration * 1000), 1);
      const currentValue = progress * value;
      
      setDisplayValue(currentValue);
      
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    
    window.requestAnimationFrame(step);
    controls.start({ opacity: 1 });
    
    return () => {
      startTimestamp = null;
    };
  }, [value, duration, controls]);

  const formattedValue = displayValue.toFixed(decimals);

  return (
    <motion.span
      initial={{ opacity: 0 }}
      animate={controls}
      className={className}
    >
      {prefix}{formattedValue}{suffix}
    </motion.span>
  );
};

export default AnimatedCounter;
