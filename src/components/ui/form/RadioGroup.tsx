import React from 'react';
import classNames from 'classnames';

export interface RadioOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

export interface RadioGroupProps {
  label?: string;
  name: string;
  options: RadioOption[];
  value: string;
  onChange: (value: string) => void;
  error?: string;
  helperText?: string;
  className?: string;
  radioClassName?: string;
  labelClassName?: string;
  inline?: boolean;
}

const RadioGroup: React.FC<RadioGroupProps> = ({
  label,
  name,
  options,
  value,
  onChange,
  error,
  helperText,
  className = '',
  radioClassName = '',
  labelClassName = '',
  inline = false,
}) => {
  const groupId = `radio-group-${Math.random().toString(36).substring(2, 9)}`;
  
  // Handle change event
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };
  
  return (
    <div className={classNames('space-y-2', className)}>
      {label && (
        <label 
          className={classNames(
            'block text-sm font-medium text-gray-700',
            error ? 'text-red-500' : '',
            labelClassName
          )}
        >
          {label}
        </label>
      )}
      <div 
        className={classNames(
          'space-y-4',
          inline ? 'sm:flex sm:items-center sm:space-x-10 sm:space-y-0' : ''
        )}
        role="radiogroup"
        aria-labelledby={label ? groupId : undefined}
      >
        {options.map((option) => {
          const optionId = `${name}-${option.value}`;
          
          return (
            <div 
              key={option.value} 
              className={classNames(
                'relative flex items-start',
                radioClassName
              )}
            >
              <div className="flex items-center h-5">
                <input
                  id={optionId}
                  name={name}
                  type="radio"
                  value={option.value}
                  checked={value === option.value}
                  onChange={handleChange}
                  disabled={option.disabled}
                  className={classNames(
                    'h-4 w-4 border-gray-300 text-primary-600 focus:ring-primary-500',
                    error ? 'border-red-300 text-red-600 focus:ring-red-500' : ''
                  )}
                />
              </div>
              <div className="ml-3 text-sm">
                <label 
                  htmlFor={optionId} 
                  className={classNames(
                    'font-medium text-gray-700',
                    option.disabled ? 'text-gray-400' : '',
                    error ? 'text-red-500' : ''
                  )}
                >
                  {option.label}
                </label>
                {option.description && (
                  <p className={classNames(
                    'text-gray-500',
                    option.disabled ? 'text-gray-400' : ''
                  )}>
                    {option.description}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500">
          {helperText}
        </p>
      )}
    </div>
  );
};

export default RadioGroup;
