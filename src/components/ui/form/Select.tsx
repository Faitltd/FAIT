import React from 'react';
import classNames from 'classnames';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  label?: string;
  options: SelectOption[];
  error?: string;
  helperText?: string;
  onChange?: (value: string) => void;
  className?: string;
  selectClassName?: string;
  labelClassName?: string;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ 
    label, 
    options, 
    error, 
    helperText, 
    onChange, 
    className = '', 
    selectClassName = '',
    labelClassName = '',
    id,
    ...props 
  }, ref) => {
    const selectId = id || `select-${Math.random().toString(36).substring(2, 9)}`;
    
    // Handle change event
    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      if (onChange) {
        onChange(e.target.value);
      }
    };
    
    return (
      <div className={classNames('space-y-1', className)}>
        {label && (
          <label 
            htmlFor={selectId} 
            className={classNames(
              'block text-sm font-medium text-gray-700',
              error ? 'text-red-500' : '',
              labelClassName
            )}
          >
            {label}
          </label>
        )}
        <select
          id={selectId}
          onChange={handleChange}
          className={classNames(
            'block w-full rounded-md shadow-sm',
            error 
              ? 'border-red-300 text-red-900 focus:border-red-500 focus:ring-red-500' 
              : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500',
            selectClassName
          )}
          aria-invalid={!!error}
          aria-describedby={
            error 
              ? `${selectId}-error` 
              : helperText 
                ? `${selectId}-description` 
                : undefined
          }
          ref={ref}
          {...props}
        >
          {options.map((option) => (
            <option 
              key={option.value} 
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>
        {error && (
          <p className="mt-1 text-sm text-red-600" id={`${selectId}-error`}>
            {error}
          </p>
        )}
        {helperText && !error && (
          <p className="mt-1 text-sm text-gray-500" id={`${selectId}-description`}>
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;
