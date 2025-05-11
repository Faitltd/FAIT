import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface TouchFriendlyButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  touchFeedback?: boolean;
  ariaLabel?: string;
}

/**
 * A button component optimized for touch interactions
 */
const TouchFriendlyButton: React.FC<TouchFriendlyButtonProps> = ({
  children,
  onClick,
  className = '',
  disabled = false,
  type = 'button',
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  icon,
  iconPosition = 'left',
  touchFeedback = true,
  ariaLabel,
}) => {
  const [isTouched, setIsTouched] = useState(false);

  // Base styles
  const baseStyles = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500';
  
  // Size styles
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-5 py-2.5 text-lg',
    xl: 'px-6 py-3 text-xl',
  };
  
  // Variant styles
  const variantStyles = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 active:bg-gray-400',
    outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50 active:bg-gray-100',
    ghost: 'text-gray-700 hover:bg-gray-100 active:bg-gray-200',
    danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800',
  };
  
  // Disabled styles
  const disabledStyles = 'opacity-50 cursor-not-allowed';
  
  // Full width style
  const fullWidthStyle = fullWidth ? 'w-full' : '';

  // Combine all styles
  const buttonStyles = `
    ${baseStyles}
    ${sizeStyles[size]}
    ${variantStyles[variant]}
    ${disabled ? disabledStyles : ''}
    ${fullWidthStyle}
    ${className}
  `;

  // Touch feedback animation variants
  const touchAnimationVariants = {
    idle: { scale: 1 },
    touched: { scale: 0.97 },
  };

  // Handle touch events
  const handleTouchStart = () => {
    if (!disabled && touchFeedback) {
      setIsTouched(true);
    }
  };

  const handleTouchEnd = () => {
    if (!disabled && touchFeedback) {
      setIsTouched(false);
    }
  };

  // Render button with or without icon
  const renderContent = () => {
    if (!icon) return children;

    return (
      <>
        {iconPosition === 'left' && <span className="mr-2">{icon}</span>}
        {children}
        {iconPosition === 'right' && <span className="ml-2">{icon}</span>}
      </>
    );
  };

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={buttonStyles}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      animate={isTouched ? 'touched' : 'idle'}
      variants={touchAnimationVariants}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      aria-label={ariaLabel}
      // Increase touch target size with padding
      style={{ 
        touchAction: 'manipulation',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      {renderContent()}
    </motion.button>
  );
};

export default TouchFriendlyButton;
