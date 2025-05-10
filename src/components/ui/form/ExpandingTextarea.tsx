import React, { useRef, useEffect } from 'react';
import classNames from 'classnames';

export interface ExpandingTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  className?: string;
  inputClassName?: string;
  labelClassName?: string;
  minRows?: number;
  maxRows?: number;
}

const ExpandingTextarea = React.forwardRef<HTMLTextAreaElement, ExpandingTextareaProps>(
  ({ 
    label, 
    error, 
    helperText, 
    className = '', 
    inputClassName = '',
    labelClassName = '',
    minRows = 3,
    maxRows = 10,
    id,
    value,
    onChange,
    ...props 
  }, ref) => {
    const textareaId = id || `textarea-${Math.random().toString(36).substring(2, 9)}`;
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);
    
    // Combine refs
    const handleRef = (element: HTMLTextAreaElement) => {
      textareaRef.current = element;
      
      if (typeof ref === 'function') {
        ref(element);
      } else if (ref) {
        ref.current = element;
      }
    };
    
    // Adjust height based on content
    const adjustHeight = () => {
      const textarea = textareaRef.current;
      if (!textarea) return;
      
      // Reset height to calculate the right height
      textarea.style.height = 'auto';
      
      // Calculate the scrollHeight
      const lineHeight = parseInt(getComputedStyle(textarea).lineHeight) || 20;
      const minHeight = minRows * lineHeight;
      const maxHeight = maxRows * lineHeight;
      
      // Set the height based on scrollHeight, but within min/max constraints
      const newHeight = Math.min(Math.max(textarea.scrollHeight, minHeight), maxHeight);
      textarea.style.height = `${newHeight}px`;
      
      // Show/hide scrollbar based on content
      textarea.style.overflowY = textarea.scrollHeight > maxHeight ? 'auto' : 'hidden';
    };
    
    // Adjust height on mount and when value changes
    useEffect(() => {
      adjustHeight();
    }, [value]);
    
    // Handle change event
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (onChange) {
        onChange(e);
      }
      
      // Adjust height after change
      adjustHeight();
    };
    
    return (
      <div className={classNames('space-y-1', className)}>
        {label && (
          <label 
            htmlFor={textareaId} 
            className={classNames(
              'block text-sm font-medium text-gray-700',
              error ? 'text-red-500' : '',
              labelClassName
            )}
          >
            {label}
          </label>
        )}
        <textarea
          id={textareaId}
          ref={handleRef}
          value={value}
          onChange={handleChange}
          className={classNames(
            'block w-full rounded-md shadow-sm',
            error 
              ? 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500' 
              : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500',
            inputClassName
          )}
          aria-invalid={!!error}
          aria-describedby={
            error 
              ? `${textareaId}-error` 
              : helperText 
                ? `${textareaId}-description` 
                : undefined
          }
          rows={minRows}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-red-600" id={`${textareaId}-error`}>
            {error}
          </p>
        )}
        {helperText && !error && (
          <p className="mt-1 text-sm text-gray-500" id={`${textareaId}-description`}>
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

ExpandingTextarea.displayName = 'ExpandingTextarea';

export default ExpandingTextarea;
