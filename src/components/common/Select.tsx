import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

const selectVariants = cva(
  'block w-full rounded-md shadow-sm focus:outline-none focus:ring-company-lightpink focus:border-company-lightpink sm:text-sm',
  {
    variants: {
      variant: {
        default: 'border-gray-300',
        error: 'border-red-300 text-red-900',
        success: 'border-green-300 text-green-900',
      },
      size: {
        default: 'py-2 pl-3 pr-10',
        sm: 'py-1 pl-2 pr-8 text-xs',
        lg: 'py-3 pl-4 pr-10 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface SelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'>,
    VariantProps<typeof selectVariants> {
  label?: string;
  helperText?: string;
  errorText?: string;
  options: SelectOption[];
  fullWidth?: boolean;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({
    className,
    variant,
    size,
    label,
    helperText,
    errorText,
    options,
    fullWidth = true,
    id,
    ...props
  }, ref) => {
    // Generate a unique ID if one is not provided
    const selectId = id || `select-${Math.random().toString(36).substring(2, 9)}`;

    // Determine if we should show the error variant
    const selectVariant = errorText ? 'error' : variant;

    return (
      <div className={fullWidth ? 'w-full' : ''}>
        {label && (
          <label htmlFor={selectId} className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            id={selectId}
            className={selectVariants({
              variant: selectVariant,
              size,
              className
            })}
            ref={ref}
            aria-invalid={!!errorText}
            aria-describedby={errorText ? `${selectId}-error` : helperText ? `${selectId}-helper` : undefined}
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
          <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
        {helperText && !errorText && (
          <p id={`${selectId}-helper`} className="mt-1 text-sm text-gray-500">
            {helperText}
          </p>
        )}
        {errorText && (
          <p id={`${selectId}-error`} className="mt-1 text-sm text-red-600">
            {errorText}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export { Select, selectVariants };
