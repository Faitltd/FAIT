/**
 * Input Component
 * 
 * A customizable input component.
 */

import React, { forwardRef } from 'react';
import {
  BaseComponentProps,
  DisableableProps,
  SizeableProps,
  LabelableProps,
  PlaceholderProps,
  ErrorProps,
  HelpTextProps,
  ValidatableProps,
  FocusableProps,
  IconProps
} from '../../types';
import { composeClasses } from '../../utils';

export interface InputProps extends 
  BaseComponentProps,
  DisableableProps,
  SizeableProps,
  LabelableProps,
  PlaceholderProps,
  ErrorProps,
  HelpTextProps,
  ValidatableProps,
  FocusableProps,
  IconProps,
  Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Input type */
  type?: string;
  /** Input name */
  name?: string;
  /** Input value */
  value?: string | number;
  /** Default value */
  defaultValue?: string | number;
  /** Full width input */
  fullWidth?: boolean;
}

/**
 * Input component
 * 
 * @example
 * ```tsx
 * <Input
 *   label="Email"
 *   type="email"
 *   placeholder="Enter your email"
 *   required
 * />
 * ```
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(({
  className,
  style,
  disabled = false,
  size = 'md',
  label,
  hideLabel = false,
  placeholder,
  error,
  hasError = false,
  helpText,
  required = false,
  autoFocus = false,
  icon,
  iconPosition = 'left',
  type = 'text',
  name,
  value,
  defaultValue,
  fullWidth = false,
  onChange,
  onFocus,
  onBlur,
  ...props
}, ref) => {
  // Generate a unique ID for the input
  const id = name || `input-${Math.random().toString(36).substring(2, 9)}`;
  
  // Determine if the input has an error
  const showError = hasError || !!error;
  
  // Compose input classes
  const inputWrapperClasses = composeClasses(
    'input-wrapper',
    `input-${size}`,
    {
      'input-disabled': disabled,
      'input-error': showError,
      'input-with-icon': !!icon,
      'input-icon-left': icon && iconPosition === 'left',
      'input-icon-right': icon && iconPosition === 'right',
      'input-full-width': fullWidth,
    },
    className
  );
  
  const inputClasses = composeClasses(
    'form-control',
    {
      'is-invalid': showError,
    }
  );

  return (
    <div className={inputWrapperClasses} style={style}>
      {label && (
        <label 
          htmlFor={id}
          className={composeClasses('form-label', { 'sr-only': hideLabel })}
        >
          {label}
          {required && <span className="required-indicator">*</span>}
        </label>
      )}
      
      <div className="input-container">
        {icon && iconPosition === 'left' && (
          <span className="input-icon input-icon-left">{icon}</span>
        )}
        
        <input
          ref={ref}
          id={id}
          type={type}
          name={name}
          className={inputClasses}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          autoFocus={autoFocus}
          value={value}
          defaultValue={defaultValue}
          onChange={onChange}
          onFocus={onFocus}
          onBlur={onBlur}
          aria-invalid={showError}
          aria-describedby={showError ? `${id}-error` : helpText ? `${id}-help` : undefined}
          {...props}
        />
        
        {icon && iconPosition === 'right' && (
          <span className="input-icon input-icon-right">{icon}</span>
        )}
      </div>
      
      {showError && (
        <div id={`${id}-error`} className="invalid-feedback">
          {error}
        </div>
      )}
      
      {helpText && !showError && (
        <div id={`${id}-help`} className="form-text">
          {helpText}
        </div>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
