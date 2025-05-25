import React, { useState, useEffect } from 'react';
import classNames from 'classnames';

export interface RangeSliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label?: string;
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (value: number) => void;
  showValue?: boolean;
  valuePrefix?: string;
  valueSuffix?: string;
  className?: string;
  trackClassName?: string;
  thumbClassName?: string;
  labelClassName?: string;
}

const RangeSlider = React.forwardRef<HTMLInputElement, RangeSliderProps>(
  ({ 
    label, 
    min, 
    max, 
    step = 1, 
    value, 
    onChange, 
    showValue = true,
    valuePrefix = '',
    valueSuffix = '',
    className = '', 
    trackClassName = '',
    thumbClassName = '',
    labelClassName = '',
    id,
    ...props 
  }, ref) => {
    const [localValue, setLocalValue] = useState<number>(value);
    const sliderId = id || `slider-${Math.random().toString(36).substring(2, 9)}`;
    
    // Calculate the percentage for styling the track
    const percentage = ((localValue - min) / (max - min)) * 100;
    
    // Update local value when prop value changes
    useEffect(() => {
      setLocalValue(value);
    }, [value]);
    
    // Handle slider change
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = parseFloat(e.target.value);
      setLocalValue(newValue);
      onChange(newValue);
    };
    
    return (
      <div className={classNames('space-y-2', className)}>
        <div className="flex justify-between items-center">
          {label && (
            <label 
              htmlFor={sliderId} 
              className={classNames('block text-sm font-medium text-gray-700', labelClassName)}
            >
              {label}
            </label>
          )}
          {showValue && (
            <span className="text-sm text-gray-500">
              {valuePrefix}{localValue}{valueSuffix}
            </span>
          )}
        </div>
        <div className="relative">
          <input
            id={sliderId}
            type="range"
            min={min}
            max={max}
            step={step}
            value={localValue}
            onChange={handleChange}
            className={classNames(
              'w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer',
              trackClassName
            )}
            style={{
              background: `linear-gradient(to right, #4f46e5 0%, #4f46e5 ${percentage}%, #e5e7eb ${percentage}%, #e5e7eb 100%)`
            }}
            ref={ref}
            {...props}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500">
          <span>{valuePrefix}{min}{valueSuffix}</span>
          <span>{valuePrefix}{max}{valueSuffix}</span>
        </div>
      </div>
    );
  }
);

RangeSlider.displayName = 'RangeSlider';

export default RangeSlider;
