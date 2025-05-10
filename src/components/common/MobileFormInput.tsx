import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface MobileFormInputProps {
  id: string;
  name: string;
  label: string;
  type?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  autoComplete?: string;
  min?: string | number;
  max?: string | number;
  pattern?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  helpText?: string;
}

/**
 * Mobile-optimized form input component with larger touch targets
 */
const MobileFormInput: React.FC<MobileFormInputProps> = ({
  id,
  name,
  label,
  type = 'text',
  value,
  onChange,
  onBlur,
  placeholder,
  error,
  required = false,
  disabled = false,
  className = '',
  autoComplete,
  min,
  max,
  pattern,
  icon,
  iconPosition = 'left',
  helpText,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isTouched, setIsTouched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Handle focus state
  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    setIsTouched(true);
    if (onBlur) {
      onBlur(e);
    }
  };

  // Focus input when clicking on the container
  const handleContainerClick = () => {
    if (inputRef.current && !disabled) {
      inputRef.current.focus();
    }
  };

  // Base container styles
  const containerStyles = `
    relative w-full rounded-lg transition-all duration-200
    ${isFocused ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}
    ${error ? 'border-red-500' : isFocused ? 'border-blue-500' : 'border-gray-300'}
    ${disabled ? 'bg-gray-100 opacity-75 cursor-not-allowed' : 'bg-white'}
    ${className}
  `;

  // Input styles with larger touch target for mobile
  const inputStyles = `
    block w-full px-4 py-3 text-base rounded-lg
    ${icon && iconPosition === 'left' ? 'pl-10' : ''}
    ${icon && iconPosition === 'right' ? 'pr-10' : ''}
    focus:outline-none focus:ring-0 focus:border-transparent
    disabled:bg-gray-100 disabled:cursor-not-allowed
    appearance-none
  `;

  // Label animation variants
  const labelVariants = {
    default: { 
      y: 0, 
      scale: 1, 
      color: error ? '#EF4444' : isFocused ? '#3B82F6' : '#6B7280' 
    },
    focused: { 
      y: -28, 
      scale: 0.85, 
      color: error ? '#EF4444' : isFocused ? '#3B82F6' : '#6B7280' 
    },
  };

  // Determine if label should be in focused position
  const isLabelFloating = isFocused || (value && value.length > 0);

  return (
    <div className="mb-4">
      <div 
        className={containerStyles}
        onClick={handleContainerClick}
      >
        {/* Floating label */}
        <motion.label
          htmlFor={id}
          className="absolute left-4 pointer-events-none origin-left transition-colors"
          initial={isLabelFloating ? 'focused' : 'default'}
          animate={isLabelFloating ? 'focused' : 'default'}
          variants={labelVariants}
          transition={{ duration: 0.2 }}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </motion.label>

        {/* Input field */}
        <input
          ref={inputRef}
          id={id}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={isFocused ? placeholder : ''}
          disabled={disabled}
          required={required}
          autoComplete={autoComplete}
          min={min}
          max={max}
          pattern={pattern}
          className={inputStyles}
          style={{ touchAction: 'manipulation' }}
        />

        {/* Icon */}
        {icon && (
          <div 
            className={`absolute top-1/2 transform -translate-y-1/2 text-gray-500
              ${iconPosition === 'left' ? 'left-3' : 'right-3'}`}
          >
            {icon}
          </div>
        )}
      </div>

      {/* Error message or help text */}
      <AnimatePresence>
        {error && isTouched ? (
          <motion.p
            className="mt-1 text-sm text-red-500"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            {error}
          </motion.p>
        ) : helpText && (
          <motion.p
            className="mt-1 text-sm text-gray-500"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            {helpText}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MobileFormInput;
