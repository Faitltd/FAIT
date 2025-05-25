import React from 'react';
import { Text } from '../ui';

interface ProjectProgressProps {
  progress: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

const ProjectProgress: React.FC<ProjectProgressProps> = ({ 
  progress, 
  size = 'md',
  showLabel = true,
  className = '' 
}) => {
  // Determine the size of the progress circle
  const sizeClasses = {
    sm: 'h-16 w-16',
    md: 'h-24 w-24',
    lg: 'h-32 w-32'
  };
  
  // Determine the font size for the percentage
  const fontSizeClasses = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl'
  };
  
  // Determine the stroke width
  const strokeWidth = {
    sm: 2,
    md: 3,
    lg: 4
  };
  
  // Calculate the circle properties
  const radius = size === 'sm' ? 16 : size === 'md' ? 24 : 32;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = `${(progress / 100) * circumference} ${circumference}`;
  
  // Determine the color based on progress
  const getProgressColor = () => {
    if (progress < 25) return '#ef4444'; // red-500
    if (progress < 50) return '#f97316'; // orange-500
    if (progress < 75) return '#eab308'; // yellow-500
    return '#22c55e'; // green-500
  };
  
  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className={`relative ${sizeClasses[size]}`}>
        <svg className="transform -rotate-90" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="#e5e7eb" // gray-200
            strokeWidth={strokeWidth[size]}
          />
          
          {/* Progress circle */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke={getProgressColor()}
            strokeWidth={strokeWidth[size]}
            strokeDasharray={strokeDasharray}
            strokeLinecap="round"
          />
        </svg>
        
        {/* Percentage text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Text weight="medium" className={fontSizeClasses[size]}>
            {progress}%
          </Text>
        </div>
      </div>
      
      {showLabel && (
        <Text variant="muted" className="mt-2">
          Project Progress
        </Text>
      )}
    </div>
  );
};

export default ProjectProgress;
