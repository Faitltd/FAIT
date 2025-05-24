/**
 * Heavy Component
 * 
 * This is a heavy component that is lazy loaded in the performance demo.
 */

import React, { useState, useEffect } from 'react';
import { trackMetric } from '../../modules/core/performance';

/**
 * Heavy Component
 */
const HeavyComponent: React.FC = () => {
  const [data, setData] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Simulate heavy initialization
  useEffect(() => {
    trackMetric('HeavyComponent Mount Start', performance.now(), 'custom', 'ms');
    
    // Simulate heavy computation
    setTimeout(() => {
      // Generate a large dataset
      const newData = Array.from({ length: 1000 }, (_, i) => {
        // Simulate complex calculation
        let result = 0;
        for (let j = 0; j < 10000; j++) {
          result += Math.sin(j * i) * Math.cos(j);
        }
        return result;
      });
      
      setData(newData);
      setIsLoading(false);
      
      trackMetric('HeavyComponent Mount End', performance.now(), 'custom', 'ms');
    }, 500);
  }, []);

  // Render a chart with the data
  const renderChart = () => {
    // Calculate chart dimensions
    const width = 400;
    const height = 200;
    const padding = 20;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;
    
    // Calculate min and max values
    const minValue = Math.min(...data);
    const maxValue = Math.max(...data);
    const valueRange = maxValue - minValue;
    
    // Generate path data
    const points = data.slice(0, 100).map((value, index) => {
      const x = padding + (index / 100) * chartWidth;
      const y = padding + chartHeight - ((value - minValue) / valueRange) * chartHeight;
      return `${x},${y}`;
    });
    
    return (
      <svg width={width} height={height} style={{ border: '1px solid #ccc' }}>
        {/* X and Y axes */}
        <line
          x1={padding}
          y1={height - padding}
          x2={width - padding}
          y2={height - padding}
          stroke="#333"
          strokeWidth={1}
        />
        <line
          x1={padding}
          y1={padding}
          x2={padding}
          y2={height - padding}
          stroke="#333"
          strokeWidth={1}
        />
        
        {/* Data points */}
        <polyline
          points={points.join(' ')}
          fill="none"
          stroke="#0066cc"
          strokeWidth={2}
        />
        
        {/* Data points */}
        {data.slice(0, 100).map((value, index) => {
          const x = padding + (index / 100) * chartWidth;
          const y = padding + chartHeight - ((value - minValue) / valueRange) * chartHeight;
          
          return (
            <circle
              key={index}
              cx={x}
              cy={y}
              r={3}
              fill="#0066cc"
            />
          );
        })}
      </svg>
    );
  };

  return (
    <div className="heavy-component">
      <h3>Heavy Component</h3>
      
      {isLoading ? (
        <div className="loading">
          <p>Loading heavy component...</p>
          <div className="spinner"></div>
        </div>
      ) : (
        <div className="chart-container">
          <p>Rendered chart with 1000 data points (showing first 100)</p>
          {renderChart()}
          <p>
            <small>
              This component simulates a heavy component with complex calculations
              and rendering. It's lazy loaded to improve initial page load performance.
            </small>
          </p>
        </div>
      )}
    </div>
  );
};

export default HeavyComponent;
