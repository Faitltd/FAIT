import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

// Simulate a heavy component that takes time to render
const HeavyComponent: React.FC = () => {
  const [data, setData] = useState<Array<{ id: number; value: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate heavy computation and data loading
    const startTime = performance.now();
    
    // Artificially delay rendering to simulate a heavy component
    setTimeout(() => {
      // Generate some fake data
      const newData = Array.from({ length: 50 }, (_, index) => ({
        id: index,
        value: `Item ${index + 1} - ${Math.random().toString(36).substring(2, 8)}`,
      }));
      
      setData(newData);
      setIsLoading(false);
      
      const endTime = performance.now();
      console.log(`HeavyComponent rendered in ${endTime - startTime}ms`);
    }, 800);
  }, []);

  // Simulate heavy rendering
  const renderItems = () => {
    return data.map((item) => (
      <motion.div
        key={item.id}
        className="p-3 bg-white rounded-lg shadow-sm border border-gray-100 mb-2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: item.id * 0.02 }}
      >
        <div className="flex items-center justify-between">
          <span className="font-medium text-gray-700">#{item.id + 1}</span>
          <span className="text-gray-500 text-sm">{item.value}</span>
        </div>
      </motion.div>
    ));
  };

  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <h3 className="text-lg font-medium text-gray-800 mb-4">Heavy Component</h3>
      
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="h-12 bg-gray-200 animate-pulse rounded-lg"></div>
          ))}
        </div>
      ) : (
        <div className="max-h-80 overflow-y-auto pr-2">
          {renderItems()}
        </div>
      )}
      
      <div className="mt-4 pt-3 border-t border-gray-200 text-sm text-gray-500">
        This component simulates a heavy rendering process with 50 items and staggered animations.
      </div>
    </div>
  );
};

export default HeavyComponent;
