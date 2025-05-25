/**
 * Button Component
 * 
 * A customizable button component.
 */

import React, { forwardRef } from 'react';
import {
  BaseComponentProps,
  WithChildrenProps,
  DisableableProps,
  LoadableProps,
  SizeableProps,
  VariantProps,
  OutlineableProps,
  RoundableProps,
  IconProps
} from '../../types';
import { composeClasses } from '../../utils';

export interface ButtonProps extends 
  BaseComponentProps,
  WithChildrenProps,
  DisableableProps,
  LoadableProps,
  SizeableProps,
  VariantProps,
  OutlineableProps,
  RoundableProps,
  IconProps,
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'size'> {
  /** Button type */
  type?: 'button' | 'submit' | 'reset';
  /** Full width button */
  fullWidth?: boolean;
}

/**
 * Button component
 * 
 * @example
 * ```tsx
 * <Button variant="primary" onClick={() => console.log('Clicked!')}>
 *   Click Me
 * </Button>
 * ```
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  className,
  style,
  children,
  disabled = false,
  loading = false,
  size = 'md',
  variant = 'primary',
  outline = false,
  rounded = false,
  icon,
  iconPosition = 'left',
  type = 'button',
  fullWidth = false,
  ...props
}, ref) => {
  // Compose button classes
  const buttonClasses = composeClasses(
    'btn',
    `btn-${outline ? 'outline-' : ''}${variant}`,
    `btn-${size}`,
    {
      'btn-rounded': rounded,
      'btn-loading': loading,
      'btn-icon-left': icon && iconPosition === 'left',
      'btn-icon-right': icon && iconPosition === 'right',
      'btn-block': fullWidth,
    },
    className
  );

  return (
    <button
      ref={ref}
      type={type}
      className={buttonClasses}
      style={style}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span className="btn-spinner">
          <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
          <span className="sr-only">Loading...</span>
        </span>
      )}
      
      {icon && iconPosition === 'left' && (
        <span className="btn-icon btn-icon-left">{icon}</span>
      )}
      
      {children && (
        <span className="btn-text">{children}</span>
      )}
      
      {icon && iconPosition === 'right' && (
        <span className="btn-icon btn-icon-right">{icon}</span>
      )}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;
