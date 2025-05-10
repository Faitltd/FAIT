import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

interface ParallaxLayersProps {
  className?: string;
  layers?: {
    image: string;
    speed: number;
    zIndex?: number;
    opacity?: number;
  }[];
}

// Default layers to use when none are provided
const defaultLayers = [
  {
    image: '/images/parallax/layer1.png',
    speed: 0.2,
    opacity: 0.1,
    zIndex: 1
  },
  {
    image: '/images/parallax/layer2.png',
    speed: 0.4,
    opacity: 0.15,
    zIndex: 2
  }
];

const ParallaxLayers: React.FC<ParallaxLayersProps> = ({
  className = '',
  layers = defaultLayers
}) => {
  const { scrollY } = useScroll();

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {layers && layers.map((layer, index) => {
        const y = useTransform(scrollY, [0, 1000], [0, 1000 * layer.speed]);

        return (
          <motion.div
            key={index}
            className="absolute inset-0 w-full h-full"
            style={{
              y,
              zIndex: layer.zIndex || index,
              opacity: layer.opacity !== undefined ? layer.opacity : 1,
              backgroundImage: `url(${layer.image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
        );
      })}
    </div>
  );
};

export default ParallaxLayers;