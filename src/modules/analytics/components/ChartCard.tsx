import React, { useEffect, useRef } from 'react';
import { Chart as ChartType } from '../../../types/analytics.types';
import Chart from 'chart.js/auto';

interface ChartCardProps {
  chart: ChartType;
  className?: string;
}

/**
 * Component to display a chart card
 */
const ChartCard: React.FC<ChartCardProps> = ({ 
  chart,
  className = ''
}) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    // Destroy previous chart instance if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    // Create new chart instance
    const ctx = chartRef.current.getContext('2d');
    if (ctx) {
      chartInstance.current = new Chart(ctx, {
        type: chart.type,
        data: chart.data,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top',
            },
            title: {
              display: false,
            },
            tooltip: {
              mode: 'index',
              intersect: false,
            },
          },
          ...chart.options
        }
      });
    }

    // Cleanup on unmount
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [chart]);

  return (
    <div className={`bg-white overflow-hidden shadow rounded-lg ${className}`}>
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">{chart.title}</h3>
        {chart.description && (
          <p className="mt-1 max-w-2xl text-sm text-gray-500">{chart.description}</p>
        )}
      </div>
      <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
        <div className="h-64">
          <canvas ref={chartRef}></canvas>
        </div>
      </div>
    </div>
  );
};

export default ChartCard;
