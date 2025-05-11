import React from 'react';
import classNames from 'classnames';

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  description?: string;
  error?: string;
  className?: string;
  labelClassName?: string;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ 
    label, 
    description, 
    error, 
    className = '', 
    labelClassName = '',
    id,
    ...props 
  }, ref) => {
    const checkboxId = id || `checkbox-${Math.random().toString(36).substring(2, 9)}`;
    
    return (
      <div className={classNames('flex items-start', className)}>
        <div className="flex items-center h-5">
          <input
            id={checkboxId}
            type="checkbox"
            className={classNames(
              'h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500',
              error ? 'border-red-500' : ''
            )}
            ref={ref}
            {...props}
          />
        </div>
        {(label || description) && (
          <div className="ml-3 text-sm">
            {label && (
              <label 
                htmlFor={checkboxId} 
                className={classNames(
                  'font-medium text-gray-700', 
                  error ? 'text-red-500' : '',
                  labelClassName
                )}
              >
                {label}
              </label>
            )}
            {description && (
              <p className="text-gray-500">{description}</p>
            )}
            {error && (
              <p className="mt-1 text-sm text-red-600">{error}</p>
            )}
          </div>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export default Checkbox;
