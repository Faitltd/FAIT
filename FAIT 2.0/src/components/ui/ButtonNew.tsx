import React from 'react';
import classNames from 'classnames';

type ButtonVariant = 
  | 'default'
  | 'destructive'
  | 'outline'
  | 'subtle'
  | 'ghost'
  | 'link'
  | 'success';

type ButtonSize = 'default' | 'sm' | 'lg' | 'icon';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  className?: string;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    children, 
    variant = 'default', 
    size = 'default', 
    fullWidth = false,
    isLoading = false,
    leftIcon,
    rightIcon,
    className = '',
    disabled,
    ...props 
  }, ref) => {
    // Base classes
    const baseClasses = 'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';
    
    // Variant classes
    const variantClasses = {
      default: 'bg-primary-500 text-white hover:bg-primary-600 focus:ring-primary-400',
      destructive: 'bg-error text-white hover:bg-red-700 focus:ring-red-500',
      outline: 'border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50 focus:ring-primary-400',
      subtle: 'bg-neutral-100 text-neutral-900 hover:bg-neutral-200 focus:ring-neutral-500',
      ghost: 'bg-transparent text-neutral-900 hover:bg-neutral-100 focus:ring-neutral-500',
      link: 'bg-transparent text-primary-500 hover:underline focus:ring-primary-400 p-0',
      success: 'bg-success text-white hover:bg-green-600 focus:ring-green-500',
    };
    
    // Size classes
    const sizeClasses = {
      default: 'h-10 py-2 px-4',
      sm: 'h-8 px-3 text-xs',
      lg: 'h-12 px-6 text-base',
      icon: 'h-10 w-10',
    };
    
    // Width classes
    const widthClasses = fullWidth ? 'w-full' : '';
    
    // Combined classes
    const classes = classNames(
      baseClasses,
      variantClasses[variant],
      sizeClasses[size],
      widthClasses,
      className
    );
    
    return (
      <button
        ref={ref}
        className={classes}
        disabled={isLoading || disabled}
        {...props}
      >
        {isLoading && (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        )}
        {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}
        {children}
        {!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
