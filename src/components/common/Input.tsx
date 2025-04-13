import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

const inputVariants = cva(
  'block w-full rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm',
  {
    variants: {
      variant: {
        default: 'border-gray-300',
        error: 'border-red-300 text-red-900 placeholder-red-300',
        success: 'border-green-300 text-green-900 placeholder-green-300',
      },
      size: {
        default: 'py-2 px-3',
        sm: 'py-1 px-2 text-xs',
        lg: 'py-3 px-4 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {
  label?: string;
  helperText?: string;
  errorText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    variant, 
    size, 
    label, 
    helperText, 
    errorText, 
    leftIcon, 
    rightIcon, 
    fullWidth = true,
    id,
    ...props 
  }, ref) => {
    // Generate a unique ID if one is not provided
    const inputId = id || `input-${Math.random().toString(36).substring(2, 9)}`;
    
    // Determine if we should show the error variant
    const inputVariant = errorText ? 'error' : variant;
    
    return (
      <div className={fullWidth ? 'w-full' : ''}>
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            className={inputVariants({ 
              variant: inputVariant, 
              size, 
              className: `${leftIcon ? 'pl-10' : ''} ${rightIcon ? 'pr-10' : ''} ${className || ''}` 
            })}
            ref={ref}
            aria-invalid={!!errorText}
            aria-describedby={errorText ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
            {...props}
          />
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              {rightIcon}
            </div>
          )}
        </div>
        {helperText && !errorText && (
          <p id={`${inputId}-helper`} className="mt-1 text-sm text-gray-500">
            {helperText}
          </p>
        )}
        {errorText && (
          <p id={`${inputId}-error`} className="mt-1 text-sm text-red-600">
            {errorText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input, inputVariants };
