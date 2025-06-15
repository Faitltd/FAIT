import React, { useEffect, useState, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

interface ParallaxBackgroundProps {
  imageUrl: string;
  overlayColor?: string;
  speed?: number;
  height?: string;
  children?: React.ReactNode;
  className?: string;
}

const ParallaxBackground: React.FC<ParallaxBackgroundProps> = ({
  imageUrl,
  overlayColor = 'rgba(0, 0, 0, 0.4)',
  speed = 0.5,
  height = '60vh',
  children,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [elementTop, setElementTop] = useState(0);
  const { scrollY } = useScroll();

  useEffect(() => {
    if (containerRef.current) {
      const element = containerRef.current;
      const onResize = () => {
        setElementTop(element.getBoundingClientRect().top + window.scrollY || window.pageYOffset);
      };
      
      onResize();
      window.addEventListener('resize', onResize);
      
      return () => window.removeEventListener('resize', onResize);
    }
  }, [containerRef]);

  const y = useTransform(
    scrollY,
    [elementTop - 500, elementTop + 500],
    ['-10%', '10%']
  );

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      style={{ height }}
    >
      <motion.div
        className="absolute inset-0 w-full h-[120%] -top-[10%]"
        style={{
          y,
          backgroundImage: `url(${imageUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      
      {overlayColor && (
        <div
          className="absolute inset-0 w-full h-full"
          style={{ backgroundColor: overlayColor }}
        />
      )}
      
      <div className="relative z-10 h-full w-full">
        {children}
      </div>
    </div>
  );
};

export default ParallaxBackground;
